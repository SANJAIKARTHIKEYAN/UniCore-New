package com.unicore;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicore.dto.request.MarkEntryRequest;
import com.unicore.entity.*;
import com.unicore.repository.*;
import com.unicore.security.JwtTokenProvider;
import com.unicore.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class GradingWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentMarkRepository assessmentMarkRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String facultyToken;
    private String studentToken;
    private Course testCourse;
    private User facultyUser;
    private User studentUser;
    private Assessment testAssessment;

    @BeforeEach
    void setUp() {
        if (!departmentRepository.existsByShortCode("BCA")) {
            departmentRepository.save(new Department("Bachelor of Computer Applications", "BCA", true));
        }

        facultyUser = userRepository.findByEmail("faculty.grading@unicore.edu").orElseGet(() -> {
            User f = new User("Dr. Grading Faculty", "faculty.grading@unicore.edu", "$2a$10$abcdefghijk", Role.FACULTY, "BCA", UserStatus.ACTIVE);
            f = userRepository.save(f);
            FacultyProfile fp = new FacultyProfile(f, "BCA-FAC-GRD", "BCA");
            facultyProfileRepository.save(fp);
            return f;
        });

        studentUser = userRepository.findByEmail("student.grading@unicore.edu").orElseGet(() -> {
            User s = new User("Grading Student", "student.grading@unicore.edu", "$2a$10$abcdefghijk", Role.STUDENT, "BCA", UserStatus.ACTIVE);
            s = userRepository.save(s);
            StudentProfile sp = new StudentProfile(s, "BCA-STU-GRD", 2024, 2);
            studentProfileRepository.save(sp);
            return s;
        });

        UserPrincipal facultyPrincipal = UserPrincipal.create(facultyUser);
        Authentication facultyAuth = new UsernamePasswordAuthenticationToken(facultyPrincipal, null, facultyPrincipal.getAuthorities());
        facultyToken = "Bearer " + jwtTokenProvider.generateToken(facultyAuth);

        UserPrincipal studentPrincipal = UserPrincipal.create(studentUser);
        Authentication studentAuth = new UsernamePasswordAuthenticationToken(studentPrincipal, null, studentPrincipal.getAuthorities());
        studentToken = "Bearer " + jwtTokenProvider.generateToken(studentAuth);

        testCourse = courseRepository.findByCourseCode("BCA201").orElseGet(() -> {
            Course c = new Course("BCA201", "Object Oriented Programming in Java", "BCA", 2, 4);
            c.setInstructor(facultyUser);
            return courseRepository.save(c);
        });
        testCourse.setInstructor(facultyUser);
        courseRepository.save(testCourse);

        // Ensure student is enrolled in testCourse
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(testCourse.getId());
        boolean enrolled = enrollments.stream().anyMatch(e -> e.getStudent().getId().equals(studentUser.getId()));
        if (!enrolled) {
            Enrollment e = new Enrollment(studentUser, testCourse, 2, 2024);
            enrollmentRepository.save(e);
        }

        // Create or find assessment for testCourse
        List<Assessment> existing = assessmentRepository.findByCourseId(testCourse.getId());
        if (existing.isEmpty()) {
            Assessment a = new Assessment(testCourse, "Midterm Exam 1", AssessmentType.MIDTERM, 100.0, 20.0);
            testAssessment = assessmentRepository.save(a);
        } else {
            testAssessment = existing.get(0);
        }
    }

    @Test
    @DisplayName("1. Enter marks successfully, persist to DB, and verify persistence after query")
    void testEnterMarksAndVerifyPersistence() throws Exception {
        MarkEntryRequest request = new MarkEntryRequest();
        List<MarkEntryRequest.MarkEntry> entries = new ArrayList<>();
        MarkEntryRequest.MarkEntry entry = new MarkEntryRequest.MarkEntry(studentUser.getId(), 85.0);
        entries.add(entry);
        request.setEntries(entries);

        // Submit marks
        mockMvc.perform(put("/api/faculty/courses/" + testCourse.getId() + "/assessments/" + testAssessment.getId() + "/marks")
                        .header("Authorization", facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("Marks saved successfully")));

        // Query assessment marks sheet (simulating refresh / reopening)
        mockMvc.perform(get("/api/faculty/courses/" + testCourse.getId() + "/assessments/" + testAssessment.getId() + "/marks")
                        .header("Authorization", facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[?(@.studentUserId == " + studentUser.getId() + ")].marksObtained", hasItem(85.0)));

        // Directly verify from repository
        var markOpt = assessmentMarkRepository.findByAssessmentIdAndStudentId(testAssessment.getId(), studentUser.getId());
        assertTrue(markOpt.isPresent());
        assertEquals(85.0, markOpt.get().getMarksObtained());
    }

    @Test
    @DisplayName("2. Marks validation rejects negative marks or marks exceeding maxMarks")
    void testMarksValidation() throws Exception {
        // Exceeding maxMarks
        MarkEntryRequest invalidReq1 = new MarkEntryRequest();
        invalidReq1.setEntries(List.of(new MarkEntryRequest.MarkEntry(studentUser.getId(), testAssessment.getMaxMarks() + 10.0)));

        mockMvc.perform(put("/api/faculty/courses/" + testCourse.getId() + "/assessments/" + testAssessment.getId() + "/marks")
                        .header("Authorization", facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq1)))
                .andExpect(status().isBadRequest());

        // Negative marks
        MarkEntryRequest invalidReq2 = new MarkEntryRequest();
        invalidReq2.setEntries(List.of(new MarkEntryRequest.MarkEntry(studentUser.getId(), -5.0)));

        mockMvc.perform(put("/api/faculty/courses/" + testCourse.getId() + "/assessments/" + testAssessment.getId() + "/marks")
                        .header("Authorization", facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq2)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("3. Grade calculation & publish computes grades, populates counts, and persists to enrollment")
    void testCalculateAndPublishGrades() throws Exception {
        // First enter valid marks
        MarkEntryRequest request = new MarkEntryRequest();
        request.setEntries(List.of(new MarkEntryRequest.MarkEntry(studentUser.getId(), 92.0)));

        mockMvc.perform(put("/api/faculty/courses/" + testCourse.getId() + "/assessments/" + testAssessment.getId() + "/marks")
                        .header("Authorization", facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Calculate and publish grades
        mockMvc.perform(post("/api/faculty/courses/" + testCourse.getId() + "/grades/calculate")
                        .header("Authorization", facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudents", notNullValue()))
                .andExpect(jsonPath("$.gradedStudents", notNullValue()))
                .andExpect(jsonPath("$.totalStudents", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.gradedStudents", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.students", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.students[0].finalGrade", notNullValue()))
                .andExpect(jsonPath("$.students[0].gradePoints", notNullValue()));

        // Verify summary endpoint also returns the published data
        mockMvc.perform(get("/api/faculty/courses/" + testCourse.getId() + "/grades/summary")
                        .header("Authorization", facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudents", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.gradedStudents", greaterThanOrEqualTo(1)));

        // Verify Student Academic Performance receives published grade
        mockMvc.perform(get("/api/student/me/academic-performance")
                        .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courses[?(@.courseCode == '" + testCourse.getCourseCode() + "')].grade", not(empty())))
                .andExpect(jsonPath("$.courses[?(@.courseCode == '" + testCourse.getCourseCode() + "')].gradePoints", not(empty())));

        // Verify Student Semester Results receives published grade
        mockMvc.perform(get("/api/student/me/results")
                        .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("4. Security: Non-assigned faculty cannot submit marks or publish grades")
    void testSecurityNonAssignedFacultyForbidden() throws Exception {
        // Create an unassigned faculty
        User otherFaculty = new User();
        otherFaculty.setName("Other Faculty");
        otherFaculty.setEmail("otherfaculty@unicore.edu");
        otherFaculty.setPasswordHash("hashed");
        otherFaculty.setRole(Role.FACULTY);
        otherFaculty.setDepartment("BCOM");
        otherFaculty.setStatus(UserStatus.ACTIVE);
        userRepository.save(otherFaculty);

        UserPrincipal otherPrincipal = UserPrincipal.create(otherFaculty);
        Authentication otherAuth = new UsernamePasswordAuthenticationToken(otherPrincipal, null, otherPrincipal.getAuthorities());
        String otherToken = "Bearer " + jwtTokenProvider.generateToken(otherAuth);

        MarkEntryRequest request = new MarkEntryRequest();
        request.setEntries(List.of(new MarkEntryRequest.MarkEntry(studentUser.getId(), 50.0)));

        mockMvc.perform(put("/api/faculty/courses/" + testCourse.getId() + "/assessments/" + testAssessment.getId() + "/marks")
                        .header("Authorization", otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/faculty/courses/" + testCourse.getId() + "/grades/calculate")
                        .header("Authorization", otherToken))
                .andExpect(status().isForbidden());
    }
}
