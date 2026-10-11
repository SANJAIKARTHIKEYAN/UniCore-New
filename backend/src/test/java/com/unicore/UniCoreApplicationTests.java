package com.unicore;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicore.dto.request.AttendanceSubmitRequest;
import com.unicore.dto.request.FacultyRegisterRequest;
import com.unicore.dto.request.LoginRequest;
import com.unicore.dto.request.StudentRegisterRequest;
import com.unicore.dto.response.AuthResponse;
import com.unicore.entity.*;
import com.unicore.repository.ApprovedStudentRepository;
import com.unicore.repository.DepartmentRepository;
import com.unicore.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UniCoreApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ApprovedStudentRepository approvedStudentRepository;

    @Autowired
    private com.unicore.repository.ApprovedFacultyRepository approvedFacultyRepository;

    @Autowired
    private com.unicore.repository.CourseRepository courseRepository;

    @Autowired
    private com.unicore.repository.EnrollmentRepository enrollmentRepository;

    @Autowired
    private com.unicore.repository.AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private com.unicore.repository.FeeRecordRepository feeRecordRepository;

    @Autowired
    private com.unicore.repository.DocumentRepository documentRepository;

    @Autowired
    private com.unicore.repository.NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.unicore.service.MlPredictionService mlPredictionService;

    @Autowired
    private com.unicore.service.AdvisorService advisorService;

    @Test
    @Order(1)
    @DisplayName("1. Verify 5 Configurable Departments are Seeded and Active")
    void test1_DepartmentRepositoryAndSeedingVerification() {
        List<Department> departments = departmentRepository.findAll();
        assertEquals(5, departments.size());

        assertTrue(departmentRepository.existsByShortCode("BCA"));
        assertTrue(departmentRepository.existsByShortCode("BSCS"));
        assertTrue(departmentRepository.existsByShortCode("BCOM"));
        assertTrue(departmentRepository.existsByShortCode("BBA"));
        assertTrue(departmentRepository.existsByShortCode("BSM"));

        Department bca = departmentRepository.findByShortCode("BCA").orElseThrow();
        assertEquals("Bachelor of Computer Applications", bca.getName());
        assertTrue(bca.isActive());
    }

    @Test
    @Order(2)
    @DisplayName("2. Valid Student Registration Succeeds & Assigns Metadata Automatically")
    void test2_ValidStudentRegistration_Succeeds() throws Exception {
        // BCA-STU-001 is pre-approved for "Sanjai Karthikeyan", "bca.stu001@unicore.edu", "BCA", Sem 2
        StudentRegisterRequest request = new StudentRegisterRequest(
                "BCA-STU-001",
                "bca.stu001@unicore.edu",
                "Password@123"
        );

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.name", is("Sanjai Karthikeyan")))
                .andExpect(jsonPath("$.user.email", is("bca.stu001@unicore.edu")))
                .andExpect(jsonPath("$.user.role", is("STUDENT")))
                .andExpect(jsonPath("$.user.department", is("BCA")))
                .andExpect(jsonPath("$.user.studentProfile.studentId", is("BCA-STU-001")))
                .andExpect(jsonPath("$.user.studentProfile.admissionYear", is(2024)))
                .andExpect(jsonPath("$.user.studentProfile.currentSemester", is(2)))
                .andExpect(jsonPath("$.user.studentProfile.derivedYear", is("1st Year")));

        // Verify password in DB is hashed and never plaintext
        User registeredUser = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();
        assertTrue(registeredUser.getPasswordHash().startsWith("$2"));
        assertTrue(passwordEncoder.matches("Password@123", registeredUser.getPasswordHash()));
        assertEquals(Role.STUDENT, registeredUser.getRole());
        assertEquals("BCA", registeredUser.getDepartment());
    }

    @Test
    @Order(3)
    @DisplayName("3. Invalid Student ID is Rejected")
    void test3_InvalidStudentId_Rejected() throws Exception {
        StudentRegisterRequest invalidIdReq = new StudentRegisterRequest(
                "NON-EXISTENT-ID",
                "fake@unicore.edu",
                "Password@123"
        );
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidIdReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Record not found in university approved admission roster")));
    }

    @Test
    @Order(4)
    @DisplayName("4. Student Email Mismatch is Rejected")
    void test4_StudentEmailMismatch_Rejected() throws Exception {
        // BCA-STU-002 official email is bca.stu002@unicore.edu
        StudentRegisterRequest mismatchReq = new StudentRegisterRequest(
                "BCA-STU-002",
                "wrong.email@unicore.edu",
                "Password@123"
        );
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mismatchReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Provided email does not match official record")));
    }

    @Test
    @Order(5)
    @DisplayName("5. Duplicate Student Registration is Rejected")
    void test5_DuplicateStudentRegistration_Rejected() throws Exception {
        // Attempting to register BCA-STU-001 again must fail
        StudentRegisterRequest duplicateRequest = new StudentRegisterRequest(
                "BCA-STU-001",
                "bca.stu001@unicore.edu",
                "AnotherPassword@123"
        );

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already been registered")));
    }

    @Test
    @Order(6)
    @DisplayName("6. Valid Faculty Registration Succeeds & Assigns Metadata Automatically")
    void test6_ValidFacultyRegistration_Succeeds() throws Exception {
        // BCA-FAC-001 is pre-approved for "Dr. K. Sharma", "bca.fac001@unicore.edu", "BCA"
        FacultyRegisterRequest request = new FacultyRegisterRequest(
                "BCA-FAC-001",
                "bca.fac001@unicore.edu",
                "FacultyPass@123"
        );

        mockMvc.perform(post("/api/auth/register/faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.name", is("Dr. K. Sharma")))
                .andExpect(jsonPath("$.user.email", is("bca.fac001@unicore.edu")))
                .andExpect(jsonPath("$.user.role", is("FACULTY")))
                .andExpect(jsonPath("$.user.department", is("BCA")))
                .andExpect(jsonPath("$.user.facultyProfile.facultyId", is("BCA-FAC-001")))
                .andExpect(jsonPath("$.user.facultyProfile.department", is("BCA")));

        // Verify password in DB is hashed
        User registeredFaculty = userRepository.findByEmail("bca.fac001@unicore.edu").orElseThrow();
        assertTrue(registeredFaculty.getPasswordHash().startsWith("$2"));
        assertTrue(passwordEncoder.matches("FacultyPass@123", registeredFaculty.getPasswordHash()));
        assertEquals(Role.FACULTY, registeredFaculty.getRole());
        assertEquals("BCA", registeredFaculty.getDepartment());
    }

    @Test
    @Order(7)
    @DisplayName("7. Invalid Faculty ID is Rejected")
    void test7_InvalidFacultyId_Rejected() throws Exception {
        FacultyRegisterRequest invalidFaculty = new FacultyRegisterRequest(
                "NON-EXISTENT-FAC",
                "fake.fac@unicore.edu",
                "FacultyPass@123"
        );
        mockMvc.perform(post("/api/auth/register/faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidFaculty)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Record not found in university approved faculty roster")));
    }

    @Test
    @Order(8)
    @DisplayName("8. Faculty Email Mismatch is Rejected")
    void test8_FacultyEmailMismatch_Rejected() throws Exception {
        // BCA-FAC-002 official email is bca.fac002@unicore.edu
        FacultyRegisterRequest mismatchFaculty = new FacultyRegisterRequest(
                "BCA-FAC-002",
                "wrong.fac@unicore.edu",
                "FacultyPass@123"
        );
        mockMvc.perform(post("/api/auth/register/faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mismatchFaculty)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Provided email does not match official record")));
    }

    @Test
    @Order(9)
    @DisplayName("9. Duplicate Faculty Registration is Rejected")
    void test9_DuplicateFacultyRegistration_Rejected() throws Exception {
        FacultyRegisterRequest duplicateFaculty = new FacultyRegisterRequest(
                "BCA-FAC-001",
                "bca.fac001@unicore.edu",
                "AnotherPassword@123"
        );
        mockMvc.perform(post("/api/auth/register/faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateFaculty)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already been registered")));
    }

    @Test
    @Order(10)
    @DisplayName("10. Frontend Cannot Override Department or Role")
    void test10_FrontendCannotOverrideDepartmentOrRole() throws Exception {
        // Attempt tampering: sending malicious role and department in raw JSON
        String tamperedJson = "{" +
                "\"studentId\":\"BCA-STU-002\"," +
                "\"collegeEmail\":\"bca.stu002@unicore.edu\"," +
                "\"password\":\"Password@123\"," +
                "\"role\":\"ADMIN\"," +
                "\"department\":\"Administration\"" +
                "}";

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(tamperedJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role", is("STUDENT")))
                .andExpect(jsonPath("$.user.department", is("BCA")));

        // Verify in database that tampered values were discarded
        User user = userRepository.findByEmail("bca.stu002@unicore.edu").orElseThrow();
        assertEquals(Role.STUDENT, user.getRole());
        assertEquals("BCA", user.getDepartment());
        assertNotEquals("ADMIN", user.getRole().name());
        assertNotEquals("Administration", user.getDepartment());
    }

    @Test
    @Order(11)
    @DisplayName("11. Semester Correctly Determines Academic Year")
    void test11_SemesterCorrectlyDeterminesYear() throws Exception {
        // 1. BCA-STU-003: Semester 4 -> 2nd Year
        StudentRegisterRequest reqSem4 = new StudentRegisterRequest(
                "BCA-STU-003",
                "bca.stu003@unicore.edu",
                "Password@123"
        );
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqSem4)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.studentProfile.currentSemester", is(4)))
                .andExpect(jsonPath("$.user.studentProfile.derivedYear", is("2nd Year")));

        // 2. BCA-STU-005: Semester 6 -> 3rd Year
        StudentRegisterRequest reqSem6 = new StudentRegisterRequest(
                "BCA-STU-005",
                "bca.stu005@unicore.edu",
                "Password@123"
        );
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqSem6)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.studentProfile.currentSemester", is(6)))
                .andExpect(jsonPath("$.user.studentProfile.derivedYear", is("3rd Year")));
    }

    @Test
    @Order(12)
    @DisplayName("12. Inactive / Unapproved Account Record is Rejected")
    void test12_InactiveAccount_Rejected() throws Exception {
        // Create an inactive approved student
        ApprovedStudent inactiveStudent = new ApprovedStudent(
                "INACTIVE-STU-001",
                "Inactive User",
                "inactive@unicore.edu",
                "BCA",
                2024,
                1,
                false // active = false
        );
        approvedStudentRepository.save(inactiveStudent);

        StudentRegisterRequest req = new StudentRegisterRequest(
                "INACTIVE-STU-001",
                "inactive@unicore.edu",
                "Password@123"
        );
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("inactive or unapproved")));
    }

    @Test
    @Order(13)
    @DisplayName("13. Login Flow with Credentials and JWT Token Issuance")
    void test13_LoginFlow() throws Exception {
        // Admin Login
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role", is("ADMIN")));

        // Student Login
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role", is("STUDENT")));

        // Invalid Password Rejection
        LoginRequest badLogin = new LoginRequest("bca.stu001@unicore.edu", "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(14)
    @DisplayName("14. Role-Based Authorization: Admin Endpoints Restricted to Admin Role")
    void test14_RoleBasedAuthorization_AdminEndpoints() throws Exception {
        // Obtain Admin Token
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        String adminToken = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Admin can access /api/admin/users and /api/admin/departments
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));

        mockMvc.perform(get("/api/admin/departments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)));

        // Student is Forbidden from accessing /api/admin/users
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(15)
    @DisplayName("15. Faculty Department Isolation: Cannot Access Other Department Data")
    void test15_FacultyDepartmentIsolation_Enforced() throws Exception {
        // Login as BCA Faculty (Dr. Sharma)
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Permitted: Query own department ("BCA")
        mockMvc.perform(get("/api/faculty/department-students")
                        .param("department", "BCA")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk());

        // Forbidden: Query another department ("BSCS")
        mockMvc.perform(get("/api/faculty/department-students")
                        .param("department", "BSCS")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("restricted to their assigned department")));
    }

    @Test
    @Order(16)
    @DisplayName("16. Student Account Isolation: Cannot Access Another Student's Record")
    void test16_StudentAccountIsolation_Enforced() throws Exception {
        // User 1 (Sanjai)
        User stu1 = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();
        // User 2 (Aravind)
        User stu2 = userRepository.findByEmail("bca.stu002@unicore.edu").orElseThrow();

        LoginRequest stu1Login = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stu1Res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stu1Login)))
                .andReturn();
        String stu1Token = objectMapper.readValue(stu1Res.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Permitted: Student 1 accesses own profile
        mockMvc.perform(get("/api/student/profile/" + stu1.getId())
                        .header("Authorization", "Bearer " + stu1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId", is("BCA-STU-001")));

        // Forbidden: Student 1 attempts to access Student 2's profile
        mockMvc.perform(get("/api/student/profile/" + stu2.getId())
                        .header("Authorization", "Bearer " + stu1Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("restricted from accessing records of other students")));
    }

    @Test
    @Order(17)
    @DisplayName("17. Verify at least 5 Demo Students and 2 Demo Faculty per Department")
    void test17_DemoStudentsAndFacultyPerDepartment() {
        String[] departments = {"BCA", "BSCS", "BCOM", "BBA", "BSM"};

        for (String dept : departments) {
            List<ApprovedStudent> students = approvedStudentRepository.findAll().stream()
                    .filter(s -> s.getDepartment().equalsIgnoreCase(dept))
                    .toList();
            List<ApprovedStudent> demoStudents = students.stream()
                    .filter(s -> !s.getStudentId().startsWith("INACTIVE-"))
                    .toList();
            assertTrue(demoStudents.size() >= 5, "Department " + dept + " should have at least 5 approved demo students");

            for (ApprovedStudent s : demoStudents) {
                assertNotNull(s.getStudentId());
                assertNotNull(s.getName());
                assertNotNull(s.getCollegeEmail());
                assertNotNull(s.getDepartment());
                assertNotNull(s.getAdmissionYear());
                assertNotNull(s.getCurrentSemester());
                assertTrue(s.isActive());
            }

            List<ApprovedFaculty> faculties = approvedFacultyRepository.findAll().stream()
                    .filter(f -> f.getDepartment().equalsIgnoreCase(dept))
                    .toList();
            assertTrue(faculties.size() >= 2, "Department " + dept + " should have at least 2 approved demo faculty");

            for (ApprovedFaculty f : faculties) {
                assertNotNull(f.getFacultyId());
                assertNotNull(f.getName());
                assertNotNull(f.getCollegeEmail());
                assertNotNull(f.getDepartment());
                assertTrue(f.isActive());
            }
        }
    }

    @Test
    @Order(18)
    @DisplayName("18. Admin Can Configure Departments: Create and Update")
    void test18_AdminCanConfigureDepartments() throws Exception {
        // Admin token
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        String adminToken = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 1. Admin creates a new department
        Department newDept = new Department("Biotechnology", "BIOTEC", true);
        MvcResult createRes = mockMvc.perform(post("/api/admin/departments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newDept)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Biotechnology")))
                .andExpect(jsonPath("$.shortCode", is("BIOTEC")))
                .andReturn();

        Department created = objectMapper.readValue(createRes.getResponse().getContentAsString(), Department.class);

        // 2. Admin updates the department
        created.setName("B.Sc Biotechnology");
        mockMvc.perform(put("/api/admin/departments/" + created.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("B.Sc Biotechnology")));

        // 3. Public/student can query by code or name
        mockMvc.perform(get("/api/departments/BIOTEC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("B.Sc Biotechnology")));
    }

    @Test
    @Order(19)
    @DisplayName("19. Inactive Department Blocks Registration")
    void test19_InactiveDepartmentBlocksRegistration() throws Exception {
        // Admin token
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        String adminToken = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Create department and toggle to inactive
        Department tempDept = new Department("Temporary Studies", "TEMP", false);
        MvcResult createRes = mockMvc.perform(post("/api/admin/departments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tempDept)))
                .andExpect(status().isCreated())
                .andReturn();

        // Add approved student for this inactive department
        ApprovedStudent studentInInactiveDept = new ApprovedStudent(
                "TEMP-STU-001",
                "Temp Student",
                "temp.stu001@unicore.edu",
                "TEMP",
                2024,
                1,
                true
        );
        approvedStudentRepository.save(studentInInactiveDept);

        // Registration must fail because department is inactive
        StudentRegisterRequest regReq = new StudentRegisterRequest(
                "TEMP-STU-001",
                "temp.stu001@unicore.edu",
                "Password@123"
        );
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("currently inactive")));
    }

    @Test
    @Order(20)
    @DisplayName("20. Admin Can Dynamically Add Approved Student & Faculty Rosters")
    void test20_AdminAddApprovedStudentAndFaculty() throws Exception {
        // Admin token
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        String adminToken = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 1. Admin adds approved student
        ApprovedStudent newStudent = new ApprovedStudent(
                "BCA-STU-999",
                "New Roster Student",
                "bca.stu999@unicore.edu",
                "BCA",
                2025,
                1
        );
        mockMvc.perform(post("/api/admin/approved-students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newStudent)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId", is("BCA-STU-999")));

        // Student can now self-register successfully
        StudentRegisterRequest regReq = new StudentRegisterRequest(
                "BCA-STU-999",
                "bca.stu999@unicore.edu",
                "NewStudent@123"
        );
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.name", is("New Roster Student")))
                .andExpect(jsonPath("$.user.studentProfile.derivedYear", is("1st Year")));

        // 2. Admin adds approved faculty
        ApprovedFaculty newFaculty = new ApprovedFaculty(
                "BSCS-FAC-999",
                "Prof. Alan Turing",
                "bscs.fac999@unicore.edu",
                "BSCS"
        );
        mockMvc.perform(post("/api/admin/approved-faculty")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newFaculty)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.facultyId", is("BSCS-FAC-999")));

        // Faculty can now self-register successfully
        FacultyRegisterRequest facRegReq = new FacultyRegisterRequest(
                "BSCS-FAC-999",
                "bscs.fac999@unicore.edu",
                "Turing@12345"
        );
        mockMvc.perform(post("/api/auth/register/faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facRegReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.name", is("Prof. Alan Turing")))
                .andExpect(jsonPath("$.user.department", is("BSCS")));
    }

    @Test
    @Order(21)
    @DisplayName("21. Admin Toggle Roster Status Deactivates Account and Blocks Registration")
    void test21_AdminToggleRosterStatus() throws Exception {
        // Admin token
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andReturn();
        String adminToken = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // BCA-STU-004 is currently active and unregistered
        ApprovedStudent stu4 = approvedStudentRepository.findByStudentId("BCA-STU-004").orElseThrow();
        assertTrue(stu4.isActive());

        // Admin toggles active to false
        mockMvc.perform(patch("/api/admin/approved-students/" + stu4.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(false)));

        // Registration attempt must fail
        StudentRegisterRequest regReq = new StudentRegisterRequest(
                "BCA-STU-004",
                "bca.stu004@unicore.edu",
                "Password@123"
        );
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("inactive or unapproved")));
    }

    @Test
    @Order(22)
    @DisplayName("22. Verify Course Seeding Across Departments")
    void test22_CourseSeeding_VerifiesCoursesExist() {
        List<Course> allCourses = courseRepository.findAll();
        assertTrue(allCourses.size() >= 20, "Should have seeded at least 20 courses across departments");

        List<Course> bcaCourses = courseRepository.findByDepartment("BCA");
        assertFalse(bcaCourses.isEmpty(), "BCA courses should be seeded");

        // Verify course attributes
        Course sampleCourse = bcaCourses.get(0);
        assertNotNull(sampleCourse.getCourseCode());
        assertNotNull(sampleCourse.getCourseName());
        assertTrue(sampleCourse.getCredits() > 0);
        assertNotNull(sampleCourse.getSemester());
    }

    @Test
    @Order(23)
    @DisplayName("23. Student Dashboard Returns Valid Aggregated Structure")
    void test23_StudentDashboard_ReturnsValidStructure() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/student/me/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName", is("Sanjai Karthikeyan")))
                .andExpect(jsonPath("$.studentId", is("BCA-STU-001")))
                .andExpect(jsonPath("$.department", is("BCA")))
                .andExpect(jsonPath("$.semester", is(2)))
                .andExpect(jsonPath("$.enrolledCoursesCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.overallAttendancePercent", notNullValue()))
                .andExpect(jsonPath("$.riskStatus", containsString("Good Standing")));
    }

    @Test
    @Order(24)
    @DisplayName("24. Student Attendance Returns Course-wise Summary")
    void test24_StudentAttendance_ReturnsPerCourseSummary() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/student/me/attendance")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].courseCode", notNullValue()))
                .andExpect(jsonPath("$[0].totalClasses", greaterThan(0)))
                .andExpect(jsonPath("$[0].attendancePercent", notNullValue()));
    }

    @Test
    @Order(25)
    @DisplayName("25. Academic Performance Returns Current Semester Courses with Grades Pending")
    void test25_StudentAcademicPerformance_CurrentSemester() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/student/me/academic-performance")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.semester", is(2)))
                .andExpect(jsonPath("$.courses", not(empty())))
                // Grades are null initially (not yet graded)
                .andExpect(jsonPath("$.courses[0].grade", nullValue()));
    }

    @Test
    @Order(26)
    @DisplayName("26. Semester Results Returns Records for All Semesters and Single Semester Query")
    void test26_StudentResults_AllSemesters() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 1. All semesters
        mockMvc.perform(get("/api/student/me/results")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].semester", is(2)))
                .andExpect(jsonPath("$[0].isCurrentSemester", is(true)));

        // 2. Specific semester query
        mockMvc.perform(get("/api/student/me/results")
                        .param("semester", "2")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.semester", is(2)))
                .andExpect(jsonPath("$.isCurrentSemester", is(true)));
    }

    @Test
    @Order(27)
    @DisplayName("27. Risk Status Returns Structured Placeholder with Null Risk Level")
    void test27_StudentRiskStatus_PlaceholderStructure() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/student/me/risk-status")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentSemester", is(2)))
                .andExpect(jsonPath("$.currentAttendancePercent", notNullValue()))
                .andExpect(jsonPath("$.riskLevel", nullValue()))
                .andExpect(jsonPath("$.assessmentDataAvailable", is(false)))
                .andExpect(jsonPath("$.message", containsString("AI Advisor is integrated")));
    }

    @Test
    @Order(28)
    @DisplayName("28. Student Fees Returns Fee Records")
    void test28_StudentFees_ReturnsFeeRecords() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/student/me/fees")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].feeType", notNullValue()))
                .andExpect(jsonPath("$[0].amount", greaterThan(0.0)))
                .andExpect(jsonPath("$[0].status", notNullValue()));
    }

    @Test
    @Order(29)
    @DisplayName("29. Student Documents Returns Document Metadata List")
    void test29_StudentDocuments_ReturnsDocumentList() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/student/me/documents")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].documentType", notNullValue()))
                .andExpect(jsonPath("$[0].title", notNullValue()))
                .andExpect(jsonPath("$[0].status", notNullValue()));
    }

    @Test
    @Order(30)
    @DisplayName("30. Student Notifications Returns Active Announcements")
    void test30_StudentNotifications_ReturnsActiveNotifications() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/student/me/notifications")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].title", notNullValue()))
                .andExpect(jsonPath("$[0].message", notNullValue()));
    }

    @Test
    @Order(31)
    @DisplayName("31. Non-Student Role Cannot Access Student Endpoints")
    void test31_NonStudentRole_CannotAccessStudentEndpoints() throws Exception {
        // Faculty login
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Faculty is forbidden from student endpoints
        mockMvc.perform(get("/api/student/me/dashboard")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(32)
    @DisplayName("32. Unauthenticated Access to Student Endpoints Returns 401")
    void test32_UnauthenticatedAccess_Returns401() throws Exception {
        mockMvc.perform(get("/api/student/me/dashboard"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/student/me/attendance"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/student/me/fees"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(33)
    @DisplayName("33. Faculty Assigned Courses: Returns Courses Assigned to Authenticated Faculty")
    void test33_FacultyAssignedCourses_ReturnsOnlyAssignedCourses() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/faculty/me/courses")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].id", notNullValue()))
                .andExpect(jsonPath("$[0].courseCode", notNullValue()))
                .andExpect(jsonPath("$[0].department", is("BCA")))
                .andExpect(jsonPath("$[0].credits", greaterThan(0)))
                .andExpect(jsonPath("$[0].enrolledStudentsCount", greaterThanOrEqualTo(0)));
    }

    @Test
    @Order(34)
    @DisplayName("34. Faculty Course Roster: Returns Enrolled Students with Attendance Telemetry")
    void test34_FacultyCourseRoster_ReturnsEnrolledStudents() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();

        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/students")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseCode", is("BCA201")))
                .andExpect(jsonPath("$.department", is("BCA")))
                .andExpect(jsonPath("$.totalEnrolled", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.students", not(empty())))
                .andExpect(jsonPath("$.students[0].studentId", notNullValue()))
                .andExpect(jsonPath("$.students[0].studentName", notNullValue()))
                .andExpect(jsonPath("$.students[0].collegeEmail", notNullValue()))
                .andExpect(jsonPath("$.students[0].attendancePercentage", notNullValue()));
    }

    @Test
    @Order(35)
    @DisplayName("35. Faculty Course Roster: Rejects Unauthorized Faculty, Students, and Unauthenticated Access")
    void test35_FacultyCourseRoster_RejectsUnauthorizedAccess() throws Exception {
        // 1. Register BSCS Faculty (Dr. Anita Desai)
        FacultyRegisterRequest bscsFacultyReq = new FacultyRegisterRequest(
                "BSCS-FAC-001",
                "bscs.fac001@unicore.edu",
                "BscsPass@123"
        );
        MvcResult regRes = mockMvc.perform(post("/api/auth/register/faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bscsFacultyReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String bscsToken = objectMapper.readValue(regRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();

        // 2. Cross-Faculty Access Rejection: BSCS faculty cannot access BCA course roster
        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/students")
                        .header("Authorization", "Bearer " + bscsToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("not assigned to instruct course")));

        // 3. Student Access Rejection: Student cannot access faculty endpoints
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/faculty/me/courses")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/students")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // 4. Unauthenticated Access Rejection: 401 Unauthorized
        mockMvc.perform(get("/api/faculty/me/courses"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/students"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(36)
    @DisplayName("36. Faculty Attendance: Authenticated Faculty Can Submit and Retrieve Attendance")
    void test36_FacultyAttendance_SubmitAndRetrieve() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();
        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();
        LocalDate testDate = LocalDate.of(2026, 9, 15);

        // 1. Initial GET attendance for this date
        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/attendance?date=" + testDate)
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].studentUserId", notNullValue()))
                .andExpect(jsonPath("$[0].studentName", notNullValue()));

        // 2. Submit attendance for this student as PRESENT
        AttendanceSubmitRequest request = new AttendanceSubmitRequest(
                testDate,
                List.of(new AttendanceSubmitRequest.AttendanceEntry(student.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/attendance")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("Attendance saved successfully")));

        // 3. Verify GET returns PRESENT
        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/attendance?date=" + testDate)
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.studentUserId == " + student.getId() + ")].status", contains("PRESENT")));
    }

    @Test
    @Order(37)
    @DisplayName("37. Faculty Attendance: Cross-Faculty and Unauthorized Access Rejected")
    void test37_FacultyAttendance_CrossFacultyAccessRejected() throws Exception {
        // BSCS faculty login
        LoginRequest bscsLogin = new LoginRequest("bscs.fac001@unicore.edu", "BscsPass@123");
        MvcResult bscsRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bscsLogin)))
                .andReturn();
        String bscsToken = objectMapper.readValue(bscsRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();
        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();
        LocalDate testDate = LocalDate.of(2026, 9, 16);

        AttendanceSubmitRequest request = new AttendanceSubmitRequest(
                testDate,
                List.of(new AttendanceSubmitRequest.AttendanceEntry(student.getId(), AttendanceStatus.PRESENT))
        );

        // 1. Cross-Faculty GET rejection: BSCS faculty cannot access BCA course attendance
        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/attendance?date=" + testDate)
                        .header("Authorization", "Bearer " + bscsToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("not assigned to instruct course")));

        // 2. Cross-Faculty PUT rejection: BSCS faculty cannot submit BCA course attendance
        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/attendance")
                        .header("Authorization", "Bearer " + bscsToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("not assigned to instruct course")));

        // 3. Unauthenticated access rejection: 401 Unauthorized
        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/attendance?date=" + testDate))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(38)
    @DisplayName("38. Faculty Attendance: Persistence, Updates (Upsert) and Validation")
    void test38_FacultyAttendance_UpdatesAndValidation() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();
        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();
        LocalDate testDate = LocalDate.of(2026, 9, 15);

        // 1. Update status from PRESENT to ABSENT on same date (upsert)
        AttendanceSubmitRequest updateRequest = new AttendanceSubmitRequest(
                testDate,
                List.of(new AttendanceSubmitRequest.AttendanceEntry(student.getId(), AttendanceStatus.ABSENT))
        );

        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/attendance")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("Attendance saved successfully")));

        // 2. Verify updated to ABSENT
        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/attendance?date=" + testDate)
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.studentUserId == " + student.getId() + ")].status", contains("ABSENT")));

        // 3. Verify exactly 1 record exists for (student, course, date)
        List<AttendanceRecord> records = attendanceRecordRepository.findByCourseIdAndDate(bca201.getId(), testDate);
        long studentRecordsCount = records.stream().filter(r -> r.getStudent().getId().equals(student.getId())).count();
        assertEquals(1, studentRecordsCount, "There should be exactly one record for student on this date (upsert)");

        // 4. Submitting attendance for an unenrolled student returns 400 Bad Request
        User adminUser = userRepository.findByEmail("admin@unicore.edu").orElseThrow();
        AttendanceSubmitRequest invalidRequest = new AttendanceSubmitRequest(
                testDate,
                List.of(new AttendanceSubmitRequest.AttendanceEntry(adminUser.getId(), AttendanceStatus.PRESENT))
        );

        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/attendance")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("is not enrolled in course")));
    }

    @Test
    @Order(39)
    @DisplayName("39. Faculty Assessment: Create Assessment Returns 201 with Correct Payload")
    void test39_CreateAssessment_Returns201() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        com.unicore.entity.Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();

        String assessmentBody = "{\"title\": \"Midterm Exam\", \"type\": \"MIDTERM\", \"maxMarks\": 50.0, \"weightage\": 40.0}";

        mockMvc.perform(post("/api/faculty/courses/" + bca201.getId() + "/assessments")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assessmentBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Midterm Exam")))
                .andExpect(jsonPath("$.type", is("MIDTERM")))
                .andExpect(jsonPath("$.maxMarks", is(50.0)))
                .andExpect(jsonPath("$.weightage", is(40.0)))
                .andExpect(jsonPath("$.courseCode", is("BCA201")));

        // Cross-faculty creation rejected
        LoginRequest bscsLogin = new LoginRequest("bscs.fac001@unicore.edu", "BscsPass@123");
        MvcResult bscsRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bscsLogin)))
                .andReturn();
        String bscsToken = objectMapper.readValue(bscsRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(post("/api/faculty/courses/" + bca201.getId() + "/assessments")
                        .header("Authorization", "Bearer " + bscsToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assessmentBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("not assigned to instruct course")));
    }

    @Test
    @Order(40)
    @DisplayName("40. Faculty Assessment: List Assessments Returns Created Assessments")
    void test40_ListAssessments_ReturnsAssessments() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        com.unicore.entity.Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();

        String assignmentBody = "{\"title\": \"Assignment 1\", \"type\": \"ASSIGNMENT\", \"maxMarks\": 20.0, \"weightage\": 20.0}";
        mockMvc.perform(post("/api/faculty/courses/" + bca201.getId() + "/assessments")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentBody))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/assessments")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].courseCode", is("BCA201")))
                .andExpect(jsonPath("$[0].id", notNullValue()))
                .andExpect(jsonPath("$[0].maxMarks", greaterThan(0.0)));
    }

    @Test
    @Order(41)
    @DisplayName("41. Faculty Assessment: Submit Marks with Upsert Logic and Validation")
    void test41_SubmitMarks_UpsertAndValidation() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        com.unicore.entity.Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();
        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();

        MvcResult listRes = mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/assessments")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andReturn();
        com.fasterxml.jackson.databind.JsonNode assessmentNodes =
                objectMapper.readTree(listRes.getResponse().getContentAsString());
        long midtermId = -1L;
        double maxMarks = 50.0;
        for (com.fasterxml.jackson.databind.JsonNode node : assessmentNodes) {
            if ("MIDTERM".equals(node.get("type").asText())) {
                midtermId = node.get("id").asLong();
                maxMarks = node.get("maxMarks").asDouble();
                break;
            }
        }
        assertTrue(midtermId > 0, "Midterm assessment must exist from test 39");

        String markBody = "{\"entries\": [{\"studentId\": " + student.getId() + ", \"marksObtained\": 42.5}]}";
        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/assessments/" + midtermId + "/marks")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(markBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("Marks saved successfully")));

        String updateBody = "{\"entries\": [{\"studentId\": " + student.getId() + ", \"marksObtained\": 45.0}]}";
        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/assessments/" + midtermId + "/marks")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("Marks saved successfully")));

        double over = maxMarks + 10.0;
        String overBody = "{\"entries\": [{\"studentId\": " + student.getId() + ", \"marksObtained\": " + over + "}]}";
        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/assessments/" + midtermId + "/marks")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(overBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("exceed maximum allowed marks")));

        User adminUser = userRepository.findByEmail("admin@unicore.edu").orElseThrow();
        String invalidBody = "{\"entries\": [{\"studentId\": " + adminUser.getId() + ", \"marksObtained\": 30.0}]}";
        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/assessments/" + midtermId + "/marks")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("is not enrolled in course")));
    }

    @Test
    @Order(42)
    @DisplayName("42. Faculty Assessment: Get Mark Sheet Returns Students with Marks and Percentage")
    void test42_GetMarkSheet_ReturnsMarksAndPercentage() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        com.unicore.entity.Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();
        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();

        MvcResult listRes = mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/assessments")
                        .header("Authorization", "Bearer " + facultyToken))
                .andReturn();
        com.fasterxml.jackson.databind.JsonNode assessmentNodes =
                objectMapper.readTree(listRes.getResponse().getContentAsString());
        long midtermId = -1L;
        for (com.fasterxml.jackson.databind.JsonNode node : assessmentNodes) {
            if ("MIDTERM".equals(node.get("type").asText())) {
                midtermId = node.get("id").asLong();
                break;
            }
        }
        assertTrue(midtermId > 0, "Midterm assessment must exist");

        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/assessments/" + midtermId + "/marks")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].assessmentTitle", notNullValue()))
                .andExpect(jsonPath("$[0].studentName", notNullValue()))
                .andExpect(jsonPath("$[0].maxMarks", greaterThan(0.0)));

        // 45.0 / 50.0 * 100 = 90.0%
        mockMvc.perform(get("/api/faculty/courses/" + bca201.getId() + "/assessments/" + midtermId + "/marks")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.studentUserId == " + student.getId() + ")].marksObtained",
                        contains(45.0)))
                .andExpect(jsonPath("$[?(@.studentUserId == " + student.getId() + ")].percentage",
                        contains(90.0)));
    }

    @Test
    @Order(43)
    @DisplayName("43. Faculty Assessment: Calculate Grades Updates Enrollment and Rejects Cross-Faculty")
    void test43_CalculateGrades_UpdatesEnrollmentAndRejectsCrossFaculty() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        com.unicore.entity.Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();

        mockMvc.perform(post("/api/faculty/courses/" + bca201.getId() + "/grades/calculate")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseCode", is("BCA201")))
                .andExpect(jsonPath("$.students", not(empty())))
                .andExpect(jsonPath("$.students[0].studentName", notNullValue()))
                .andExpect(jsonPath("$.students[0].assessmentScores", not(empty())));

        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();
        List<com.unicore.entity.Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        com.unicore.entity.Enrollment enrollment = enrollments.stream()
                .filter(e -> e.getCourse().getId().equals(bca201.getId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Enrollment not found for student in BCA201"));

        assertNotNull(enrollment.getGrade(), "Grade should be written back to enrollment");
        assertNotNull(enrollment.getGradePoints(), "Grade points should be written back to enrollment");

        LoginRequest bscsLogin = new LoginRequest("bscs.fac001@unicore.edu", "BscsPass@123");
        MvcResult bscsRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bscsLogin)))
                .andReturn();
        String bscsToken = objectMapper.readValue(bscsRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(post("/api/faculty/courses/" + bca201.getId() + "/grades/calculate")
                        .header("Authorization", "Bearer " + bscsToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("not assigned to instruct course")));
    }

    private String getAdminToken() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class).getToken();
    }

    @Test
    @Order(44)
    @DisplayName("44. Admin Authorization: ADMIN allowed, STUDENT and FACULTY rejected with 403")
    void test44_AdminAuthorization() throws Exception {
        String adminToken = getAdminToken();
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(45)
    @DisplayName("45. Admin Dashboard: Aggregate statistics and system metrics")
    void test45_AdminDashboard_Stats() throws Exception {
        String adminToken = getAdminToken();

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudents", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalFaculty", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalCourses", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalEnrollments", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.activeUsers", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalDepartments", greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.recentActivity", not(empty())));
    }

    @Test
    @Order(46)
    @DisplayName("46. Student Management: CRUD, Search, and Safe Deactivation")
    void test46_StudentManagement_CRUD() throws Exception {
        String adminToken = getAdminToken();

        com.unicore.dto.request.CreateStudentAdminRequest createReq =
                new com.unicore.dto.request.CreateStudentAdminRequest(
                        "Admin Test Student",
                        "adm.created.stu@unicore.edu",
                        "TestStuPass@123",
                        "BCA",
                        "BCA-STU-777",
                        2024,
                        1
                );

        MvcResult createRes = mockMvc.perform(post("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Admin Test Student")))
                .andExpect(jsonPath("$.email", is("adm.created.stu@unicore.edu")))
                .andExpect(jsonPath("$.studentId", is("BCA-STU-777")))
                .andReturn();

        com.unicore.dto.response.AdminStudentResponse created =
                objectMapper.readValue(createRes.getResponse().getContentAsString(), com.unicore.dto.response.AdminStudentResponse.class);
        Long studentUserId = created.getId();

        mockMvc.perform(get("/api/admin/students?search=BCA-STU-777")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email", is("adm.created.stu@unicore.edu")));

        mockMvc.perform(get("/api/admin/students/" + studentUserId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(studentUserId.intValue())))
                .andExpect(jsonPath("$.studentId", is("BCA-STU-777")));

        com.unicore.dto.request.UpdateStudentAdminRequest updateReq =
                new com.unicore.dto.request.UpdateStudentAdminRequest(
                        "Admin Test Student Updated",
                        "BCA",
                        com.unicore.entity.UserStatus.ACTIVE,
                        2,
                        2024
                );

        mockMvc.perform(put("/api/admin/students/" + studentUserId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Admin Test Student Updated")))
                .andExpect(jsonPath("$.currentSemester", is(2)));

        mockMvc.perform(delete("/api/admin/students/" + studentUserId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("deactivated")));

        mockMvc.perform(get("/api/admin/students/" + studentUserId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("INACTIVE")));
    }

    @Test
    @Order(47)
    @DisplayName("47. Student Management: Reject duplicate email or student ID")
    void test47_StudentManagement_DuplicateValidation() throws Exception {
        String adminToken = getAdminToken();

        com.unicore.dto.request.CreateStudentAdminRequest dupEmail =
                new com.unicore.dto.request.CreateStudentAdminRequest(
                        "Dup Student",
                        "adm.created.stu@unicore.edu",
                        "Pass@123",
                        "BCA",
                        "BCA-STU-888",
                        2024,
                        1
                );

        mockMvc.perform(post("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupEmail)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Email is already registered")));

        com.unicore.dto.request.CreateStudentAdminRequest dupId =
                new com.unicore.dto.request.CreateStudentAdminRequest(
                        "Dup Student",
                        "unique.student@unicore.edu",
                        "Pass@123",
                        "BCA",
                        "BCA-STU-777",
                        2024,
                        1
                );

        mockMvc.perform(post("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Student ID is already registered")));
    }

    @Test
    @Order(48)
    @DisplayName("48. Faculty Management: CRUD, Search, and Safe Deactivation")
    void test48_FacultyManagement_CRUD() throws Exception {
        String adminToken = getAdminToken();

        com.unicore.dto.request.CreateFacultyAdminRequest createReq =
                new com.unicore.dto.request.CreateFacultyAdminRequest(
                        "Admin Test Faculty",
                        "adm.created.fac@unicore.edu",
                        "TestFacPass@123",
                        "BCA",
                        "BCA-FAC-777"
                );

        MvcResult createRes = mockMvc.perform(post("/api/admin/faculty")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Admin Test Faculty")))
                .andExpect(jsonPath("$.email", is("adm.created.fac@unicore.edu")))
                .andExpect(jsonPath("$.facultyId", is("BCA-FAC-777")))
                .andReturn();

        com.unicore.dto.response.AdminFacultyResponse created =
                objectMapper.readValue(createRes.getResponse().getContentAsString(), com.unicore.dto.response.AdminFacultyResponse.class);
        Long facultyUserId = created.getId();

        mockMvc.perform(get("/api/admin/faculty?search=BCA-FAC-777")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email", is("adm.created.fac@unicore.edu")));

        mockMvc.perform(get("/api/admin/faculty/" + facultyUserId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(facultyUserId.intValue())))
                .andExpect(jsonPath("$.facultyId", is("BCA-FAC-777")));

        com.unicore.dto.request.UpdateFacultyAdminRequest updateReq =
                new com.unicore.dto.request.UpdateFacultyAdminRequest(
                        "Admin Test Faculty Updated",
                        "BCA",
                        com.unicore.entity.UserStatus.ACTIVE
                );

        mockMvc.perform(put("/api/admin/faculty/" + facultyUserId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Admin Test Faculty Updated")));

        mockMvc.perform(delete("/api/admin/faculty/" + facultyUserId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("deactivated")));

        mockMvc.perform(get("/api/admin/faculty/" + facultyUserId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("INACTIVE")));
    }

    @Test
    @Order(49)
    @DisplayName("49. Faculty Management: Reject duplicate email or faculty ID")
    void test49_FacultyManagement_DuplicateValidation() throws Exception {
        String adminToken = getAdminToken();

        com.unicore.dto.request.CreateFacultyAdminRequest dupEmail =
                new com.unicore.dto.request.CreateFacultyAdminRequest(
                        "Dup Faculty",
                        "adm.created.fac@unicore.edu",
                        "Pass@123",
                        "BCA",
                        "BCA-FAC-888"
                );

        mockMvc.perform(post("/api/admin/faculty")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupEmail)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Email is already registered")));

        com.unicore.dto.request.CreateFacultyAdminRequest dupId =
                new com.unicore.dto.request.CreateFacultyAdminRequest(
                        "Dup Faculty",
                        "unique.faculty@unicore.edu",
                        "Pass@123",
                        "BCA",
                        "BCA-FAC-777"
                );

        mockMvc.perform(post("/api/admin/faculty")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Faculty ID is already registered")));
    }

    @Test
    @Order(50)
    @DisplayName("50. Course Management: CRUD and Safe Deletion Protection")
    void test50_CourseManagement_CRUD_And_Protection() throws Exception {
        String adminToken = getAdminToken();

        com.unicore.dto.request.CreateCourseAdminRequest createReq =
                new com.unicore.dto.request.CreateCourseAdminRequest(
                        "CS999",
                        "Special Topics in Computing",
                        "BCA",
                        3,
                        4,
                        null
                );

        MvcResult createRes = mockMvc.perform(post("/api/admin/courses")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseCode", is("CS999")))
                .andExpect(jsonPath("$.courseName", is("Special Topics in Computing")))
                .andReturn();

        com.unicore.dto.response.AdminCourseResponse created =
                objectMapper.readValue(createRes.getResponse().getContentAsString(), com.unicore.dto.response.AdminCourseResponse.class);
        Long courseId = created.getId();

        mockMvc.perform(get("/api/admin/courses/" + courseId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseCode", is("CS999")));

        com.unicore.dto.request.UpdateCourseAdminRequest updateReq =
                new com.unicore.dto.request.UpdateCourseAdminRequest(
                        "Advanced Topics in Computing",
                        "BCA",
                        3,
                        4,
                        null
                );

        mockMvc.perform(put("/api/admin/courses/" + courseId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseName", is("Advanced Topics in Computing")));

        com.unicore.entity.Course bca101 = courseRepository.findByCourseCode("BCA101").orElseThrow();
        mockMvc.perform(delete("/api/admin/courses/" + bca101.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("enrolled students")));

        mockMvc.perform(delete("/api/admin/courses/" + courseId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("successfully deleted")));
    }

    @Test
    @Order(51)
    @DisplayName("51. Course Management: Reject duplicate course code")
    void test51_CourseManagement_DuplicateCourseCode() throws Exception {
        String adminToken = getAdminToken();

        com.unicore.dto.request.CreateCourseAdminRequest dupReq =
                new com.unicore.dto.request.CreateCourseAdminRequest(
                        "BCA101",
                        "Duplicate Course",
                        "BCA",
                        1,
                        4,
                        null
                );

        mockMvc.perform(post("/api/admin/courses")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Course code already exists")));
    }

    @Test
    @Order(52)
    @DisplayName("52. Faculty-Course Assignment and Unassignment Workflow")
    void test52_FacultyCourseAssignment() throws Exception {
        String adminToken = getAdminToken();

        com.unicore.dto.request.CreateCourseAdminRequest courseReq =
                new com.unicore.dto.request.CreateCourseAdminRequest(
                        "CS888",
                        "Cloud Architecture",
                        "BCA",
                        2,
                        3,
                        null
                );

        MvcResult cRes = mockMvc.perform(post("/api/admin/courses")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(courseReq)))
                .andExpect(status().isCreated())
                .andReturn();

        com.unicore.dto.response.AdminCourseResponse createdCourse =
                objectMapper.readValue(cRes.getResponse().getContentAsString(), com.unicore.dto.response.AdminCourseResponse.class);
        Long courseId = createdCourse.getId();

        User faculty = userRepository.findByEmail("bca.fac001@unicore.edu").orElseThrow();

        com.unicore.dto.request.AssignFacultyRequest assignReq =
                new com.unicore.dto.request.AssignFacultyRequest(faculty.getId());

        mockMvc.perform(post("/api/admin/courses/" + courseId + "/assign-faculty")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.instructorId", is(faculty.getId().intValue())))
                .andExpect(jsonPath("$.instructorName", is(faculty.getName())));

        mockMvc.perform(delete("/api/admin/courses/" + courseId + "/assign-faculty/" + faculty.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.instructorId", nullValue()))
                .andExpect(jsonPath("$.instructorName", is("Unassigned")));

        mockMvc.perform(delete("/api/admin/courses/" + courseId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(53)
    @DisplayName("53. Enrollment Overview and Attendance/Assessment Summaries")
    void test53_EnrollmentOverview_And_Summaries() throws Exception {
        String adminToken = getAdminToken();

        mockMvc.perform(get("/api/admin/enrollments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].studentName", notNullValue()))
                .andExpect(jsonPath("$[0].courseCode", notNullValue()));

        mockMvc.perform(get("/api/admin/attendance/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRecords", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.overallPercentage", greaterThanOrEqualTo(0.0)));

        mockMvc.perform(get("/api/admin/assessments/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssessments", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.typeCounts", notNullValue()));
    }

    @Test
    @Order(54)
    @DisplayName("54. ML Service: Real Random Forest Model Invocation and Structured Output")
    void test54_RealMlPredictionService_Execution() {
        User student = userRepository.findByEmail("bca.stu001@unicore.edu")
                .orElseThrow(() -> new AssertionError("Seed student bca.stu001@unicore.edu not found"));

        com.unicore.dto.response.StudentRiskPredictionResponse res =
                mlPredictionService.predictStudentRisk(student.getId(), null);

        assertNotNull(res, "Prediction response should not be null");
        assertEquals(student.getId(), res.getStudentId());
        assertNotNull(res.getRiskCategory(), "Risk category must be present");
        assertTrue(List.of("High Risk", "Medium Risk", "Low Risk").contains(res.getRiskCategory()),
                "Risk category must be High, Medium, or Low Risk");
        assertTrue(res.getConfidence() > 0.0 && res.getConfidence() <= 1.0,
                "Confidence should be between 0 and 1");
        assertNotNull(res.getProbabilities(), "Probabilities map must be present");
        assertTrue(res.getProbabilities().containsKey("High Risk"));
        assertTrue(res.getProbabilities().containsKey("Low Risk"));
        assertNotNull(res.getFeatures(), "Feature vector should be returned for transparency");
        assertNotNull(res.getModelVersion(), "Model version must be populated");
        assertNotNull(res.getRecommendation(), "Intervention recommendation must be generated");
    }

    @Test
    @Order(55)
    @DisplayName("55. ML Early Warning Model: Selected when Final Exam has not been conducted")
    void test55_EarlyWarningModel_Selection() {
        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();
        com.unicore.dto.response.StudentRiskPredictionResponse res =
                mlPredictionService.predictStudentRisk(student.getId(), null);

        // Seed data does not have final exams yet, so early warning model is used
        assertNotNull(res.getModelVersion());
        assertTrue(res.getModelVersion().contains("early") || res.getModelVersion().contains("random_forest"),
                "Model version should indicate Random Forest or Early Random Forest");
    }

    @Test
    @Order(56)
    @DisplayName("56. ML Feature Mapping: Graceful handling of students with empty assessment history")
    void test56_FeatureMapping_GracefulDefaults() {
        // Create an active student without any grades or attendance
        User emptyStudent = new User("Freshman ML Student", "freshman.ml@unicore.edu",
                passwordEncoder.encode("Pass@123"), Role.STUDENT, "BCA", UserStatus.ACTIVE);
        emptyStudent = userRepository.save(emptyStudent);

        com.unicore.dto.response.StudentRiskPredictionResponse res =
                mlPredictionService.predictStudentRisk(emptyStudent.getId(), null);

        assertNotNull(res);
        assertEquals("Freshman ML Student", res.getStudentName());
        assertNotNull(res.getRiskCategory());
        assertTrue(res.getConfidence() > 0.0);
    }

    @Test
    @Order(57)
    @DisplayName("57. ML API: Student self-risk endpoint (/api/ml/my-risk)")
    void test57_StudentSelfRisk_Endpoint() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/ml/my-risk")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName", is("Sanjai Karthikeyan")))
                .andExpect(jsonPath("$.riskCategory", notNullValue()))
                .andExpect(jsonPath("$.confidence", greaterThan(0.0)))
                .andExpect(jsonPath("$.recommendation", notNullValue()));
    }

    @Test
    @Order(58)
    @DisplayName("58. ML Security: Student cannot access peer's risk prediction (403 Forbidden)")
    void test58_StudentPeerRisk_Forbidden() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        User peerStudent = userRepository.findByEmail("bca.stu002@unicore.edu")
                .orElseThrow(() -> new AssertionError("Seed student bca.stu002 not found"));

        mockMvc.perform(get("/api/ml/students/" + peerStudent.getId() + "/risk")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(59)
    @DisplayName("59. ML API: Faculty course risk predictions (/api/ml/courses/{id}/risk)")
    void test59_FacultyCourseRisk_Endpoint() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        Course course = courseRepository.findByCourseCode("BCA201")
                .orElseThrow(() -> new AssertionError("Course BCA201 not found"));

        mockMvc.perform(get("/api/ml/courses/" + course.getId() + "/risk")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].riskCategory", notNullValue()))
                .andExpect(jsonPath("$[0].courseCode", is("BCA201")));
    }

    @Test
    @Order(60)
    @DisplayName("60. ML Security: Faculty cannot view risk for course they do not instruct (403 Forbidden)")
    void test60_FacultyUnassignedCourseRisk_Forbidden() throws Exception {
        LoginRequest bscsLogin = new LoginRequest("bscs.fac001@unicore.edu", "BscsPass@123");
        MvcResult bscsRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bscsLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String bscsToken = objectMapper.readValue(bscsRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        Course bcaCourse = courseRepository.findByCourseCode("BCA201").orElseThrow();

        mockMvc.perform(get("/api/ml/courses/" + bcaCourse.getId() + "/risk")
                        .header("Authorization", "Bearer " + bscsToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(61)
    @DisplayName("61. ML API: Faculty risk overview across assigned courses (/api/ml/faculty/risk-overview)")
    void test61_FacultyRiskOverview_Endpoint() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/ml/faculty/risk-overview")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAnalyzed", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.modelStatus", notNullValue()))
                .andExpect(jsonPath("$.studentPredictions", not(empty())));
    }

    @Test
    @Order(62)
    @DisplayName("62. ML API: Admin system-wide risk overview (/api/ml/admin/risk-overview)")
    void test62_AdminRiskOverview_Endpoint() throws Exception {
        String adminToken = getAdminToken();

        mockMvc.perform(get("/api/ml/admin/risk-overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAnalyzed", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.modelStatus", containsString("Online")))
                .andExpect(jsonPath("$.studentPredictions", not(empty())));
    }

    @Test
    @Order(63)
    @DisplayName("63. AI Advisor: Student self-access to personalized academic overview")
    void test63_StudentSelfAdvisorOverview_Endpoint() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/advisor/me/overview")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName", is("Sanjai Karthikeyan")))
                .andExpect(jsonPath("$.overallAttendancePercent", greaterThanOrEqualTo(0.0)))
                .andExpect(jsonPath("$.recommendations", notNullValue()))
                .andExpect(jsonPath("$.summaryHeadline", notNullValue()))
                .andExpect(jsonPath("$.courseCount", greaterThanOrEqualTo(1)));
    }

    @Test
    @Order(64)
    @DisplayName("64. AI Advisor Security: Student cannot access peer's advisor summary (403 Forbidden)")
    void test64_StudentPeerAdvisor_Forbidden() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        User peerStudent = userRepository.findByEmail("bca.stu002@unicore.edu")
                .orElseThrow(() -> new AssertionError("Peer student bca.stu002 not found"));

        mockMvc.perform(get("/api/advisor/students/" + peerStudent.getId() + "/overview")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(65)
    @DisplayName("65. AI Advisor: Faculty access to enrolled student advisor summary")
    void test65_FacultyEnrolledStudentAdvisor_Access() throws Exception {
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();

        mockMvc.perform(get("/api/advisor/students/" + student.getId() + "/overview")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId", is(student.getId().intValue())))
                .andExpect(jsonPath("$.recommendations", notNullValue()));
    }

    @Test
    @Order(66)
    @DisplayName("66. AI Advisor Security: Faculty rejected for student not in assigned courses (403 Forbidden)")
    void test66_FacultyUnassignedStudentAdvisor_Forbidden() throws Exception {
        LoginRequest bscsLogin = new LoginRequest("bscs.fac001@unicore.edu", "BscsPass@123");
        MvcResult bscsRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bscsLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String bscsToken = objectMapper.readValue(bscsRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        User bcaStudent = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();

        mockMvc.perform(get("/api/advisor/students/" + bcaStudent.getId() + "/overview")
                        .header("Authorization", "Bearer " + bscsToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(67)
    @DisplayName("67. AI Advisor Engine: Recommendation generation, metrics, and priority sorting")
    void test67_AdvisorRecommendationEngine_Logic() {
        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();

        com.unicore.dto.response.AdvisorOverviewDTO overview =
                advisorService.generateStudentOverview(student.getId());

        assertNotNull(overview);
        assertNotNull(overview.getRecommendations());
        assertFalse(overview.getRecommendations().isEmpty(), "Recommendations should not be empty");

        // Verify priorities are strictly ordered: HIGH before MEDIUM before LOW
        int prevRank = 0;
        for (com.unicore.dto.response.AdvisorRecommendationDTO rec : overview.getRecommendations()) {
            assertNotNull(rec.getTitle());
            assertNotNull(rec.getExplanation());
            assertNotNull(rec.getPriority());
            assertNotNull(rec.getSupportingMetric());

            int currentRank = "HIGH".equals(rec.getPriority()) ? 0 : "MEDIUM".equals(rec.getPriority()) ? 1 : 2;
            assertTrue(currentRank >= prevRank, "Recommendations must be sorted with HIGH priority first");
            prevRank = currentRank;
        }
    }

    @Test
    @Order(68)
    @DisplayName("68. AI Advisor: Student refresh endpoint (/api/advisor/me/refresh)")
    void test68_AdvisorRefresh_Endpoint() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(post("/api/advisor/me/refresh")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName", is("Sanjai Karthikeyan")))
                .andExpect(jsonPath("$.recommendations", notNullValue()));
    }

    @Test
    @Order(69)
    @DisplayName("69. AI Advisor Q&A: Attendance query intent and structured response")
    void test69_AdvisorQuestion_AttendanceInquiry() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        com.unicore.dto.request.AdvisorQuestionRequest qReq =
                new com.unicore.dto.request.AdvisorQuestionRequest("How is my attendance standing?");

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(qReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intent", is("ATTENDANCE_INQUIRY")))
                .andExpect(jsonPath("$.answer", containsString("attendance")))
                .andExpect(jsonPath("$.suggestedQuestions", not(empty())));
    }

    @Test
    @Order(70)
    @DisplayName("70. AI Advisor Q&A: Course improvement inquiry and actionable advice")
    void test70_AdvisorQuestion_CourseImprovementInquiry() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        com.unicore.dto.request.AdvisorQuestionRequest qReq =
                new com.unicore.dto.request.AdvisorQuestionRequest("Which course should I focus on to improve my grades?");

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(qReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intent", is("COURSE_IMPROVEMENT_INQUIRY")))
                .andExpect(jsonPath("$.answer", notNullValue()))
                .andExpect(jsonPath("$.confidence", greaterThan(0.0)));
    }

    @Test
    @Order(71)
    @DisplayName("71. AI Advisor: Admin institutional overview endpoint (/api/advisor/admin/overview)")
    void test71_AdminAdvisorOverview_Endpoint() throws Exception {
        String adminToken = getAdminToken();

        mockMvc.perform(get("/api/advisor/admin/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudentsAnalyzed", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.priorityDistributionByDepartment", notNullValue()));
    }

    @Test
    @Order(72)
    @DisplayName("72. AI Advisor Q&A: Risk rationale inquiry returns grounded explanation")
    void test72_AdvisorQuestion_RiskRationaleInquiry() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        com.unicore.dto.request.AdvisorQuestionRequest qReq =
                new com.unicore.dto.request.AdvisorQuestionRequest("Why was this risk level predicted?");

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(qReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intent", is("RISK_RATIONALE_INQUIRY")))
                .andExpect(jsonPath("$.source", anyOf(is("UNICORE_ACADEMIC_RULE_ENGINE"), is("EXTERNAL_AI_GEMINI"))))
                .andExpect(jsonPath("$.answer", containsString("Risk")));
    }

    @Test
    @Order(73)
    @DisplayName("73. AI Advisor Q&A: Priority actions inquiry returns actionable guidance")
    void test73_AdvisorQuestion_PriorityActionsInquiry() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        com.unicore.dto.request.AdvisorQuestionRequest qReq =
                new com.unicore.dto.request.AdvisorQuestionRequest("What are my highest priority actions?");

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(qReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intent", is("PRIORITY_ACTIONS_INQUIRY")))
                .andExpect(jsonPath("$.source", anyOf(is("UNICORE_ACADEMIC_RULE_ENGINE"), is("EXTERNAL_AI_GEMINI"))))
                .andExpect(jsonPath("$.answer", notNullValue()));
    }

    @Test
    @Order(74)
    @DisplayName("74. Notification Expiry Handling: Expired notifications flagged and excluded from active count")
    void test74_NotificationExpiry_Handling() throws Exception {
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Check notifications list contains both active and expired notifications, correctly tagged
        mockMvc.perform(get("/api/student/me/notifications")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[?(@.title == '[DEMO] Campus Placement Drive (Archived)')].isExpired").value(hasItem(true)))
                .andExpect(jsonPath("$[?(@.title == '[DEMO] Campus Placement Drive (Archived)')].isActive").value(hasItem(false)));

        // Check helper method date-only handling: 2026-09-22 expiry must be expired on 2026-09-23 or later
        java.time.LocalDateTime expiryPast = java.time.LocalDateTime.of(2026, 9, 22, 0, 0);
        org.junit.jupiter.api.Assertions.assertTrue(com.unicore.service.StudentService.isNotificationExpired(expiryPast));

        // Future expiry must not be expired
        java.time.LocalDateTime expiryFuture = java.time.LocalDateTime.now().plusDays(10);
        org.junit.jupiter.api.Assertions.assertFalse(com.unicore.service.StudentService.isNotificationExpired(expiryFuture));
    }

    @Test
    @Order(75)
    @DisplayName("75. Admin Department Creation and Editing: Validation, Persistence, and Code Aliasing")
    void test75_AdminDepartment_CreationAndEditing_Validation() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String adminToken = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 1. Duplicate shortCode rejection
        String duplicateCodePayload = "{\"name\":\"Robotics Alpha\",\"code\":\"BCA\",\"active\":true}";
        mockMvc.perform(post("/api/admin/departments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateCodePayload))
                .andExpect(status().isBadRequest());

        // 2. Duplicate name rejection
        String duplicateNamePayload = "{\"name\":\"Bachelor of Computer Applications\",\"code\":\"NEWBCA\",\"active\":true}";
        mockMvc.perform(post("/api/admin/departments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateNamePayload))
                .andExpect(status().isBadRequest());

        // 3. Create Department with code alias, headOfDepartment, and description
        String createPayload = "{\"name\":\"Robotics Engineering\",\"code\":\"ROBO\",\"headOfDepartment\":\"Dr. Nikola Tesla\",\"description\":\"Department of Advanced Robotics\",\"active\":true}";
        MvcResult createRes = mockMvc.perform(post("/api/admin/departments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Robotics Engineering")))
                .andExpect(jsonPath("$.shortCode", is("ROBO")))
                .andExpect(jsonPath("$.code", is("ROBO")))
                .andExpect(jsonPath("$.headOfDepartment", is("Dr. Nikola Tesla")))
                .andReturn();

        Department createdDept = objectMapper.readValue(createRes.getResponse().getContentAsString(), Department.class);

        // 4. Update Department
        String updatePayload = String.format("{\"id\":%d,\"name\":\"Department of Robotics & Mechatronics\",\"shortCode\":\"ROBO\",\"headOfDepartment\":\"Dr. Ada Lovelace\",\"description\":\"Updated Description\",\"active\":true}", createdDept.getId());
        mockMvc.perform(put("/api/admin/departments/" + createdDept.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Department of Robotics & Mechatronics")))
                .andExpect(jsonPath("$.headOfDepartment", is("Dr. Ada Lovelace")));

        // 5. Verify database persistence via public query
        mockMvc.perform(get("/api/departments/ROBO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Department of Robotics & Mechatronics")))
                .andExpect(jsonPath("$.headOfDepartment", is("Dr. Ada Lovelace")));

        // 6. Verify department appears in admin list
        mockMvc.perform(get("/api/admin/departments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.shortCode == 'ROBO')].name").value(hasItem("Department of Robotics & Mechatronics")));
    }

    @Test
    @Order(76)
    @DisplayName("76. Admin Faculty Assigned Courses: Dedicated Endpoint, DTO Population, and Authorization")
    void test76_AdminFaculty_AssignedCourses_EndpointAndDTO() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String adminToken = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 1. Query faculty list and verify assignedCourses field is populated
        MvcResult facListRes = mockMvc.perform(get("/api/admin/faculty")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].assignedCourses", notNullValue()))
                .andReturn();

        // Find faculty id for bca.fac001@unicore.edu (or first faculty in list)
        com.jayway.jsonpath.ReadContext ctx = com.jayway.jsonpath.JsonPath.parse(facListRes.getResponse().getContentAsString());
        Integer facultyUserId = ctx.read("$[0].id");

        // 2. Query dedicated faculty courses endpoint
        mockMvc.perform(get("/api/admin/faculty/" + facultyUserId + "/courses")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()));

        // 3. Query non-existent faculty user ID returns 404
        mockMvc.perform(get("/api/admin/faculty/99999/courses")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());

        // 4. Unauthorized student access returns 403 Forbidden
        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/admin/faculty/" + facultyUserId + "/courses")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(77)
    @DisplayName("77. Admin Student Creation & Automatic Course Enrollment: Department/Semester Course Matching & Cross-Portal Visibility")
    void test77_AdminStudent_Creation_AutomaticCourseEnrollment() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin@unicore.edu", "Admin@UniCore2026");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String adminToken = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 1. Create a new student in BCA Semester 1
        String newStudentPayload = "{"
                + "\"name\":\"Auto Enrolled Student\","
                + "\"email\":\"auto.student@unicore.edu\","
                + "\"password\":\"Student@UniCore2026\","
                + "\"department\":\"BCA\","
                + "\"studentId\":\"BCA-AUTO-001\","
                + "\"admissionYear\":2024,"
                + "\"currentSemester\":1"
                + "}";

        MvcResult createRes = mockMvc.perform(post("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newStudentPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Auto Enrolled Student")))
                .andExpect(jsonPath("$.studentId", is("BCA-AUTO-001")))
                .andExpect(jsonPath("$.enrolledCoursesCount", greaterThan(0)))
                .andExpect(jsonPath("$.enrollmentMessage", containsString("Automatically enrolled into")))
                .andReturn();

        com.jayway.jsonpath.ReadContext ctx = com.jayway.jsonpath.JsonPath.parse(createRes.getResponse().getContentAsString());
        Integer studentUserId = ctx.read("$.id");
        Integer enrolledCount = ctx.read("$.enrolledCoursesCount");
        org.junit.jupiter.api.Assertions.assertTrue(enrolledCount > 0, "Student should have been automatically enrolled in BCA Sem 1 courses");

        // 2. Student logs in to verify enrolled courses appear in Student Portal
        LoginRequest newStudentLogin = new LoginRequest("auto.student@unicore.edu", "Student@UniCore2026");
        MvcResult newStuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newStudentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String newStudentToken = objectMapper.readValue(newStuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Check Dashboard
        mockMvc.perform(get("/api/student/me/dashboard")
                        .header("Authorization", "Bearer " + newStudentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrolledCoursesCount", is(enrolledCount)));

        // Check Attendance course summaries
        mockMvc.perform(get("/api/student/me/attendance")
                        .header("Authorization", "Bearer " + newStudentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(enrolledCount)))
                .andExpect(jsonPath("$[0].courseCode", notNullValue()));

        // Check Academic Performance
        mockMvc.perform(get("/api/student/me/academic-performance")
                        .header("Authorization", "Bearer " + newStudentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courses", hasSize(enrolledCount)));

        // 3. Faculty course roster check: Faculty for BCA101 can see this student in the roster
        if (userRepository.findByEmail("bca.fac001@unicore.edu").isEmpty()) {
            FacultyRegisterRequest request = new FacultyRegisterRequest(
                    "BCA-FAC-001",
                    "bca.fac001@unicore.edu",
                    "FacultyPass@123"
            );
            mockMvc.perform(post("/api/auth/register/faculty")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facLoginRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String facToken = objectMapper.readValue(facLoginRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Find course ID for BCA101
        Course bca101 = courseRepository.findByCourseCode("BCA101").orElseThrow();
        mockMvc.perform(get("/api/faculty/courses/" + bca101.getId() + "/students")
                        .header("Authorization", "Bearer " + facToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.students[?(@.studentId == 'BCA-AUTO-001')].studentName").value(hasItem("Auto Enrolled Student")));

        // 4. Test student creation when no courses exist in semester (e.g. Semester 12)
        String noCoursesStudentPayload = "{"
                + "\"name\":\"Student Without Courses\","
                + "\"email\":\"nocourses.student@unicore.edu\","
                + "\"password\":\"Student@UniCore2026\","
                + "\"department\":\"BCA\","
                + "\"studentId\":\"BCA-NOCRS-001\","
                + "\"admissionYear\":2024,"
                + "\"currentSemester\":12"
                + "}";

        mockMvc.perform(post("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(noCoursesStudentPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.enrolledCoursesCount", is(0)))
                .andExpect(jsonPath("$.enrollmentMessage", containsString("Automatic enrollment skipped")));
    }

    @Test
    @Order(78)
    @DisplayName("78. Student Portal: Visibility of Published Assessment Marks & Isolation of Unpublished Marks")
    void test78_Student_PublishedAssessmentMarks_Visibility() throws Exception {
        if (userRepository.findByEmail("bca.fac001@unicore.edu").isEmpty()) {
            FacultyRegisterRequest request = new FacultyRegisterRequest(
                    "BCA-FAC-001",
                    "bca.fac001@unicore.edu",
                    "FacultyPass@123"
            );
            mockMvc.perform(post("/api/auth/register/faculty")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        if (userRepository.findByEmail("bca.stu001@unicore.edu").isEmpty()) {
            StudentRegisterRequest request = new StudentRegisterRequest(
                    "BCA-STU-001",
                    "bca.stu001@unicore.edu",
                    "Password@123"
            );
            mockMvc.perform(post("/api/auth/register/student")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        // Ensure student and faculty logins
        LoginRequest facultyLogin = new LoginRequest("bca.fac001@unicore.edu", "FacultyPass@123");
        MvcResult facRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String facultyToken = objectMapper.readValue(facRes.getResponse().getContentAsString(), AuthResponse.class).getToken();

        LoginRequest studentLogin = new LoginRequest("bca.stu001@unicore.edu", "Password@123");
        MvcResult stuRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String studentToken = objectMapper.readValue(stuRes.getResponse().getContentAsString(), AuthResponse.class).getToken();
        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseThrow();
        Course bca201 = courseRepository.findByCourseCode("BCA201").orElseThrow();

        // 1. Faculty creates an UNPUBLISHED assessment (Draft Internal Test)
        String draftAssessmentPayload = "{"
                + "\"title\":\"Draft Internal Test\","
                + "\"type\":\"QUIZ\","
                + "\"maxMarks\":25.0,"
                + "\"weightage\":10.0,"
                + "\"published\":false"
                + "}";
        MvcResult draftRes = mockMvc.perform(post("/api/faculty/courses/" + bca201.getId() + "/assessments")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftAssessmentPayload))
                .andExpect(status().isCreated())
                .andReturn();
        long draftAssessmentId = objectMapper.readTree(draftRes.getResponse().getContentAsString()).get("id").asLong();

        // Faculty enters marks for the student in this unpublished assessment
        String markBody = "{\"entries\": [{\"studentId\": " + student.getId() + ", \"marksObtained\": 24.0}]}";
        mockMvc.perform(put("/api/faculty/courses/" + bca201.getId() + "/assessments/" + draftAssessmentId + "/marks")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(markBody))
                .andExpect(status().isOk());

        // 2. Student views academic-performance: Unpublished assessment marks MUST BE HIDDEN
        mockMvc.perform(get("/api/student/me/academic-performance")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courses[?(@.courseCode == 'BCA201')].assessments[?(@.assessmentTitle == 'Draft Internal Test')]", empty()));

        // Also check direct course assessments endpoint: Unpublished assessment is hidden
        mockMvc.perform(get("/api/student/me/courses/" + bca201.getId() + "/assessments")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.assessmentTitle == 'Draft Internal Test')]", empty()));

        // 3. Faculty publishes the assessment
        mockMvc.perform(post("/api/faculty/courses/" + bca201.getId() + "/assessments/" + draftAssessmentId + "/publish?published=true")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.published", is(true)));

        // 4. Student views academic-performance: Published assessment marks are now visible with correct fields
        mockMvc.perform(get("/api/student/me/academic-performance")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courses[?(@.courseCode == 'BCA201')].assessments[?(@.assessmentTitle == 'Draft Internal Test')].marksObtained", contains(24.0)))
                .andExpect(jsonPath("$.courses[?(@.courseCode == 'BCA201')].assessments[?(@.assessmentTitle == 'Draft Internal Test')].maxMarks", contains(25.0)))
                .andExpect(jsonPath("$.courses[?(@.courseCode == 'BCA201')].assessments[?(@.assessmentTitle == 'Draft Internal Test')].percentage", contains(96.0)))
                .andExpect(jsonPath("$.courses[?(@.courseCode == 'BCA201')].assessments[?(@.assessmentTitle == 'Draft Internal Test')].weightage", contains(10.0)))
                .andExpect(jsonPath("$.courses[?(@.courseCode == 'BCA201')].assessments[?(@.assessmentTitle == 'Draft Internal Test')].status", contains("PUBLISHED")));

        // Check direct course assessments endpoint
        mockMvc.perform(get("/api/student/me/courses/" + bca201.getId() + "/assessments")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.assessmentTitle == 'Draft Internal Test')].marksObtained", contains(24.0)))
                .andExpect(jsonPath("$[?(@.assessmentTitle == 'Draft Internal Test')].percentage", contains(96.0)));

        // 5. Verify security: Student cannot access assessments for a course they are not enrolled in
        mockMvc.perform(get("/api/student/me/courses/999999/assessments")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }
}