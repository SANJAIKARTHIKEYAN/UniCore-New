package com.unicore.service;

import com.unicore.dto.response.*;
import com.unicore.entity.*;
import com.unicore.exception.ForbiddenException;
import com.unicore.exception.ResourceNotFoundException;
import com.unicore.repository.*;
import com.unicore.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final DocumentRepository documentRepository;
    private final NotificationRepository notificationRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentMarkRepository assessmentMarkRepository;

    public StudentService(StudentProfileRepository studentProfileRepository,
                          EnrollmentRepository enrollmentRepository,
                          AttendanceRecordRepository attendanceRecordRepository,
                          FeeRecordRepository feeRecordRepository,
                          DocumentRepository documentRepository,
                          NotificationRepository notificationRepository,
                          AssessmentRepository assessmentRepository,
                          AssessmentMarkRepository assessmentMarkRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.feeRecordRepository = feeRecordRepository;
        this.documentRepository = documentRepository;
        this.notificationRepository = notificationRepository;
        this.assessmentRepository = assessmentRepository;
        this.assessmentMarkRepository = assessmentMarkRepository;
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getMyProfile(UserPrincipal principal) {
        StudentProfile profile = getProfileOrThrow(principal.getId());
        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getStudentProfileByUserId(Long targetUserId, UserPrincipal principal) {
        if (principal.getRole() == Role.STUDENT && !principal.getId().equals(targetUserId)) {
            throw new ForbiddenException("Access Denied: Students are restricted from accessing records of other students.");
        }

        StudentProfile profile = getProfileOrThrow(targetUserId);
        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(UserPrincipal principal) {
        StudentProfile profile = getProfileOrThrow(principal.getId());
        Integer currentSem = profile.getCurrentSemester();

        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndSemester(principal.getId(), currentSem);
        int enrolledCoursesCount = enrollments.size();

        long totalAttendance = attendanceRecordRepository.countByStudentId(principal.getId());
        Double overallAttendance = null;
        if (totalAttendance > 0) {
            long present = attendanceRecordRepository.countByStudentIdAndStatus(principal.getId(), AttendanceStatus.PRESENT);
            long late = attendanceRecordRepository.countByStudentIdAndStatus(principal.getId(), AttendanceStatus.LATE);
            overallAttendance = Math.round(((double) (present + late) / totalAttendance * 100.0) * 10.0) / 10.0;
        }

        Double semesterGpa = calculateSgpa(enrollments);
        long pendingFeesCount = feeRecordRepository.countByStudentIdAndStatusNot(principal.getId(), FeeStatus.PAID);

        List<Notification> candidateNotifs = notificationRepository.findAllByDepartmentAndSemester(
                principal.getDepartment(), currentSem);
        long notificationsCount = candidateNotifs.stream()
                .filter(n -> Boolean.TRUE.equals(n.getIsActive()) && !isNotificationExpired(n.getExpiresAt()))
                .count();

        String riskStatus = "Good Standing (ML Integration Pending)";

        return new DashboardResponse(
                principal.getName(),
                profile.getStudentId(),
                principal.getDepartment(),
                currentSem,
                profile.getDerivedYear(),
                enrolledCoursesCount,
                overallAttendance,
                semesterGpa,
                pendingFeesCount,
                notificationsCount,
                riskStatus
        );
    }

    @Transactional(readOnly = true)
    public List<AttendanceSummaryResponse> getAttendance(UserPrincipal principal) {
        StudentProfile profile = getProfileOrThrow(principal.getId());
        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndSemester(principal.getId(), profile.getCurrentSemester());

        List<AttendanceSummaryResponse> summaries = new ArrayList<>();
        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();
            long totalClasses = attendanceRecordRepository.countByStudentIdAndCourseId(principal.getId(), course.getId());
            long present = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(principal.getId(), course.getId(), AttendanceStatus.PRESENT);
            long absent = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(principal.getId(), course.getId(), AttendanceStatus.ABSENT);
            long late = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(principal.getId(), course.getId(), AttendanceStatus.LATE);

            Double percent = totalClasses > 0
                    ? Math.round(((double) (present + late) / totalClasses * 100.0) * 10.0) / 10.0
                    : 0.0;

            summaries.add(new AttendanceSummaryResponse(
                    course.getCourseCode(),
                    course.getCourseName(),
                    totalClasses,
                    present,
                    absent,
                    late,
                    percent
            ));
        }

        return summaries;
    }

    @Transactional(readOnly = true)
    public AcademicPerformanceResponse getAcademicPerformance(UserPrincipal principal) {
        StudentProfile profile = getProfileOrThrow(principal.getId());
        Integer currentSem = profile.getCurrentSemester();
        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndSemester(principal.getId(), currentSem);

        int academicYear = enrollments.isEmpty() ? profile.getAdmissionYear() : enrollments.get(0).getAcademicYear();

        List<CourseAcademicDetail> courseDetails = enrollments.stream().map(e -> {
            Course c = e.getCourse();
            List<StudentAssessmentMarkDTO> publishedAssessments = getPublishedAssessmentsForStudentAndCourse(principal.getId(), c.getId(), e);
            return new CourseAcademicDetail(
                    c.getId(),
                    c.getCourseCode(),
                    c.getCourseName(),
                    c.getCredits(),
                    e.getGrade(),
                    e.getGradePoints(),
                    publishedAssessments
            );
        }).collect(Collectors.toList());

        return new AcademicPerformanceResponse(currentSem, academicYear, courseDetails);
    }

    @Transactional(readOnly = true)
    public List<StudentAssessmentMarkDTO> getCourseAssessments(Long courseId, UserPrincipal principal) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(principal.getId(), courseId)
                .orElseThrow(() -> new ForbiddenException("Access Denied: You are not enrolled in course with ID " + courseId));

        return getPublishedAssessmentsForStudentAndCourse(principal.getId(), courseId, enrollment);
    }

    private List<StudentAssessmentMarkDTO> getPublishedAssessmentsForStudentAndCourse(Long studentUserId, Long courseId, Enrollment enrollment) {
        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
        List<AssessmentMark> marks = assessmentMarkRepository.findByAssessment_CourseIdAndStudentId(courseId, studentUserId);
        Map<Long, AssessmentMark> markMap = marks.stream()
                .filter(m -> m.getAssessment() != null)
                .collect(Collectors.toMap(m -> m.getAssessment().getId(), m -> m, (m1, m2) -> m1));

        List<StudentAssessmentMarkDTO> list = new ArrayList<>();
        for (Assessment a : assessments) {
            boolean isPublished = Boolean.TRUE.equals(a.getPublished());
            if (!isPublished) {
                // Do NOT expose unpublished or pending faculty marks to students
                continue;
            }

            AssessmentMark mark = markMap.get(a.getId());
            if (mark != null && mark.getMarksObtained() != null) {
                Double marksObtained = mark.getMarksObtained();
                Double maxMarks = a.getMaxMarks();
                Double percentage = (maxMarks != null && maxMarks > 0)
                        ? Math.round((marksObtained / maxMarks * 100.0) * 10.0) / 10.0
                        : 0.0;

                list.add(new StudentAssessmentMarkDTO(
                        a.getId(),
                        a.getTitle(),
                        a.getType() != null ? a.getType().name() : "ASSESSMENT",
                        marksObtained,
                        maxMarks,
                        percentage,
                        a.getWeightage(),
                        "PUBLISHED",
                        true,
                        mark.getGradedAt()
                ));
            }
        }
        return list;
    }

    @Transactional(readOnly = true)
    public SemesterResultResponse getSemesterResult(UserPrincipal principal, Integer semester) {
        StudentProfile profile = getProfileOrThrow(principal.getId());
        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndSemester(principal.getId(), semester);

        int academicYear = enrollments.isEmpty() ? profile.getAdmissionYear() : enrollments.get(0).getAcademicYear();
        boolean isCurrent = semester.equals(profile.getCurrentSemester());

        List<CourseAcademicDetail> courseDetails = enrollments.stream().map(e -> new CourseAcademicDetail(
                e.getCourse().getCourseCode(),
                e.getCourse().getCourseName(),
                e.getCourse().getCredits(),
                e.getGrade(),
                e.getGradePoints()
        )).collect(Collectors.toList());

        Double sgpa = calculateSgpa(enrollments);
        int totalCredits = enrollments.stream().mapToInt(e -> e.getCourse().getCredits()).sum();

        return new SemesterResultResponse(semester, academicYear, isCurrent, courseDetails, sgpa, totalCredits);
    }

    @Transactional(readOnly = true)
    public List<SemesterResultResponse> getAllSemesterResults(UserPrincipal principal) {
        StudentProfile profile = getProfileOrThrow(principal.getId());
        List<Enrollment> allEnrollments = enrollmentRepository.findByStudentId(principal.getId());

        Map<Integer, List<Enrollment>> bySemester = allEnrollments.stream()
                .collect(Collectors.groupingBy(Enrollment::getSemester));

        List<SemesterResultResponse> results = new ArrayList<>();
        List<Integer> sortedSemesters = new ArrayList<>(bySemester.keySet());
        Collections.sort(sortedSemesters);

        for (Integer sem : sortedSemesters) {
            List<Enrollment> semEnrollments = bySemester.get(sem);
            int academicYear = semEnrollments.isEmpty() ? profile.getAdmissionYear() : semEnrollments.get(0).getAcademicYear();
            boolean isCurrent = sem.equals(profile.getCurrentSemester());

            List<CourseAcademicDetail> courseDetails = semEnrollments.stream().map(e -> new CourseAcademicDetail(
                    e.getCourse().getCourseCode(),
                    e.getCourse().getCourseName(),
                    e.getCourse().getCredits(),
                    e.getGrade(),
                    e.getGradePoints()
            )).collect(Collectors.toList());

            Double sgpa = calculateSgpa(semEnrollments);
            int totalCredits = semEnrollments.stream().mapToInt(e -> e.getCourse().getCredits()).sum();

            results.add(new SemesterResultResponse(sem, academicYear, isCurrent, courseDetails, sgpa, totalCredits));
        }

        return results;
    }

    @Transactional(readOnly = true)
    public RiskStatusResponse getRiskStatus(UserPrincipal principal) {
        StudentProfile profile = getProfileOrThrow(principal.getId());

        long totalAttendance = attendanceRecordRepository.countByStudentId(principal.getId());
        Double overallAttendance = null;
        if (totalAttendance > 0) {
            long present = attendanceRecordRepository.countByStudentIdAndStatus(principal.getId(), AttendanceStatus.PRESENT);
            long late = attendanceRecordRepository.countByStudentIdAndStatus(principal.getId(), AttendanceStatus.LATE);
            overallAttendance = Math.round(((double) (present + late) / totalAttendance * 100.0) * 10.0) / 10.0;
        }

        return new RiskStatusResponse(
                overallAttendance,
                profile.getCurrentSemester(),
                false,
                null,
                null,
                "Risk assessment will be available when AI Advisor is integrated"
        );
    }

    @Transactional(readOnly = true)
    public List<FeeRecordResponse> getFees(UserPrincipal principal) {
        List<FeeRecord> fees = feeRecordRepository.findByStudentId(principal.getId());
        return fees.stream().map(f -> new FeeRecordResponse(
                f.getId(),
                f.getFeeType(),
                f.getSemester(),
                f.getAcademicYear(),
                f.getAmount(),
                f.getPaidAmount(),
                f.getDueDate(),
                f.getStatus()
        )).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocuments(UserPrincipal principal) {
        List<Document> docs = documentRepository.findByStudentId(principal.getId());
        return docs.stream().map(d -> new DocumentResponse(
                d.getId(),
                d.getDocumentType(),
                d.getTitle(),
                d.getDescription(),
                d.getSemester(),
                d.getIssuedDate(),
                d.getStatus()
        )).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(UserPrincipal principal) {
        StudentProfile profile = getProfileOrThrow(principal.getId());
        List<Notification> notifications = notificationRepository.findAllByDepartmentAndSemester(
                principal.getDepartment(), profile.getCurrentSemester());

        return notifications.stream().map(n -> {
            boolean expired = isNotificationExpired(n.getExpiresAt());
            boolean active = Boolean.TRUE.equals(n.getIsActive()) && !expired;
            return new NotificationResponse(
                    n.getId(),
                    n.getTitle(),
                    n.getMessage(),
                    n.getType(),
                    n.getCreatedAt(),
                    n.getExpiresAt(),
                    expired,
                    active
            );
        }).collect(Collectors.toList());
    }

    public static boolean isNotificationExpired(LocalDateTime expiresAt) {
        if (expiresAt == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        // If expiresAt is stored as midnight (e.g. date-only 2026-09-22 00:00:00),
        // it remains valid for the full day of 2026-09-22 until 23:59:59.
        // It is only expired if current date (now.toLocalDate()) is after 2026-09-22.
        if (expiresAt.toLocalTime().equals(LocalTime.MIDNIGHT)) {
            return now.toLocalDate().isAfter(expiresAt.toLocalDate());
        }
        return now.isAfter(expiresAt);
    }

    private Double calculateSgpa(List<Enrollment> enrollments) {
        if (enrollments == null || enrollments.isEmpty()) {
            return null;
        }

        int totalGradedCredits = 0;
        double totalWeightedPoints = 0.0;

        for (Enrollment e : enrollments) {
            // If any course in the semester has not yet been graded,
            // keep SGPA pending until all required grades exist.
            if (e.getGradePoints() == null) {
                return null;
            }
            int credits = e.getCourse().getCredits();
            totalGradedCredits += credits;
            totalWeightedPoints += e.getGradePoints() * credits;
        }

        if (totalGradedCredits == 0) {
            return null;
        }

        return Math.round((totalWeightedPoints / totalGradedCredits) * 100.0) / 100.0;
    }

    private StudentProfile getProfileOrThrow(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));
    }

    private StudentProfileResponse mapToDto(StudentProfile sp) {
        return new StudentProfileResponse(
                sp.getStudentId(),
                sp.getAdmissionYear(),
                sp.getCurrentSemester(),
                sp.getDerivedYear()
        );
    }
}
