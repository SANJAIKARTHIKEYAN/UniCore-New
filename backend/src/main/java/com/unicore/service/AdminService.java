package com.unicore.service;

import com.unicore.dto.request.*;
import com.unicore.dto.response.*;
import com.unicore.entity.*;
import com.unicore.exception.BadRequestException;
import com.unicore.exception.ResourceNotFoundException;
import com.unicore.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ApprovedStudentRepository approvedStudentRepository;
    private final ApprovedFacultyRepository approvedFacultyRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentMarkRepository assessmentMarkRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final StudentDataInitializerService studentDataInitializerService;

    public AdminService(UserRepository userRepository,
                        ApprovedStudentRepository approvedStudentRepository,
                        ApprovedFacultyRepository approvedFacultyRepository,
                        DepartmentRepository departmentRepository,
                        StudentProfileRepository studentProfileRepository,
                        FacultyProfileRepository facultyProfileRepository,
                        CourseRepository courseRepository,
                        EnrollmentRepository enrollmentRepository,
                        AttendanceRecordRepository attendanceRecordRepository,
                        AssessmentRepository assessmentRepository,
                        AssessmentMarkRepository assessmentMarkRepository,
                        AuthService authService,
                        PasswordEncoder passwordEncoder,
                        StudentDataInitializerService studentDataInitializerService) {
        this.userRepository = userRepository;
        this.approvedStudentRepository = approvedStudentRepository;
        this.approvedFacultyRepository = approvedFacultyRepository;
        this.departmentRepository = departmentRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.assessmentRepository = assessmentRepository;
        this.assessmentMarkRepository = assessmentMarkRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.studentDataInitializerService = studentDataInitializerService;
    }

    // ==========================================
    // Dashboard Aggregate Statistics
    // ==========================================
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalFaculty = userRepository.countByRole(Role.FACULTY);
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long totalDepartments = departmentRepository.count();
        long totalAssessments = assessmentRepository.count();
        long totalAttendanceRecords = attendanceRecordRepository.count();

        List<String> recentActivity = Arrays.asList(
                "System initialized with " + totalDepartments + " operational academic departments.",
                totalCourses + " active catalog courses registered in institutional syllabus.",
                totalStudents + " enrolled students actively participating in ERP portals.",
                totalFaculty + " faculty members managing course rosters and evaluation marks.",
                totalAssessments + " academic assessments configured across courses."
        );

        return new AdminDashboardResponse(
                totalStudents,
                totalFaculty,
                totalCourses,
                totalEnrollments,
                activeUsers,
                totalDepartments,
                totalAssessments,
                totalAttendanceRecords,
                recentActivity
        );
    }

    // ==========================================
    // User / Student Management
    // ==========================================
    @Transactional(readOnly = true)
    public List<AdminStudentResponse> getStudents(String search) {
        List<User> students = userRepository.findByRole(Role.STUDENT);

        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            students = students.stream()
                    .filter(u -> (u.getName() != null && u.getName().toLowerCase().contains(q)) ||
                                 (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) ||
                                 (u.getStudentProfile() != null && u.getStudentProfile().getStudentId() != null &&
                                  u.getStudentProfile().getStudentId().toLowerCase().contains(q)) ||
                                 (u.getDepartment() != null && u.getDepartment().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        return students.stream()
                .map(this::mapToAdminStudentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminStudentResponse getStudentById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with user id: " + id));
        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("User with id " + id + " is not a student.");
        }
        return mapToAdminStudentResponse(user);
    }

    @Transactional
    public AdminStudentResponse createStudent(CreateStudentAdminRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        String cleanStudentId = request.getStudentId().trim();
        String cleanDept = request.getDepartment().trim();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("Email is already registered: " + cleanEmail);
        }
        if (studentProfileRepository.existsByStudentId(cleanStudentId)) {
            throw new BadRequestException("Student ID is already registered: " + cleanStudentId);
        }

        Department dept = departmentRepository.findByShortCodeIgnoreCase(cleanDept)
                .or(() -> departmentRepository.findByNameIgnoreCase(cleanDept))
                .orElseThrow(() -> new BadRequestException("Department '" + cleanDept + "' does not exist."));
        if (!dept.isActive()) {
            throw new BadRequestException("Department '" + cleanDept + "' is inactive.");
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "UniCore@2026";

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(cleanEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(Role.STUDENT);
        user.setDepartment(dept.getShortCode());
        user.setStatus(UserStatus.ACTIVE);

        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setStudentId(cleanStudentId);
        profile.setAdmissionYear(request.getAdmissionYear());
        profile.setCurrentSemester(request.getCurrentSemester());
        user.setStudentProfile(profile);

        User saved = userRepository.save(user);

        // Automatic Course Enrollment for Student's Department and Current Semester
        String deptCode = dept.getShortCode();
        Integer currentSem = profile.getCurrentSemester();
        Integer admissionYear = profile.getAdmissionYear();

        List<Course> matchingCourses = courseRepository.findByDepartmentAndSemester(deptCode, currentSem);
        int enrolledCount = 0;

        for (Course course : matchingCourses) {
            boolean alreadyEnrolled = enrollmentRepository.existsByStudentIdAndCourseId(saved.getId(), course.getId())
                    || enrollmentRepository.existsByStudentIdAndCourseIdAndSemesterAndAcademicYear(
                            saved.getId(), course.getId(), currentSem, admissionYear);
            if (!alreadyEnrolled) {
                Enrollment enrollment = new Enrollment(saved, course, currentSem, admissionYear);
                enrollmentRepository.save(enrollment);
                enrolledCount++;
            }
        }

        // Initialize baseline attendance records, fees, and student documents
        if (studentDataInitializerService != null) {
            studentDataInitializerService.initializeStudentData(saved, profile);
        }

        AdminStudentResponse response = mapToAdminStudentResponse(saved);
        response.setEnrolledCoursesCount(enrolledCount);

        if (matchingCourses.isEmpty()) {
            response.setEnrollmentMessage(String.format(
                    "No matching semester courses were found in department '%s' for semester %d. Automatic enrollment skipped.",
                    deptCode, currentSem));
        } else {
            response.setEnrollmentMessage(String.format(
                    "Automatically enrolled into %d course(s) for %s Semester %d.",
                    enrolledCount, deptCode, currentSem));
        }

        return response;
    }

    @Transactional
    public AdminStudentResponse updateStudent(Long id, UpdateStudentAdminRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with user id: " + id));
        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("User with id " + id + " is not a student.");
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
            String deptCode = request.getDepartment().trim();
            Department dept = departmentRepository.findByShortCodeIgnoreCase(deptCode)
                    .or(() -> departmentRepository.findByNameIgnoreCase(deptCode))
                    .orElseThrow(() -> new BadRequestException("Department '" + deptCode + "' does not exist."));
            user.setDepartment(dept.getShortCode());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        StudentProfile profile = user.getStudentProfile();
        if (profile != null) {
            if (request.getCurrentSemester() != null && request.getCurrentSemester() >= 1) {
                profile.setCurrentSemester(request.getCurrentSemester());
            }
            if (request.getAdmissionYear() != null && request.getAdmissionYear() >= 2000) {
                profile.setAdmissionYear(request.getAdmissionYear());
            }
        }

        User saved = userRepository.save(user);
        return mapToAdminStudentResponse(saved);
    }

    @Transactional
    public MessageResponse deleteStudent(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with user id: " + id));
        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("User with id " + id + " is not a student.");
        }
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        return new MessageResponse("Student account successfully deactivated (marked INACTIVE).");
    }

    // ==========================================
    // Faculty Management
    // ==========================================
    @Transactional(readOnly = true)
    public List<AdminFacultyResponse> getFaculty(String search) {
        List<User> facultyList = userRepository.findByRole(Role.FACULTY);

        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            facultyList = facultyList.stream()
                    .filter(u -> (u.getName() != null && u.getName().toLowerCase().contains(q)) ||
                                 (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) ||
                                 (u.getFacultyProfile() != null && u.getFacultyProfile().getFacultyId() != null &&
                                  u.getFacultyProfile().getFacultyId().toLowerCase().contains(q)) ||
                                 (u.getDepartment() != null && u.getDepartment().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        return facultyList.stream()
                .map(this::mapToAdminFacultyResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminFacultyResponse getFacultyById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with user id: " + id));
        if (user.getRole() != Role.FACULTY) {
            throw new BadRequestException("User with id " + id + " is not a faculty member.");
        }
        return mapToAdminFacultyResponse(user);
    }

    @Transactional(readOnly = true)
    public List<AdminCourseResponse> getFacultyAssignedCourses(Long facultyId) {
        User user = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty user not found with id: " + facultyId));
        if (user.getRole() != Role.FACULTY) {
            throw new BadRequestException("User with id " + facultyId + " is not a faculty member.");
        }
        return courseRepository.findByInstructorId(facultyId).stream()
                .map(this::mapToAdminCourseResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminFacultyResponse createFaculty(CreateFacultyAdminRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        String cleanFacultyId = request.getFacultyId().trim();
        String cleanDept = request.getDepartment().trim();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("Email is already registered: " + cleanEmail);
        }
        if (facultyProfileRepository.existsByFacultyId(cleanFacultyId)) {
            throw new BadRequestException("Faculty ID is already registered: " + cleanFacultyId);
        }

        Department dept = departmentRepository.findByShortCodeIgnoreCase(cleanDept)
                .or(() -> departmentRepository.findByNameIgnoreCase(cleanDept))
                .orElseThrow(() -> new BadRequestException("Department '" + cleanDept + "' does not exist."));
        if (!dept.isActive()) {
            throw new BadRequestException("Department '" + cleanDept + "' is inactive.");
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "UniCore@2026";

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(cleanEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(Role.FACULTY);
        user.setDepartment(dept.getShortCode());
        user.setStatus(UserStatus.ACTIVE);

        FacultyProfile profile = new FacultyProfile();
        profile.setUser(user);
        profile.setFacultyId(cleanFacultyId);
        profile.setDepartment(dept.getShortCode());
        user.setFacultyProfile(profile);

        User saved = userRepository.save(user);
        return mapToAdminFacultyResponse(saved);
    }

    @Transactional
    public AdminFacultyResponse updateFaculty(Long id, UpdateFacultyAdminRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with user id: " + id));
        if (user.getRole() != Role.FACULTY) {
            throw new BadRequestException("User with id " + id + " is not a faculty member.");
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
            String deptCode = request.getDepartment().trim();
            Department dept = departmentRepository.findByShortCodeIgnoreCase(deptCode)
                    .or(() -> departmentRepository.findByNameIgnoreCase(deptCode))
                    .orElseThrow(() -> new BadRequestException("Department '" + deptCode + "' does not exist."));
            user.setDepartment(dept.getShortCode());
            if (user.getFacultyProfile() != null) {
                user.getFacultyProfile().setDepartment(dept.getShortCode());
            }
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        User saved = userRepository.save(user);
        return mapToAdminFacultyResponse(saved);
    }

    @Transactional
    public MessageResponse deleteFaculty(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with user id: " + id));
        if (user.getRole() != Role.FACULTY) {
            throw new BadRequestException("User with id " + id + " is not a faculty member.");
        }
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        return new MessageResponse("Faculty account successfully deactivated (marked INACTIVE).");
    }

    // ==========================================
    // Course Management
    // ==========================================
    @Transactional(readOnly = true)
    public List<AdminCourseResponse> getCourses(String department, Integer semester) {
        List<Course> courses;
        if (department != null && !department.trim().isEmpty() && semester != null) {
            courses = courseRepository.findByDepartmentAndSemester(department.trim(), semester);
        } else if (department != null && !department.trim().isEmpty()) {
            courses = courseRepository.findByDepartment(department.trim());
        } else {
            courses = courseRepository.findAll();
        }

        return courses.stream()
                .map(this::mapToAdminCourseResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminCourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return mapToAdminCourseResponse(course);
    }

    @Transactional
    public AdminCourseResponse createCourse(CreateCourseAdminRequest request) {
        String code = request.getCourseCode().trim().toUpperCase();
        if (courseRepository.existsByCourseCode(code)) {
            throw new BadRequestException("Course code already exists: " + code);
        }

        String deptCode = request.getDepartment().trim();
        Department dept = departmentRepository.findByShortCodeIgnoreCase(deptCode)
                .or(() -> departmentRepository.findByNameIgnoreCase(deptCode))
                .orElseThrow(() -> new BadRequestException("Department '" + deptCode + "' does not exist."));
        if (!dept.isActive()) {
            throw new BadRequestException("Department '" + deptCode + "' is inactive.");
        }

        Course course = new Course();
        course.setCourseCode(code);
        course.setCourseName(request.getCourseName().trim());
        course.setDepartment(dept.getShortCode());
        course.setSemester(request.getSemester());
        course.setCredits(request.getCredits() != null ? request.getCredits() : 3);

        if (request.getInstructorId() != null) {
            User instructor = userRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor user not found with id: " + request.getInstructorId()));
            if (instructor.getRole() != Role.FACULTY) {
                throw new BadRequestException("Assigned instructor must have FACULTY role.");
            }
            course.setInstructor(instructor);
        }

        Course saved = courseRepository.save(course);
        return mapToAdminCourseResponse(saved);
    }

    @Transactional
    public AdminCourseResponse updateCourse(Long id, UpdateCourseAdminRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (request.getCourseName() != null && !request.getCourseName().trim().isEmpty()) {
            course.setCourseName(request.getCourseName().trim());
        }
        if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
            String deptCode = request.getDepartment().trim();
            Department dept = departmentRepository.findByShortCodeIgnoreCase(deptCode)
                    .or(() -> departmentRepository.findByNameIgnoreCase(deptCode))
                    .orElseThrow(() -> new BadRequestException("Department '" + deptCode + "' does not exist."));
            course.setDepartment(dept.getShortCode());
        }
        if (request.getSemester() != null && request.getSemester() >= 1) {
            course.setSemester(request.getSemester());
        }
        if (request.getCredits() != null && request.getCredits() >= 1) {
            course.setCredits(request.getCredits());
        }
        if (request.getInstructorId() != null) {
            User instructor = userRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + request.getInstructorId()));
            if (instructor.getRole() != Role.FACULTY) {
                throw new BadRequestException("Assigned instructor must have FACULTY role.");
            }
            course.setInstructor(instructor);
        }

        Course saved = courseRepository.save(course);
        return mapToAdminCourseResponse(saved);
    }

    @Transactional
    public MessageResponse deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        long enrollmentsCount = enrollmentRepository.countByCourseId(id);
        if (enrollmentsCount > 0) {
            throw new BadRequestException("Cannot delete course '" + course.getCourseCode() +
                    "' because it currently has " + enrollmentsCount + " enrolled students.");
        }

        List<Assessment> assessments = assessmentRepository.findByCourseId(id);
        if (!assessments.isEmpty()) {
            throw new BadRequestException("Cannot delete course '" + course.getCourseCode() +
                    "' because it has " + assessments.size() + " active assessment evaluations.");
        }

        courseRepository.delete(course);
        return new MessageResponse("Course '" + course.getCourseCode() + "' successfully deleted.");
    }

    // ==========================================
    // Faculty-Course Assignment
    // ==========================================
    @Transactional
    public AdminCourseResponse assignFacultyToCourse(Long courseId, Long facultyId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + facultyId));

        if (faculty.getRole() != Role.FACULTY) {
            throw new BadRequestException("User " + faculty.getName() + " does not have the FACULTY role.");
        }
        if (faculty.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Cannot assign inactive faculty member to course.");
        }

        course.setInstructor(faculty);
        Course saved = courseRepository.save(course);
        return mapToAdminCourseResponse(saved);
    }

    @Transactional
    public AdminCourseResponse unassignFacultyFromCourse(Long courseId, Long facultyId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (course.getInstructor() != null && course.getInstructor().getId().equals(facultyId)) {
            course.setInstructor(null);
            Course saved = courseRepository.save(course);
            return mapToAdminCourseResponse(saved);
        } else {
            throw new BadRequestException("Faculty member #" + facultyId + " is not assigned to course " + course.getCourseCode());
        }
    }

    // ==========================================
    // Enrollment Overview
    // ==========================================
    @Transactional(readOnly = true)
    public List<AdminEnrollmentResponse> getEnrollments(Long courseId, Long studentId, Integer semester) {
        List<Enrollment> enrollments = enrollmentRepository.findAll();

        if (courseId != null) {
            enrollments = enrollments.stream()
                    .filter(e -> e.getCourse() != null && e.getCourse().getId().equals(courseId))
                    .collect(Collectors.toList());
        }
        if (studentId != null) {
            enrollments = enrollments.stream()
                    .filter(e -> e.getStudent() != null && e.getStudent().getId().equals(studentId))
                    .collect(Collectors.toList());
        }
        if (semester != null) {
            enrollments = enrollments.stream()
                    .filter(e -> e.getSemester() != null && e.getSemester().equals(semester))
                    .collect(Collectors.toList());
        }

        return enrollments.stream().map(e -> {
            String studentReg = (e.getStudent() != null && e.getStudent().getStudentProfile() != null)
                    ? e.getStudent().getStudentProfile().getStudentId()
                    : "STU-" + e.getStudent().getId();
            return new AdminEnrollmentResponse(
                    e.getId(),
                    e.getStudent() != null ? e.getStudent().getId() : null,
                    e.getStudent() != null ? e.getStudent().getName() : "Unknown",
                    studentReg,
                    e.getCourse() != null ? e.getCourse().getId() : null,
                    e.getCourse() != null ? e.getCourse().getCourseCode() : "N/A",
                    e.getCourse() != null ? e.getCourse().getCourseName() : "N/A",
                    e.getSemester(),
                    e.getAcademicYear(),
                    e.getGrade(),
                    e.getGradePoints()
            );
        }).collect(Collectors.toList());
    }

    // ==========================================
    // Attendance & Assessment Summaries
    // ==========================================
    @Transactional(readOnly = true)
    public AdminAttendanceSummaryResponse getAttendanceSummary() {
        List<AttendanceRecord> records = attendanceRecordRepository.findAll();
        long total = records.size();
        long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
        long late = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        double overallPct = total > 0 ? ((double) present / total) * 100.0 : 0.0;

        // Group by department
        Map<String, List<AttendanceRecord>> deptGroups = records.stream()
                .filter(r -> r.getStudent() != null && r.getStudent().getDepartment() != null)
                .collect(Collectors.groupingBy(r -> r.getStudent().getDepartment()));

        List<AdminAttendanceSummaryResponse.DepartmentAttendanceSummary> deptSummaries = new ArrayList<>();
        for (Map.Entry<String, List<AttendanceRecord>> entry : deptGroups.entrySet()) {
            long dTotal = entry.getValue().size();
            long dPresent = entry.getValue().stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            double dPct = dTotal > 0 ? ((double) dPresent / dTotal) * 100.0 : 0.0;
            deptSummaries.add(new AdminAttendanceSummaryResponse.DepartmentAttendanceSummary(
                    entry.getKey(), dTotal, dPresent, Math.round(dPct * 10.0) / 10.0
            ));
        }

        return new AdminAttendanceSummaryResponse(
                total, present, absent, late, Math.round(overallPct * 10.0) / 10.0, deptSummaries
        );
    }

    @Transactional(readOnly = true)
    public AdminAssessmentSummaryResponse getAssessmentsSummary() {
        List<Assessment> assessments = assessmentRepository.findAll();
        long totalAssessments = assessments.size();
        long totalMarks = assessmentMarkRepository.count();

        Map<String, Long> typeCounts = assessments.stream()
                .collect(Collectors.groupingBy(a -> a.getType().name(), Collectors.counting()));

        // Group by Course
        Map<Long, List<Assessment>> courseMap = assessments.stream()
                .filter(a -> a.getCourse() != null)
                .collect(Collectors.groupingBy(a -> a.getCourse().getId()));

        List<AdminAssessmentSummaryResponse.CourseAssessmentOverview> overviews = new ArrayList<>();
        for (Map.Entry<Long, List<Assessment>> entry : courseMap.entrySet()) {
            Course c = entry.getValue().get(0).getCourse();
            double totalWeight = entry.getValue().stream().mapToDouble(a -> a.getWeightage() != null ? a.getWeightage() : 0).sum();
            overviews.add(new AdminAssessmentSummaryResponse.CourseAssessmentOverview(
                    c.getId(), c.getCourseCode(), c.getCourseName(), entry.getValue().size(), totalWeight
            ));
        }

        return new AdminAssessmentSummaryResponse(totalAssessments, totalMarks, typeCounts, overviews);
    }

    // ==========================================
    // Existing Roster Methods Preserved
    // ==========================================
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(authService::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApprovedStudent> getApprovedStudentsRoster() {
        return approvedStudentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ApprovedFaculty> getApprovedFacultyRoster() {
        return approvedFacultyRepository.findAll();
    }

    @Transactional
    public ApprovedStudent addApprovedStudent(ApprovedStudent student) {
        if (student.getStudentId() == null || student.getStudentId().trim().isEmpty()) {
            throw new BadRequestException("Student ID is required");
        }
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            throw new BadRequestException("Student Name is required");
        }
        if (student.getCollegeEmail() == null || student.getCollegeEmail().trim().isEmpty()) {
            throw new BadRequestException("College email is required");
        }
        if (student.getDepartment() == null || student.getDepartment().trim().isEmpty()) {
            throw new BadRequestException("Department is required");
        }
        if (student.getAdmissionYear() == null || student.getCurrentSemester() == null) {
            throw new BadRequestException("Admission year and current semester are required");
        }

        String studentId = student.getStudentId().trim();
        String email = student.getCollegeEmail().trim().toLowerCase();
        String deptCode = student.getDepartment().trim();

        if (approvedStudentRepository.existsByStudentId(studentId)) {
            throw new BadRequestException("Student ID already exists in approved roster: " + studentId);
        }
        if (approvedStudentRepository.findByCollegeEmail(email).isPresent()) {
            throw new BadRequestException("College email already exists in approved roster: " + email);
        }

        Department dept = departmentRepository.findByShortCodeIgnoreCase(deptCode)
                .or(() -> departmentRepository.findByNameIgnoreCase(deptCode))
                .orElseThrow(() -> new BadRequestException("Department '" + deptCode + "' does not exist in institutional departments."));
        if (!dept.isActive()) {
            throw new BadRequestException("Cannot add student to inactive department: " + deptCode);
        }

        student.setStudentId(studentId);
        student.setName(student.getName().trim());
        student.setCollegeEmail(email);
        student.setDepartment(dept.getShortCode());
        student.setActive(true);
        student.setRegistered(false);

        return approvedStudentRepository.save(student);
    }

    @Transactional
    public ApprovedFaculty addApprovedFaculty(ApprovedFaculty faculty) {
        if (faculty.getFacultyId() == null || faculty.getFacultyId().trim().isEmpty()) {
            throw new BadRequestException("Faculty ID is required");
        }
        if (faculty.getName() == null || faculty.getName().trim().isEmpty()) {
            throw new BadRequestException("Faculty Name is required");
        }
        if (faculty.getCollegeEmail() == null || faculty.getCollegeEmail().trim().isEmpty()) {
            throw new BadRequestException("College email is required");
        }
        if (faculty.getDepartment() == null || faculty.getDepartment().trim().isEmpty()) {
            throw new BadRequestException("Department is required");
        }

        String facultyId = faculty.getFacultyId().trim();
        String email = faculty.getCollegeEmail().trim().toLowerCase();
        String deptCode = faculty.getDepartment().trim();

        if (approvedFacultyRepository.existsByFacultyId(facultyId)) {
            throw new BadRequestException("Faculty ID already exists in approved roster: " + facultyId);
        }
        if (approvedFacultyRepository.findByCollegeEmail(email).isPresent()) {
            throw new BadRequestException("College email already exists in approved roster: " + email);
        }

        Department dept = departmentRepository.findByShortCodeIgnoreCase(deptCode)
                .or(() -> departmentRepository.findByNameIgnoreCase(deptCode))
                .orElseThrow(() -> new BadRequestException("Department '" + deptCode + "' does not exist in institutional departments."));
        if (!dept.isActive()) {
            throw new BadRequestException("Cannot add faculty to inactive department: " + deptCode);
        }

        faculty.setFacultyId(facultyId);
        faculty.setName(faculty.getName().trim());
        faculty.setCollegeEmail(email);
        faculty.setDepartment(dept.getShortCode());
        faculty.setActive(true);
        faculty.setRegistered(false);

        return approvedFacultyRepository.save(faculty);
    }

    @Transactional
    public ApprovedStudent toggleApprovedStudentStatus(Long id) {
        ApprovedStudent student = approvedStudentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approved student record not found with id: " + id));
        student.setActive(!student.isActive());
        return approvedStudentRepository.save(student);
    }

    @Transactional
    public ApprovedFaculty toggleApprovedFacultyStatus(Long id) {
        ApprovedFaculty faculty = approvedFacultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approved faculty record not found with id: " + id));
        faculty.setActive(!faculty.isActive());
        return approvedFacultyRepository.save(faculty);
    }

    // ==========================================
    // Helper Mappers
    // ==========================================
    private AdminStudentResponse mapToAdminStudentResponse(User user) {
        StudentProfile sp = user.getStudentProfile();
        return new AdminStudentResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDepartment(),
                user.getStatus(),
                sp != null ? sp.getStudentId() : "N/A",
                sp != null ? sp.getAdmissionYear() : null,
                sp != null ? sp.getCurrentSemester() : null,
                sp != null ? sp.getDerivedYear() : "Unassigned",
                user.getCreatedAt()
        );
    }

    private AdminFacultyResponse mapToAdminFacultyResponse(User user) {
        FacultyProfile fp = user.getFacultyProfile();
        List<Course> courses = courseRepository.findByInstructorId(user.getId());
        List<AdminCourseResponse> assignedCourses = courses.stream()
                .map(this::mapToAdminCourseResponse)
                .collect(Collectors.toList());
        return new AdminFacultyResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDepartment(),
                user.getStatus(),
                fp != null ? fp.getFacultyId() : "N/A",
                courses.size(),
                assignedCourses,
                user.getCreatedAt()
        );
    }

    private AdminCourseResponse mapToAdminCourseResponse(Course course) {
        long enrolledCount = enrollmentRepository.countByCourseId(course.getId());
        Long instructorId = course.getInstructor() != null ? course.getInstructor().getId() : null;
        String instructorName = course.getInstructor() != null ? course.getInstructor().getName() : "Unassigned";

        return new AdminCourseResponse(
                course.getId(),
                course.getCourseCode(),
                course.getCourseName(),
                course.getDepartment(),
                course.getSemester(),
                course.getCredits(),
                instructorId,
                instructorName,
                enrolledCount
        );
    }
}
