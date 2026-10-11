package com.unicore;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicore.dto.request.AdvisorQuestionRequest;
import com.unicore.entity.*;
import com.unicore.repository.DepartmentRepository;
import com.unicore.repository.StudentProfileRepository;
import com.unicore.repository.UserRepository;
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
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.annotation.DirtiesContext;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class AdvisorIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String studentToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        if (!departmentRepository.existsByShortCode("BCA")) {
            departmentRepository.save(new Department("Bachelor of Computer Applications", "BCA", true));
        }

        User student = userRepository.findByEmail("bca.stu001@unicore.edu").orElseGet(() -> {
            User u = new User("Sanjai Karthikeyan", "bca.stu001@unicore.edu", "$2a$10$abcdefghijk", Role.STUDENT, "BCA", UserStatus.ACTIVE);
            u = userRepository.save(u);
            StudentProfile sp = new StudentProfile(u, "BCA-STU-001", 2024, 2);
            studentProfileRepository.save(sp);
            return u;
        });

        User admin = userRepository.findByEmail("admin@unicore.edu").orElseGet(() -> {
            User a = new User("System Administrator", "admin@unicore.edu", "$2a$10$abcdefghijk", Role.ADMIN, "BCA", UserStatus.ACTIVE);
            return userRepository.save(a);
        });

        UserPrincipal studentPrincipal = UserPrincipal.create(student);
        Authentication studentAuth = new UsernamePasswordAuthenticationToken(studentPrincipal, null, studentPrincipal.getAuthorities());
        studentToken = "Bearer " + jwtTokenProvider.generateToken(studentAuth);

        UserPrincipal adminPrincipal = UserPrincipal.create(admin);
        Authentication adminAuth = new UsernamePasswordAuthenticationToken(adminPrincipal, null, adminPrincipal.getAuthorities());
        adminToken = "Bearer " + jwtTokenProvider.generateToken(adminAuth);
    }

    @Test
    @DisplayName("1. Student Advisor Overview returns 200 with non-null metrics and recommendations")
    void testGetMyAdvisorOverview() throws Exception {
        mockMvc.perform(get("/api/advisor/me/overview")
                        .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").isNotEmpty())
                .andExpect(jsonPath("$.studentName").value("Sanjai Karthikeyan"))
                .andExpect(jsonPath("$.overallAttendancePercent").isNumber())
                .andExpect(jsonPath("$.riskCategory").isString())
                .andExpect(jsonPath("$.recommendations").isArray())
                .andExpect(jsonPath("$.summaryHeadline").isNotEmpty());
    }

    @Test
    @DisplayName("2. Student Refresh recalculates overview and returns 200")
    void testRefreshMyRecommendations() throws Exception {
        mockMvc.perform(post("/api/advisor/me/refresh")
                        .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").isNotEmpty())
                .andExpect(jsonPath("$.overallAttendancePercent").isNumber());
    }

    @Test
    @DisplayName("3. Q1: Attendance Standing Inquiry returns 200 with grounded telemetry")
    void testAskQuestion_AttendanceStanding() throws Exception {
        AdvisorQuestionRequest request = new AdvisorQuestionRequest();
        request.setQuestion("How is my attendance standing?");

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("How is my attendance standing?"))
                .andExpect(jsonPath("$.intent").value("ATTENDANCE_INQUIRY"))
                .andExpect(jsonPath("$.source", anyOf(is("UNICORE_ACADEMIC_RULE_ENGINE"), is("EXTERNAL_AI_GEMINI"))))
                .andExpect(jsonPath("$.answer", containsString("attendance")))
                .andExpect(jsonPath("$.suggestedQuestions").isArray());
    }

    @Test
    @DisplayName("4. Q2: Course Focus Inquiry returns 200 with actionable guidance")
    void testAskQuestion_CourseImprovement() throws Exception {
        AdvisorQuestionRequest request = new AdvisorQuestionRequest();
        request.setQuestion("Which course should I focus on to improve?");

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("Which course should I focus on to improve?"))
                .andExpect(jsonPath("$.intent").value("COURSE_IMPROVEMENT_INQUIRY"))
                .andExpect(jsonPath("$.source", anyOf(is("UNICORE_ACADEMIC_RULE_ENGINE"), is("EXTERNAL_AI_GEMINI"))))
                .andExpect(jsonPath("$.answer").isNotEmpty());
    }

    @Test
    @DisplayName("5. Q3: Risk Rationale Inquiry returns 200 with ML risk explanation")
    void testAskQuestion_RiskRationale() throws Exception {
        AdvisorQuestionRequest request = new AdvisorQuestionRequest();
        request.setQuestion("Why was this risk level predicted?");

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("Why was this risk level predicted?"))
                .andExpect(jsonPath("$.intent").value("RISK_RATIONALE_INQUIRY"))
                .andExpect(jsonPath("$.source", anyOf(is("UNICORE_ACADEMIC_RULE_ENGINE"), is("EXTERNAL_AI_GEMINI"))))
                .andExpect(jsonPath("$.answer", containsString("Risk")));
    }

    @Test
    @DisplayName("6. Q4: Priority Actions Inquiry returns 200 with actionable next steps")
    void testAskQuestion_PriorityActions() throws Exception {
        AdvisorQuestionRequest request = new AdvisorQuestionRequest();
        request.setQuestion("What are my highest priority actions?");

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("What are my highest priority actions?"))
                .andExpect(jsonPath("$.intent").value("PRIORITY_ACTIONS_INQUIRY"))
                .andExpect(jsonPath("$.source", anyOf(is("UNICORE_ACADEMIC_RULE_ENGINE"), is("EXTERNAL_AI_GEMINI"))))
                .andExpect(jsonPath("$.answer").isNotEmpty());
    }

    @Test
    @DisplayName("7. Admin Advisor Overview returns 200 and aggregate stats")
    void testAdminAdvisorOverview() throws Exception {
        mockMvc.perform(get("/api/advisor/admin/overview")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudentsAnalyzed").isNumber())
                .andExpect(jsonPath("$.priorityDistributionByDepartment").isMap());
    }

    @Test
    @DisplayName("8. Follow-up query with conversation history returns 200 with grounded response")
    void testAskQuestion_WithConversationHistory() throws Exception {
        com.unicore.dto.request.ChatMessageDTO msg1 = new com.unicore.dto.request.ChatMessageDTO("user", "How is my attendance?");
        com.unicore.dto.request.ChatMessageDTO msg2 = new com.unicore.dto.request.ChatMessageDTO("model", "Your overall attendance is currently in good standing.");

        AdvisorQuestionRequest request = new AdvisorQuestionRequest();
        request.setQuestion("What should I do to improve my academic performance?");
        request.setConversationHistory(java.util.List.of(msg1, msg2));

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("What should I do to improve my academic performance?"))
                .andExpect(jsonPath("$.source", anyOf(is("UNICORE_ACADEMIC_RULE_ENGINE"), is("EXTERNAL_AI_GEMINI"))))
                .andExpect(jsonPath("$.answer").isNotEmpty());
    }

    @Test
    @DisplayName("9. Course-specific attendance query returns accurate course metrics")
    void testAskQuestion_CourseSpecificQuery() throws Exception {
        AdvisorQuestionRequest request = new AdvisorQuestionRequest();
        request.setQuestion("What is my attendance in BCA201?");

        mockMvc.perform(post("/api/advisor/me/ask")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("What is my attendance in BCA201?"))
                .andExpect(jsonPath("$.source", anyOf(is("UNICORE_ACADEMIC_RULE_ENGINE"), is("EXTERNAL_AI_GEMINI"))))
                .andExpect(jsonPath("$.answer").isNotEmpty());
    }
}
