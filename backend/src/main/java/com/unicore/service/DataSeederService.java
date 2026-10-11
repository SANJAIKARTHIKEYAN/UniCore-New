package com.unicore.service;

import com.unicore.entity.*;
import com.unicore.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeederService implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ApprovedStudentRepository approvedStudentRepository;
    private final ApprovedFacultyRepository approvedFacultyRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final DocumentRepository documentRepository;
    private final NotificationRepository notificationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentDataInitializerService studentDataInitializerService;
    private final FacultyProfileRepository facultyProfileRepository;
    private final FacultyDataInitializerService facultyDataInitializerService;
    private final PasswordEncoder passwordEncoder;

    @Value("${unicore.admin.email}")
    private String adminEmail;

    @Value("${unicore.admin.name}")
    private String adminName;

    @Value("${unicore.admin.password}")
    private String adminPassword;

    @Value("${unicore.admin.department}")
    private String adminDepartment;

    @Value("${unicore.demo.seed-accounts:true}")
    private boolean seedDemoAccounts;

    @Value("${unicore.demo.student.id:BCA-STU-001}")
    private String demoStudentId;

    @Value("${unicore.demo.student.email:bca.stu001@unicore.edu}")
    private String demoStudentEmail;

    @Value("${unicore.demo.student.password:Student@UniCore2026}")
    private String demoStudentPassword;

    @Value("${unicore.demo.faculty.id:BCA-FAC-001}")
    private String demoFacultyId;

    @Value("${unicore.demo.faculty.email:bca.fac001@unicore.edu}")
    private String demoFacultyEmail;

    @Value("${unicore.demo.faculty.password:Faculty@UniCore2026}")
    private String demoFacultyPassword;

    public DataSeederService(DepartmentRepository departmentRepository,
                              UserRepository userRepository,
                              ApprovedStudentRepository approvedStudentRepository,
                              ApprovedFacultyRepository approvedFacultyRepository,
                              CourseRepository courseRepository,
                              EnrollmentRepository enrollmentRepository,
                              AttendanceRecordRepository attendanceRecordRepository,
                              FeeRecordRepository feeRecordRepository,
                              DocumentRepository documentRepository,
                              NotificationRepository notificationRepository,
                              StudentProfileRepository studentProfileRepository,
                              StudentDataInitializerService studentDataInitializerService,
                              FacultyProfileRepository facultyProfileRepository,
                              FacultyDataInitializerService facultyDataInitializerService,
                              PasswordEncoder passwordEncoder) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.approvedStudentRepository = approvedStudentRepository;
        this.approvedFacultyRepository = approvedFacultyRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.feeRecordRepository = feeRecordRepository;
        this.documentRepository = documentRepository;
        this.notificationRepository = notificationRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.studentDataInitializerService = studentDataInitializerService;
        this.facultyProfileRepository = facultyProfileRepository;
        this.facultyDataInitializerService = facultyDataInitializerService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedDepartments();
        seedAdmin();
        seedApprovedStudents();
        seedApprovedFaculty();
        seedCourses();
        seedNotifications();
        seedDemoStudent();
        seedDemoFaculty();
        seedDataForRegisteredStudents();
        seedDataForRegisteredFaculty();
        cleanupPlaceholderFacultyNames();
    }

    private void cleanupPlaceholderFacultyNames() {
        List<User> faculties = userRepository.findByRole(Role.FACULTY);
        for (User f : faculties) {
            if (f.getName() != null && (f.getName().equalsIgnoreCase("gggggggg") || f.getName().matches("^(.)\\1{3,}$"))) {
                f.setName("Dr. Academic Faculty");
                userRepository.save(f);
            }
        }
    }

    private void seedDepartments() {
        if (departmentRepository.count() == 0) {
            List<Department> departments = Arrays.asList(
                    new Department("Bachelor of Computer Applications", "BCA", true),
                    new Department("B.Sc Computer Science", "BSCS", true),
                    new Department("Bachelor of Commerce", "BCOM", true),
                    new Department("Bachelor of Business Administration", "BBA", true),
                    new Department("B.Sc Mathematics", "BSM", true)
            );
            departmentRepository.saveAll(departments);
        }
    }

    private void seedAdmin() {
        userRepository.findByEmail(adminEmail).ifPresentOrElse(
                admin -> {
                    if (!passwordEncoder.matches(adminPassword, admin.getPasswordHash())) {
                        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                        admin.setStatus(UserStatus.ACTIVE);
                        userRepository.save(admin);
                    }
                },
                () -> {
                    User admin = new User();
                    admin.setName(adminName);
                    admin.setEmail(adminEmail);
                    admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                    admin.setRole(Role.ADMIN);
                    admin.setDepartment(adminDepartment);
                    admin.setStatus(UserStatus.ACTIVE);
                    userRepository.save(admin);
                }
        );
    }

    private void seedApprovedStudents() {
        if (approvedStudentRepository.count() == 0) {
            List<ApprovedStudent> students = Arrays.asList(
                    // 1. BCA (5 students)
                    new ApprovedStudent("BCA-STU-001", "Sanjai Karthikeyan", "bca.stu001@unicore.edu", "BCA", 2024, 2, true),
                    new ApprovedStudent("BCA-STU-002", "Aravind Mohan", "bca.stu002@unicore.edu", "BCA", 2024, 1, true),
                    new ApprovedStudent("BCA-STU-003", "Kavitha Sundar", "bca.stu003@unicore.edu", "BCA", 2023, 4, true),
                    new ApprovedStudent("BCA-STU-004", "Deepak Raj", "bca.stu004@unicore.edu", "BCA", 2023, 3, true),
                    new ApprovedStudent("BCA-STU-005", "Harini Vijay", "bca.stu005@unicore.edu", "BCA", 2022, 6, true),

                    // 2. BSCS (5 students)
                    new ApprovedStudent("BSCS-STU-001", "Rahul Sharma", "bscs.stu001@unicore.edu", "BSCS", 2024, 2, true),
                    new ApprovedStudent("BSCS-STU-002", "Sneha Patel", "bscs.stu002@unicore.edu", "BSCS", 2024, 1, true),
                    new ApprovedStudent("BSCS-STU-003", "Karthik Raja", "bscs.stu003@unicore.edu", "BSCS", 2023, 4, true),
                    new ApprovedStudent("BSCS-STU-004", "Divya Menon", "bscs.stu004@unicore.edu", "BSCS", 2023, 3, true),
                    new ApprovedStudent("BSCS-STU-005", "Aditya Varma", "bscs.stu005@unicore.edu", "BSCS", 2022, 5, true),

                    // 3. BCOM (5 students)
                    new ApprovedStudent("BCOM-STU-001", "Manoj Kumar", "bcom.stu001@unicore.edu", "BCOM", 2024, 2, true),
                    new ApprovedStudent("BCOM-STU-002", "Pooja Hegde", "bcom.stu002@unicore.edu", "BCOM", 2024, 1, true),
                    new ApprovedStudent("BCOM-STU-003", "Suresh Raina", "bcom.stu003@unicore.edu", "BCOM", 2023, 4, true),
                    new ApprovedStudent("BCOM-STU-004", "Ananya Iyer", "bcom.stu004@unicore.edu", "BCOM", 2023, 3, true),
                    new ApprovedStudent("BCOM-STU-005", "Vikas Gupta", "bcom.stu005@unicore.edu", "BCOM", 2022, 6, true),

                    // 4. BBA (5 students)
                    new ApprovedStudent("BBA-STU-001", "Rohan Mehra", "bba.stu001@unicore.edu", "BBA", 2024, 2, true),
                    new ApprovedStudent("BBA-STU-002", "Tara Singh", "bba.stu002@unicore.edu", "BBA", 2024, 1, true),
                    new ApprovedStudent("BBA-STU-003", "Nikhil Joshi", "bba.stu003@unicore.edu", "BBA", 2023, 4, true),
                    new ApprovedStudent("BBA-STU-004", "Ritu Sethi", "bba.stu004@unicore.edu", "BBA", 2023, 3, true),
                    new ApprovedStudent("BBA-STU-005", "Gaurav Sen", "bba.stu005@unicore.edu", "BBA", 2022, 5, true),

                    // 5. BSM (5 students)
                    new ApprovedStudent("BSM-STU-001", "Siddharth Raman", "bsm.stu001@unicore.edu", "BSM", 2024, 2, true),
                    new ApprovedStudent("BSM-STU-002", "Meera Nair", "bsm.stu002@unicore.edu", "BSM", 2024, 1, true),
                    new ApprovedStudent("BSM-STU-003", "Arun Prakash", "bsm.stu003@unicore.edu", "BSM", 2023, 4, true),
                    new ApprovedStudent("BSM-STU-004", "Bhavna Jain", "bsm.stu004@unicore.edu", "BSM", 2023, 3, true),
                    new ApprovedStudent("BSM-STU-005", "Kiran Roy", "bsm.stu005@unicore.edu", "BSM", 2022, 6, true)
            );
            approvedStudentRepository.saveAll(students);
        }
    }

    private void seedApprovedFaculty() {
        if (approvedFacultyRepository.count() == 0) {
            List<ApprovedFaculty> faculties = Arrays.asList(
                    // 1. BCA (2 faculty)
                    new ApprovedFaculty("BCA-FAC-001", "Dr. K. Sharma", "bca.fac001@unicore.edu", "BCA", true),
                    new ApprovedFaculty("BCA-FAC-002", "Prof. S. Ranganathan", "bca.fac002@unicore.edu", "BCA", true),

                    // 2. BSCS (2 faculty)
                    new ApprovedFaculty("BSCS-FAC-001", "Dr. Anita Desai", "bscs.fac001@unicore.edu", "BSCS", true),
                    new ApprovedFaculty("BSCS-FAC-002", "Prof. R. Balaji", "bscs.fac002@unicore.edu", "BSCS", true),

                    // 3. BCOM (2 faculty)
                    new ApprovedFaculty("BCOM-FAC-001", "Dr. P. Venkatraman", "bcom.fac001@unicore.edu", "BCOM", true),
                    new ApprovedFaculty("BCOM-FAC-002", "Prof. Sunita Aggarwal", "bcom.fac002@unicore.edu", "BCOM", true),

                    // 4. BBA (2 faculty)
                    new ApprovedFaculty("BBA-FAC-001", "Dr. Rajiv Singhania", "bba.fac001@unicore.edu", "BBA", true),
                    new ApprovedFaculty("BBA-FAC-002", "Prof. Nalini Swaminathan", "bba.fac002@unicore.edu", "BBA", true),

                    // 5. BSM (2 faculty)
                    new ApprovedFaculty("BSM-FAC-001", "Dr. T. S. Narayanan", "bsm.fac001@unicore.edu", "BSM", true),
                    new ApprovedFaculty("BSM-FAC-002", "Prof. Geetha Krishnan", "bsm.fac002@unicore.edu", "BSM", true)
            );
            approvedFacultyRepository.saveAll(faculties);
        }
    }

    private void seedCourses() {
        if (courseRepository.count() == 0) {
            List<Course> courses = Arrays.asList(
                    // BCA Courses
                    new Course("BCA101", "Programming in C", "BCA", 1, 4),
                    new Course("BCA102", "Digital Logic", "BCA", 1, 3),
                    new Course("BCA103", "Mathematics for Computing", "BCA", 1, 4),

                    new Course("BCA201", "Object Oriented Programming in Java", "BCA", 2, 4),
                    new Course("BCA202", "Data Structures & Algorithms", "BCA", 2, 4),
                    new Course("BCA203", "Database Management Systems", "BCA", 2, 3),

                    new Course("BCA301", "Operating Systems", "BCA", 3, 4),
                    new Course("BCA302", "Web Technologies", "BCA", 3, 3),
                    new Course("BCA303", "Computer Networks", "BCA", 3, 4),

                    new Course("BCA401", "Software Engineering", "BCA", 4, 3),
                    new Course("BCA402", "Python Programming", "BCA", 4, 4),
                    new Course("BCA403", "Cloud Computing", "BCA", 4, 3),

                    new Course("BCA501", "Machine Learning Foundations", "BCA", 5, 4),
                    new Course("BCA502", "Mobile Application Development", "BCA", 5, 3),
                    new Course("BCA503", "Information Security", "BCA", 5, 3),

                    new Course("BCA601", "Major Project", "BCA", 6, 6),
                    new Course("BCA602", "Artificial Intelligence", "BCA", 6, 4),

                    // BSCS Courses
                    new Course("BSCS101", "Computer Fundamentals", "BSCS", 1, 4),
                    new Course("BSCS201", "Data Structures", "BSCS", 2, 4),
                    new Course("BSCS202", "Discrete Mathematics", "BSCS", 2, 3),
                    new Course("BSCS301", "Computer Architecture", "BSCS", 3, 4),
                    new Course("BSCS401", "Design & Analysis of Algorithms", "BSCS", 4, 4),

                    // BCOM Courses
                    new Course("BCOM101", "Financial Accounting", "BCOM", 1, 4),
                    new Course("BCOM201", "Business Law", "BCOM", 2, 3),
                    new Course("BCOM202", "Corporate Accounting", "BCOM", 2, 4),
                    new Course("BCOM301", "Cost Accounting", "BCOM", 3, 4),
                    new Course("BCOM401", "Income Tax Law", "BCOM", 4, 4),

                    // BBA Courses
                    new Course("BBA101", "Principles of Management", "BBA", 1, 3),
                    new Course("BBA201", "Marketing Management", "BBA", 2, 4),
                    new Course("BBA202", "Organizational Behavior", "BBA", 2, 3),
                    new Course("BBA301", "Human Resource Management", "BBA", 3, 4),
                    new Course("BBA401", "Financial Management", "BBA", 4, 4),

                    // BSM Courses
                    new Course("BSM101", "Calculus I", "BSM", 1, 4),
                    new Course("BSM201", "Linear Algebra", "BSM", 2, 4),
                    new Course("BSM202", "Differential Equations", "BSM", 2, 3),
                    new Course("BSM301", "Real Analysis", "BSM", 3, 4),
                    new Course("BSM401", "Numerical Methods", "BSM", 4, 4)
            );
            courseRepository.saveAll(courses);
        }

        // Clean up any [DEMO] prefixes from courses in existing database
        List<Course> existingCourses = courseRepository.findAll();
        for (Course c : existingCourses) {
            if (c.getCourseName() != null && c.getCourseName().contains("[DEMO]")) {
                c.setCourseName(c.getCourseName().replace("[DEMO] ", "").replace("[DEMO]", "").trim());
                courseRepository.save(c);
            }
        }
    }

    private void seedNotifications() {
        if (notificationRepository.count() == 0) {
            List<Notification> notifications = Arrays.asList(
                    new Notification(
                            "[DEMO] Semester Registration Notice",
                            "Registration for the upcoming semester examinations will open next Monday. Please clear pending fees.",
                            NotificationType.EXAM,
                            null, null, true,
                            LocalDateTime.now().plusDays(30)
                    ),
                    new Notification(
                            "[DEMO] Library Books Return Reminder",
                            "Students are reminded to return overdue books to avoid late fines before end-semester evaluation.",
                            NotificationType.GENERAL,
                            null, null, true,
                            LocalDateTime.now().plusDays(15)
                    ),
                    new Notification(
                            "[DEMO] BCA Department Seminar",
                            "Special guest lecture on Modern Cloud Architecture scheduled this Friday at 10:00 AM.",
                            NotificationType.DEPARTMENT,
                            "BCA", null, true,
                            LocalDateTime.now().plusDays(7)
                    ),
                    new Notification(
                            "[DEMO] Tuition Fee Payment Deadline",
                            "The due date for Semester Tuition Fee payment is approaching. Check the Fees section for balance details.",
                            NotificationType.FEE,
                            null, null, true,
                            LocalDateTime.now().plusDays(20)
                    ),
                    new Notification(
                            "[DEMO] Campus Placement Drive (Archived)",
                            "Annual campus recruitment drive registration has concluded. Shortlisted candidates have been notified via departmental email.",
                            NotificationType.GENERAL,
                            null, null, true,
                            LocalDateTime.of(2026, 9, 20, 0, 0)
                    )
            );
            notificationRepository.saveAll(notifications);
        }
    }

    private void seedDemoStudent() {
        if (!seedDemoAccounts) {
            return;
        }

        ApprovedStudent approvedStudent = approvedStudentRepository.findByStudentId(demoStudentId)
                .or(() -> approvedStudentRepository.findByCollegeEmail(demoStudentEmail))
                .orElse(null);

        if (approvedStudent == null) {
            return;
        }

        userRepository.findByEmail(demoStudentEmail).ifPresentOrElse(
                existingUser -> {
                    if (!passwordEncoder.matches(demoStudentPassword, existingUser.getPasswordHash())) {
                        existingUser.setPasswordHash(passwordEncoder.encode(demoStudentPassword));
                        existingUser.setStatus(UserStatus.ACTIVE);
                        userRepository.save(existingUser);
                    }
                    if (existingUser.getStudentProfile() == null) {
                        StudentProfile profile = new StudentProfile();
                        profile.setUser(existingUser);
                        profile.setStudentId(approvedStudent.getStudentId());
                        profile.setAdmissionYear(approvedStudent.getAdmissionYear());
                        profile.setCurrentSemester(approvedStudent.getCurrentSemester());
                        existingUser.setStudentProfile(profile);
                        userRepository.save(existingUser);
                    }
                    approvedStudent.setRegistered(true);
                    approvedStudentRepository.save(approvedStudent);
                },
                () -> {
                    User user = new User();
                    user.setName(approvedStudent.getName());
                    user.setEmail(demoStudentEmail.trim().toLowerCase());
                    user.setPasswordHash(passwordEncoder.encode(demoStudentPassword));
                    user.setRole(Role.STUDENT);
                    user.setDepartment(approvedStudent.getDepartment());
                    user.setStatus(UserStatus.ACTIVE);

                    StudentProfile profile = new StudentProfile();
                    profile.setUser(user);
                    profile.setStudentId(approvedStudent.getStudentId());
                    profile.setAdmissionYear(approvedStudent.getAdmissionYear());
                    profile.setCurrentSemester(approvedStudent.getCurrentSemester());
                    user.setStudentProfile(profile);

                    User savedUser = userRepository.save(user);
                    approvedStudent.setRegistered(true);
                    approvedStudentRepository.save(approvedStudent);
                }
        );
    }

    private void seedDemoFaculty() {
        if (!seedDemoAccounts) {
            return;
        }

        ApprovedFaculty approvedFaculty = approvedFacultyRepository.findByFacultyId(demoFacultyId)
                .or(() -> approvedFacultyRepository.findByCollegeEmail(demoFacultyEmail))
                .orElse(null);

        if (approvedFaculty == null) {
            return;
        }

        userRepository.findByEmail(demoFacultyEmail).ifPresentOrElse(
                existingUser -> {
                    if (!passwordEncoder.matches(demoFacultyPassword, existingUser.getPasswordHash())) {
                        existingUser.setPasswordHash(passwordEncoder.encode(demoFacultyPassword));
                        existingUser.setStatus(UserStatus.ACTIVE);
                        userRepository.save(existingUser);
                    }
                    if (existingUser.getFacultyProfile() == null) {
                        FacultyProfile profile = new FacultyProfile();
                        profile.setUser(existingUser);
                        profile.setFacultyId(approvedFaculty.getFacultyId());
                        profile.setDepartment(approvedFaculty.getDepartment());
                        existingUser.setFacultyProfile(profile);
                        userRepository.save(existingUser);
                    }
                    approvedFaculty.setRegistered(true);
                    approvedFacultyRepository.save(approvedFaculty);
                },
                () -> {
                    User user = new User();
                    user.setName(approvedFaculty.getName());
                    user.setEmail(demoFacultyEmail.trim().toLowerCase());
                    user.setPasswordHash(passwordEncoder.encode(demoFacultyPassword));
                    user.setRole(Role.FACULTY);
                    user.setDepartment(approvedFaculty.getDepartment());
                    user.setStatus(UserStatus.ACTIVE);

                    FacultyProfile profile = new FacultyProfile();
                    profile.setUser(user);
                    profile.setFacultyId(approvedFaculty.getFacultyId());
                    profile.setDepartment(approvedFaculty.getDepartment());
                    user.setFacultyProfile(profile);

                    User savedUser = userRepository.save(user);
                    approvedFaculty.setRegistered(true);
                    approvedFacultyRepository.save(approvedFaculty);
                }
        );
    }

    /**
     * Seeds realistic demo data (enrollments, attendance records, fees, documents)
     * ONLY for students who have actually completed registration.
     * Grades are left null ("Not Yet Graded").
     */
    public void seedDataForRegisteredStudents() {
        List<StudentProfile> registeredProfiles = studentProfileRepository.findAll();
        for (StudentProfile profile : registeredProfiles) {
            studentDataInitializerService.initializeStudentData(profile.getUser(), profile);
        }
    }

    /**
     * Assigns teaching courses ONLY for faculty who have actually completed registration.
     */
    public void seedDataForRegisteredFaculty() {
        List<FacultyProfile> registeredProfiles = facultyProfileRepository.findAll();
        for (FacultyProfile profile : registeredProfiles) {
            facultyDataInitializerService.assignInitialCourses(profile.getUser(), profile);
        }
    }
}
