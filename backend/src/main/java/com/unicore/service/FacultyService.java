package com.unicore.service;

import com.unicore.dto.request.AttendanceSubmitRequest;
import com.unicore.dto.request.CreateAssessmentRequest;
import com.unicore.dto.request.MarkEntryRequest;
import com.unicore.dto.response.AssessmentMarkResponse;
import com.unicore.dto.response.AssessmentResponse;
import com.unicore.dto.response.AttendanceEntryResponse;
import com.unicore.dto.response.CourseSummaryResponse;
import com.unicore.dto.response.EnrolledStudentResponse;
import com.unicore.dto.response.FacultyCourseResponse;
import com.unicore.dto.response.FacultyCourseRosterResponse;
import com.unicore.dto.response.FacultyProfileResponse;
import com.unicore.dto.response.MessageResponse;
import com.unicore.dto.response.StudentProfileResponse;
import com.unicore.entity.*;
import com.unicore.exception.BadRequestException;
import com.unicore.exception.ForbiddenException;
import com.unicore.exception.ResourceNotFoundException;
import com.unicore.repository.*;
import com.unicore.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final UserRepository userRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentMarkRepository assessmentMarkRepository;

    public FacultyService(FacultyProfileRepository facultyProfileRepository,
                          StudentProfileRepository studentProfileRepository,
                          CourseRepository courseRepository,
                          EnrollmentRepository enrollmentRepository,
                          AttendanceRecordRepository attendanceRecordRepository,
                          UserRepository userRepository,
                          AssessmentRepository assessmentRepository,
                          AssessmentMarkRepository assessmentMarkRepository) {
        this.facultyProfileRepository = facultyProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.userRepository = userRepository;
        this.assessmentRepository = assessmentRepository;
        this.assessmentMarkRepository = assessmentMarkRepository;
    }

    @Transactional(readOnly = true)
    public FacultyProfileResponse getMyProfile(UserPrincipal principal) {
        FacultyProfile profile = facultyProfileRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user id: " + principal.getId()));
        return new FacultyProfileResponse(profile.getFacultyId(), profile.getDepartment());
    }

    /**
     * Retrieves all courses assigned to the currently authenticated faculty member.
     */
    @Transactional(readOnly = true)
    public List<FacultyCourseResponse> getMyAssignedCourses(UserPrincipal principal) {
        List<Course> courses = courseRepository.findByInstructorId(principal.getId());
        return courses.stream().map(c -> {
            long enrolledCount = enrollmentRepository.countByCourseId(c.getId());
            return new FacultyCourseResponse(
                    c.getId(),
                    c.getCourseCode(),
                    c.getCourseName(),
                    c.getDepartment(),
                    c.getSemester(),
                    c.getCredits(),
                    (int) enrolledCount
            );
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves the enrolled students (roster) for a specific course assigned to the faculty member.
     * Enforces strict instructor ownership checks (403 if not assigned).
     */
    @Transactional(readOnly = true)
    public FacultyCourseRosterResponse getCourseRoster(Long courseId, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '" + course.getCourseCode() + "'.");
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<EnrolledStudentResponse> studentResponses = enrollments.stream().map(e -> {
            User studentUser = e.getStudent();
            StudentProfile sp = studentUser.getStudentProfile();
            String studentId = sp != null ? sp.getStudentId() : "";

            long totalClasses = attendanceRecordRepository.countByStudentIdAndCourseId(studentUser.getId(), course.getId());
            Double attendancePercent = null;
            if (totalClasses > 0) {
                long present = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(studentUser.getId(), course.getId(), AttendanceStatus.PRESENT);
                long late = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(studentUser.getId(), course.getId(), AttendanceStatus.LATE);
                attendancePercent = Math.round(((double) (present + late) / totalClasses * 100.0) * 10.0) / 10.0;
            }

            return new EnrolledStudentResponse(
                    e.getId(),
                    studentId,
                    studentUser.getName(),
                    studentUser.getEmail(),
                    studentUser.getDepartment(),
                    e.getSemester(),
                    e.getAcademicYear(),
                    e.getGrade(),
                    e.getGradePoints(),
                    attendancePercent
            );
        }).collect(Collectors.toList());

        return new FacultyCourseRosterResponse(
                course.getId(),
                course.getCourseCode(),
                course.getCourseName(),
                course.getDepartment(),
                course.getSemester(),
                course.getCredits(),
                studentResponses.size(),
                studentResponses
        );
    }

    /**
     * Enforces Department Isolation:
     * Faculty members can only query or manage data belonging to their own department.
     */
    @Transactional(readOnly = true)
    public List<StudentProfileResponse> getStudentsByDepartment(String requestedDepartment, UserPrincipal principal) {
        if (principal.getRole() == Role.FACULTY) {
            if (!principal.getDepartment().equalsIgnoreCase(requestedDepartment)) {
                throw new ForbiddenException("Access Denied: Faculty members are restricted to their assigned department ('"
                        + principal.getDepartment() + "') and cannot access department '" + requestedDepartment + "'.");
            }
        }

        List<StudentProfile> students = studentProfileRepository.findByUserDepartment(requestedDepartment);
        return students.stream()
                .map(sp -> new StudentProfileResponse(
                        sp.getStudentId(),
                        sp.getAdmissionYear(),
                        sp.getCurrentSemester(),
                        sp.getDerivedYear()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves the attendance grid for a specific course on a given date.
     * Returns one entry per enrolled student, with status=null if no record exists for that date.
     * Enforces strict instructor ownership.
     */
    @Transactional(readOnly = true)
    public List<AttendanceEntryResponse> getAttendanceForDate(Long courseId, LocalDate date, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '" + course.getCourseCode() + "'.");
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<AttendanceRecord> existingRecords = attendanceRecordRepository.findByCourseIdAndDate(courseId, date);

        Map<Long, AttendanceStatus> statusMap = existingRecords.stream()
                .collect(Collectors.toMap(r -> r.getStudent().getId(), AttendanceRecord::getStatus));

        return enrollments.stream().map(e -> {
            User studentUser = e.getStudent();
            StudentProfile sp = studentUser.getStudentProfile();
            String rollNumber = sp != null ? sp.getStudentId() : "";
            AttendanceStatus status = statusMap.getOrDefault(studentUser.getId(), null);
            return new AttendanceEntryResponse(studentUser.getId(), rollNumber, studentUser.getName(), status);
        }).collect(Collectors.toList());
    }

    /**
     * Submits/updates attendance for a batch of students on a given date for a specific course.
     * Validates instructor ownership and student enrollment before persisting.
     * Uses upsert logic: updates existing records, creates new ones.
     */
    @Transactional
    public MessageResponse submitAttendance(Long courseId, AttendanceSubmitRequest request, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '" + course.getCourseCode() + "'.");
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        Map<Long, Enrollment> enrollmentMap = enrollments.stream()
                .collect(Collectors.toMap(e -> e.getStudent().getId(), e -> e));

        List<AttendanceRecord> recordsToSave = new ArrayList<>();

        for (AttendanceSubmitRequest.AttendanceEntry entry : request.getEntries()) {
            if (!enrollmentMap.containsKey(entry.getStudentId())) {
                throw new BadRequestException("Student with user ID " + entry.getStudentId()
                        + " is not enrolled in course '" + course.getCourseCode() + "'.");
            }

            User studentUser = userRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + entry.getStudentId()));

            Optional<AttendanceRecord> existingRecord = attendanceRecordRepository
                    .findByStudentIdAndCourseIdAndDate(entry.getStudentId(), courseId, request.getDate());

            if (existingRecord.isPresent()) {
                AttendanceRecord record = existingRecord.get();
                record.setStatus(entry.getStatus());
                recordsToSave.add(record);
            } else {
                AttendanceRecord newRecord = new AttendanceRecord(studentUser, course, request.getDate(), entry.getStatus());
                recordsToSave.add(newRecord);
            }
        }

        attendanceRecordRepository.saveAll(recordsToSave);

        return new MessageResponse("Attendance saved successfully for " + recordsToSave.size()
                + " student(s) on " + request.getDate() + ".");
    }

    // ================================================================
    //  Part 5.4 — Assessment & Grading Engine
    // ================================================================

    /**
     * Creates a new assessment (e.g. midterm, assignment) for a course.
     * Enforces strict instructor ownership.
     */
    @Transactional
    public AssessmentResponse createAssessment(Long courseId, CreateAssessmentRequest request,
                                               UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '"
                        + course.getCourseCode() + "'.");
            }
        }

        boolean isPublished = Boolean.TRUE.equals(request.getPublished());
        Assessment assessment = new Assessment(
                course,
                request.getTitle(),
                request.getType(),
                request.getMaxMarks(),
                request.getWeightage(),
                isPublished
        );
        assessment = assessmentRepository.save(assessment);

        return toAssessmentResponse(assessment);
    }

    /**
     * Publishes or unpublishes an assessment so students can view evaluated marks.
     */
    @Transactional
    public AssessmentResponse publishAssessment(Long courseId, Long assessmentId, Boolean published, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '"
                        + course.getCourseCode() + "'.");
            }
        }

        Assessment assessment = assessmentRepository.findByCourseIdAndId(courseId, assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assessment not found with id: " + assessmentId + " for course: " + courseId));

        assessment.setPublished(published != null ? published : true);
        assessment = assessmentRepository.save(assessment);
        return toAssessmentResponse(assessment);
    }

    /**
     * Returns all assessments for a specific course.
     * Enforces instructor ownership.
     */
    @Transactional(readOnly = true)
    public List<AssessmentResponse> getCourseAssessments(Long courseId, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '"
                        + course.getCourseCode() + "'.");
            }
        }

        return assessmentRepository.findByCourseId(courseId).stream()
                .map(this::toAssessmentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns the mark sheet for a specific assessment — one row per enrolled student.
     * Students not yet graded have marksObtained = null.
     */
    @Transactional(readOnly = true)
    public List<AssessmentMarkResponse> getAssessmentMarks(Long courseId, Long assessmentId,
                                                           UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '"
                        + course.getCourseCode() + "'.");
            }
        }

        Assessment assessment = assessmentRepository.findByCourseIdAndId(courseId, assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assessment not found with id: " + assessmentId + " for course: " + courseId));

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<AssessmentMark> existingMarks = assessmentMarkRepository.findByAssessmentId(assessmentId);
        Map<Long, AssessmentMark> markMap = existingMarks.stream()
                .collect(Collectors.toMap(m -> m.getStudent().getId(), m -> m));

        return enrollments.stream().map(e -> {
            User studentUser = e.getStudent();
            StudentProfile sp = studentUser.getStudentProfile();
            String rollNo = sp != null ? sp.getStudentId() : "";
            AssessmentMark mark = markMap.get(studentUser.getId());
            Double marksObtained = mark != null ? mark.getMarksObtained() : null;
            java.time.LocalDateTime gradedAt = mark != null ? mark.getGradedAt() : null;
            return new AssessmentMarkResponse(
                    assessment.getId(), assessment.getTitle(),
                    studentUser.getId(), rollNo, studentUser.getName(),
                    marksObtained, assessment.getMaxMarks(), gradedAt
            );
        }).collect(Collectors.toList());
    }

    /**
     * Submits or updates marks for a batch of students on a given assessment.
     * Validates instructor ownership and student enrollment.
     * Uses upsert logic.
     */
    @Transactional
    public MessageResponse submitMarks(Long courseId, Long assessmentId,
                                      MarkEntryRequest request, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '"
                        + course.getCourseCode() + "'.");
            }
        }

        Assessment assessment = assessmentRepository.findByCourseIdAndId(courseId, assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assessment not found with id: " + assessmentId + " for course: " + courseId));

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        Map<Long, Enrollment> enrollmentMap = enrollments.stream()
                .collect(Collectors.toMap(e -> e.getStudent().getId(), e -> e, (e1, e2) -> e1));

        List<AssessmentMark> marksToSave = new ArrayList<>();

        for (MarkEntryRequest.MarkEntry entry : request.getEntries()) {
            Long studentUserId = entry.getStudentUserId() != null ? entry.getStudentUserId() : entry.getStudentId();
            if (studentUserId == null && entry.getStudentRegistrationNumber() != null) {
                for (Enrollment en : enrollments) {
                    StudentProfile sp = en.getStudent().getStudentProfile();
                    if (sp != null && entry.getStudentRegistrationNumber().equalsIgnoreCase(sp.getStudentId())) {
                        studentUserId = en.getStudent().getId();
                        break;
                    }
                }
            }

            if (studentUserId == null || !enrollmentMap.containsKey(studentUserId)) {
                throw new BadRequestException("Student with user ID " + (studentUserId != null ? studentUserId : entry.getStudentRegistrationNumber())
                        + " is not enrolled in course '" + course.getCourseCode() + "'.");
            }

            if (entry.getMarksObtained() != null) {
                if (entry.getMarksObtained() < 0) {
                    throw new BadRequestException("Marks obtained cannot be negative.");
                }
                if (entry.getMarksObtained() > assessment.getMaxMarks()) {
                    throw new BadRequestException("Marks " + entry.getMarksObtained()
                            + " exceed maximum allowed marks " + assessment.getMaxMarks()
                            + " for assessment '" + assessment.getTitle() + "'.");
                }
            }

            final Long finalStudentUserId = studentUserId;
            User studentUser = userRepository.findById(finalStudentUserId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found with id: " + finalStudentUserId));

            Optional<AssessmentMark> existing =
                    assessmentMarkRepository.findByAssessmentIdAndStudentId(assessmentId, finalStudentUserId);

            if (existing.isPresent()) {
                AssessmentMark mark = existing.get();
                mark.setMarksObtained(entry.getMarksObtained());
                marksToSave.add(mark);
            } else {
                marksToSave.add(new AssessmentMark(assessment, studentUser, entry.getMarksObtained()));
            }
        }

        assessmentMarkRepository.saveAll(marksToSave);
        return new MessageResponse("Marks saved successfully for " + marksToSave.size()
                + " student(s) in assessment '" + assessment.getTitle() + "'.");
    }

    /**
     * Calculates the weighted grade for each enrolled student based on all assessments.
     * Writes the resulting letter grade and grade points back to the Enrollment record.
     * Returns a full CourseSummaryResponse for confirmation display.
     *
     * Grade Scale (Indian university standard):
     *   >= 90% → O   (10.0)
     *   >= 80% → A+  (9.0)
     *   >= 70% → A   (8.0)
     *   >= 60% → B+  (7.0)
     *   >= 50% → B   (6.0)
     *   >= 40% → C   (5.0)
     *   <  40% → F   (0.0)
     */
    @Transactional
    public CourseSummaryResponse calculateAndPublishGrades(Long courseId, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '"
                        + course.getCourseCode() + "'.");
            }
        }

        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
        if (assessments.isEmpty()) {
            throw new BadRequestException(
                    "No assessments found for course '" + course.getCourseCode()
                    + "'. Create at least one assessment before calculating grades.");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<CourseSummaryResponse.StudentGradeSummary> summaries = new ArrayList<>();

        for (Enrollment enrollment : enrollments) {
            User studentUser = enrollment.getStudent();
            StudentProfile sp = studentUser.getStudentProfile();
            String rollNo = sp != null ? sp.getStudentId() : "";

            List<AssessmentMark> marks =
                    assessmentMarkRepository.findByAssessment_CourseIdAndStudentId(courseId, studentUser.getId());
            Map<Long, Double> markByAssessmentId = marks.stream()
                    .filter(m -> m.getMarksObtained() != null)
                    .collect(Collectors.toMap(m -> m.getAssessment().getId(), AssessmentMark::getMarksObtained, (m1, m2) -> m2));

            // Compute weighted average over assessments that have a mark
            double totalWeight = 0.0;
            double weightedScore = 0.0;
            List<CourseSummaryResponse.AssessmentScore> scores = new ArrayList<>();

            for (Assessment a : assessments) {
                Double marksObtained = markByAssessmentId.get(a.getId());
                scores.add(new CourseSummaryResponse.AssessmentScore(
                        a.getId(), a.getTitle(), marksObtained, a.getMaxMarks(), a.getWeightage()));

                if (marksObtained != null && a.getMaxMarks() > 0) {
                    double pct = marksObtained / a.getMaxMarks() * 100.0;
                    weightedScore += pct * a.getWeightage();
                    totalWeight += a.getWeightage();
                }
            }

            Double weightedPercentage = null;
            String letterGrade = null;
            Double gradePoints = null;

            if (totalWeight > 0) {
                weightedPercentage = Math.round((weightedScore / totalWeight) * 10.0) / 10.0;
                letterGrade = computeLetterGrade(weightedPercentage);
                gradePoints = computeGradePoints(weightedPercentage);
            }

            // Write back to enrollment
            enrollment.setGrade(letterGrade);
            enrollment.setGradePoints(gradePoints);

            summaries.add(new CourseSummaryResponse.StudentGradeSummary(
                    studentUser.getId(), rollNo, studentUser.getName(),
                    weightedPercentage, letterGrade, gradePoints, scores));
        }

        for (Assessment a : assessments) {
            a.setPublished(true);
        }
        assessmentRepository.saveAll(assessments);

        enrollmentRepository.saveAll(enrollments);

        int totalCount = summaries.size();
        int gradedCount = (int) summaries.stream()
                .filter(s -> s.getComputedGrade() != null && !s.getComputedGrade().isBlank())
                .count();

        CourseSummaryResponse response = new CourseSummaryResponse(
                course.getId(), course.getCourseCode(), course.getCourseName(), summaries);
        response.setTotalStudents(totalCount);
        response.setGradedStudents(gradedCount);
        return response;
    }

    /**
     * Retrieves the current grade summary for a course without re-calculating or mutating enrollments.
     */
    @Transactional(readOnly = true)
    public CourseSummaryResponse getCourseGradeSummary(Long courseId, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '"
                        + course.getCourseCode() + "'.");
            }
        }

        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<CourseSummaryResponse.StudentGradeSummary> summaries = new ArrayList<>();

        for (Enrollment enrollment : enrollments) {
            User studentUser = enrollment.getStudent();
            StudentProfile sp = studentUser.getStudentProfile();
            String rollNo = sp != null ? sp.getStudentId() : "";

            List<AssessmentMark> marks =
                    assessmentMarkRepository.findByAssessment_CourseIdAndStudentId(courseId, studentUser.getId());
            Map<Long, Double> markByAssessmentId = marks.stream()
                    .filter(m -> m.getMarksObtained() != null)
                    .collect(Collectors.toMap(m -> m.getAssessment().getId(), AssessmentMark::getMarksObtained, (m1, m2) -> m2));

            double totalWeight = 0.0;
            double weightedScore = 0.0;
            List<CourseSummaryResponse.AssessmentScore> scores = new ArrayList<>();

            for (Assessment a : assessments) {
                Double marksObtained = markByAssessmentId.get(a.getId());
                scores.add(new CourseSummaryResponse.AssessmentScore(
                        a.getId(), a.getTitle(), marksObtained, a.getMaxMarks(), a.getWeightage()));

                if (marksObtained != null && a.getMaxMarks() > 0) {
                    double pct = marksObtained / a.getMaxMarks() * 100.0;
                    weightedScore += pct * a.getWeightage();
                    totalWeight += a.getWeightage();
                }
            }

            Double weightedPercentage = null;
            String letterGrade = enrollment.getGrade();
            Double gradePoints = enrollment.getGradePoints();

            if (totalWeight > 0) {
                weightedPercentage = Math.round((weightedScore / totalWeight) * 10.0) / 10.0;
                if (letterGrade == null) {
                    letterGrade = computeLetterGrade(weightedPercentage);
                    gradePoints = computeGradePoints(weightedPercentage);
                }
            }

            summaries.add(new CourseSummaryResponse.StudentGradeSummary(
                    studentUser.getId(), rollNo, studentUser.getName(),
                    weightedPercentage, letterGrade, gradePoints, scores));
        }

        int totalCount = summaries.size();
        int gradedCount = (int) summaries.stream()
                .filter(s -> s.getComputedGrade() != null && !s.getComputedGrade().isBlank())
                .count();

        CourseSummaryResponse response = new CourseSummaryResponse(
                course.getId(), course.getCourseCode(), course.getCourseName(), summaries);
        response.setTotalStudents(totalCount);
        response.setGradedStudents(gradedCount);
        return response;
    }

    // ----------------------------------------------------------------
    //  Private helpers
    // ----------------------------------------------------------------

    private AssessmentResponse toAssessmentResponse(Assessment a) {
        return new AssessmentResponse(
                a.getId(),
                a.getCourse().getId(),
                a.getCourse().getCourseCode(),
                a.getCourse().getCourseName(),
                a.getTitle(),
                a.getType(),
                a.getMaxMarks(),
                a.getWeightage(),
                a.getPublished(),
                a.getCreatedAt()
        );
    }

    private String computeLetterGrade(double pct) {
        if (pct >= 90) return "O";
        if (pct >= 80) return "A+";
        if (pct >= 70) return "A";
        if (pct >= 60) return "B+";
        if (pct >= 50) return "B";
        if (pct >= 40) return "C";
        return "F";
    }

    private Double computeGradePoints(double pct) {
        if (pct >= 90) return 10.0;
        if (pct >= 80) return 9.0;
        if (pct >= 70) return 8.0;
        if (pct >= 60) return 7.0;
        if (pct >= 50) return 6.0;
        if (pct >= 40) return 5.0;
        return 0.0;
    }
}

