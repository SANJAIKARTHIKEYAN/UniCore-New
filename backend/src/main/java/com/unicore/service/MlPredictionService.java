package com.unicore.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicore.dto.response.RiskOverviewResponse;
import com.unicore.dto.response.StudentRiskPredictionResponse;
import com.unicore.entity.*;
import com.unicore.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class MlPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(MlPredictionService.class);

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentMarkRepository assessmentMarkRepository;
    private final StudentRiskPredictionRepository studentRiskPredictionRepository;
    private final ObjectMapper objectMapper;

    @Value("${unicore.ml.python-path:python}")
    private String pythonPath;

    @Value("${unicore.ml.model-dir:../ML/models}")
    private String modelDir;

    @Value("${unicore.ml.timeout-seconds:8}")
    private int timeoutSeconds;

    public MlPredictionService(UserRepository userRepository,
                               StudentProfileRepository studentProfileRepository,
                               CourseRepository courseRepository,
                               EnrollmentRepository enrollmentRepository,
                               AttendanceRecordRepository attendanceRecordRepository,
                               AssessmentRepository assessmentRepository,
                               AssessmentMarkRepository assessmentMarkRepository,
                               StudentRiskPredictionRepository studentRiskPredictionRepository,
                               ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.assessmentRepository = assessmentRepository;
        this.assessmentMarkRepository = assessmentMarkRepository;
        this.studentRiskPredictionRepository = studentRiskPredictionRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Resolves the real ML model directory path across different working directories.
     */
    public String resolveModelDir() {
        Path p1 = Paths.get(modelDir);
        if (Files.exists(p1)) {
            return p1.toAbsolutePath().normalize().toString();
        }
        Path p2 = Paths.get("../ML/models");
        if (Files.exists(p2)) {
            return p2.toAbsolutePath().normalize().toString();
        }
        Path p3 = Paths.get("ML/models");
        if (Files.exists(p3)) {
            return p3.toAbsolutePath().normalize().toString();
        }
        return p1.toAbsolutePath().normalize().toString();
    }

    /**
     * Locates the predict_risk.py runner script.
     */
    public File resolveScriptFile() {
        String[] candidates = {
                "src/main/resources/scripts/predict_risk.py",
                "backend/src/main/resources/scripts/predict_risk.py",
                "resources/scripts/predict_risk.py"
        };
        for (String c : candidates) {
            File f = new File(c);
            if (f.exists()) {
                return f.getAbsoluteFile();
            }
        }
        // Fallback: extract from classpath or return default
        return new File("src/main/resources/scripts/predict_risk.py").getAbsoluteFile();
    }

    /**
     * Predict risk for a single student (optionally scoped to a course).
     */
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public StudentRiskPredictionResponse predictStudentRisk(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("User with id " + studentId + " is not a student.");
        }

        Course course = null;
        if (courseId != null) {
            course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));
        }

        StudentProfile profile = studentProfileRepository.findByUserId(studentId).orElse(null);
        String studentRoll = profile != null ? profile.getStudentId() : "STD-" + student.getId();

        // 1. Authoritative UniCore attendance source (matching Student Portal)
        Double authoritativeAttendance = calculateAuthoritativeAttendance(student.getId());
        double attendancePct = authoritativeAttendance != null
                ? authoritativeAttendance
                : calculateAttendancePercentage(studentId, courseId);
        double displayAttendance = Math.round(attendancePct * 10.0) / 10.0;

        // 2. Calculate Assessment Scores
        Double midtermAvg = calculateAssessmentAverage(studentId, courseId, AssessmentType.MIDTERM);
        Double finalAvg = calculateAssessmentAverage(studentId, courseId, AssessmentType.FINAL);
        Double assignmentsAvg = calculateAssessmentAverage(studentId, courseId, AssessmentType.ASSIGNMENT);
        Double quizzesAvg = calculateAssessmentAverage(studentId, courseId, AssessmentType.QUIZ);
        Double projectsAvg = calculateAssessmentAverage(studentId, courseId, AssessmentType.PROJECT);
        if (projectsAvg == null) {
            projectsAvg = calculateAssessmentAverage(studentId, courseId, AssessmentType.LAB);
        }

        // 3. Early Warning Model Selection
        // If final exam hasn't been conducted yet, use the early prediction model!
        boolean useEarlyModel = (finalAvg == null);

        // Default neutral baseline values for missing components
        double effectiveMidterm = midtermAvg != null ? midtermAvg : 70.0;
        double effectiveFinal = finalAvg != null ? finalAvg : 70.0;
        double effectiveAssignments = assignmentsAvg != null ? assignmentsAvg : 75.0;
        double effectiveQuizzes = quizzesAvg != null ? quizzesAvg : 75.0;
        double effectiveProjects = projectsAvg != null ? projectsAvg : 75.0;
        double participationScore = Math.min(10.0, Math.max(0.0, attendancePct / 10.0));

        // 4. Invoke Python Process safely with stdin JSON
        Map<String, Object> inputPayload = new HashMap<>();
        inputPayload.put("modelDir", resolveModelDir());
        inputPayload.put("attendance", attendancePct);
        inputPayload.put("midterm", effectiveMidterm);
        inputPayload.put("final", effectiveFinal);
        inputPayload.put("assignments", effectiveAssignments);
        inputPayload.put("quizzes", effectiveQuizzes);
        inputPayload.put("participation", participationScore);
        inputPayload.put("projects", effectiveProjects);
        inputPayload.put("useEarlyModel", useEarlyModel);

        Map<String, Object> predictionResult = executeInferenceProcess(inputPayload);

        String riskLevel = (String) predictionResult.getOrDefault("riskLevel", "Medium Risk");
        Double confidence = ((Number) predictionResult.getOrDefault("confidence", 0.75)).doubleValue();
        String modelVersion = (String) predictionResult.getOrDefault("modelVersion", useEarlyModel ? "early_random_forest_model.pkl" : "random_forest_model.pkl");

        @SuppressWarnings("unchecked")
        Map<String, Double> probabilities = (Map<String, Double>) predictionResult.get("probabilities");

        // 5. Build DTO Response
        StudentRiskPredictionResponse response = new StudentRiskPredictionResponse();
        response.setStudentId(student.getId());
        response.setStudentName(student.getName());
        response.setStudentRoll(studentRoll);
        response.setDepartment(student.getDepartment());
        if (course != null) {
            response.setCourseId(course.getId());
            response.setCourseCode(course.getCourseCode());
            response.setCourseName(course.getCourseName());
        }
        response.setRiskCategory(riskLevel);
        response.setConfidence(confidence);
        response.setProbabilities(probabilities);
        response.setAttendance(displayAttendance);

        Map<String, Double> featuresMap = new LinkedHashMap<>();
        featuresMap.put("Attendance (%)", displayAttendance);
        featuresMap.put("Midterm_Score", Math.round(effectiveMidterm * 10.0) / 10.0);
        if (!useEarlyModel) {
            featuresMap.put("Final_Score", Math.round(effectiveFinal * 10.0) / 10.0);
        }
        featuresMap.put("Assignments_Avg", Math.round(effectiveAssignments * 10.0) / 10.0);
        featuresMap.put("Quizzes_Avg", Math.round(effectiveQuizzes * 10.0) / 10.0);
        featuresMap.put("Participation_Score", Math.round(participationScore * 10.0) / 10.0);
        featuresMap.put("Projects_Score", Math.round(effectiveProjects * 10.0) / 10.0);
        response.setFeatures(featuresMap);

        response.setModelVersion(modelVersion);
        response.setPredictedAt(LocalDateTime.now());
        response.setRecommendation(generateRecommendation(riskLevel, attendancePct, effectiveMidterm));

        // 6. Cache prediction entity in database
        try {
            String probasJson = objectMapper.writeValueAsString(probabilities);
            StudentRiskPrediction record = new StudentRiskPrediction(
                    student, course, riskLevel, confidence, probasJson, modelVersion
            );
            studentRiskPredictionRepository.save(record);
        } catch (Throwable ex) {
            logger.warn("Could not cache prediction record: {}", ex.getMessage());
        }

        return response;
    }

    /**
     * Get predictions for all students enrolled in a course.
     */
    @Transactional
    public List<StudentRiskPredictionResponse> getCourseRiskPredictions(Long courseId, Long facultyId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

        if (facultyId != null && course.getInstructor() != null) {
            if (!course.getInstructor().getId().equals(facultyId)) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Faculty is not assigned to course " + course.getCourseCode()
                );
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<StudentRiskPredictionResponse> list = new ArrayList<>();
        for (Enrollment e : enrollments) {
            try {
                list.add(predictStudentRisk(e.getStudent().getId(), courseId));
            } catch (Exception ex) {
                logger.error("Error predicting for student {}: {}", e.getStudent().getId(), ex.getMessage());
            }
        }
        return list;
    }

    /**
     * Aggregate risk overview for a faculty member across all their courses.
     */
    @Transactional
    public RiskOverviewResponse getFacultyRiskOverview(Long facultyId) {
        List<Course> facultyCourses = courseRepository.findByInstructorId(facultyId);
        List<StudentRiskPredictionResponse> allPredictions = new ArrayList<>();

        Set<Long> analyzedStudents = new HashSet<>();
        for (Course c : facultyCourses) {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(c.getId());
            for (Enrollment e : enrollments) {
                if (analyzedStudents.add(e.getStudent().getId())) {
                    try {
                        allPredictions.add(predictStudentRisk(e.getStudent().getId(), c.getId()));
                    } catch (Exception ex) {
                        logger.warn("Could not predict risk for student {}: {}", e.getStudent().getId(), ex.getMessage());
                    }
                }
            }
        }

        return buildRiskOverview(allPredictions);
    }

    /**
     * System-wide risk overview for Administrators.
     */
    @Transactional
    public RiskOverviewResponse getAdminRiskOverview() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<StudentRiskPredictionResponse> predictions = new ArrayList<>();

        for (User s : students) {
            try {
                predictions.add(predictStudentRisk(s.getId(), null));
            } catch (Exception ex) {
                logger.warn("Prediction failed for student {}: {}", s.getId(), ex.getMessage());
            }
        }

        RiskOverviewResponse overview = buildRiskOverview(predictions);

        // Department breakdown of high-risk students
        Map<String, Long> deptBreakdown = new TreeMap<>();
        for (StudentRiskPredictionResponse p : predictions) {
            if ("High Risk".equalsIgnoreCase(p.getRiskCategory()) && p.getDepartment() != null) {
                deptBreakdown.put(p.getDepartment(), deptBreakdown.getOrDefault(p.getDepartment(), 0L) + 1);
            }
        }
        overview.setDepartmentBreakdown(deptBreakdown);
        overview.setModelStatus("Random Forest Inference Engine Online (" + resolveModelDir() + ")");
        return overview;
    }

    private RiskOverviewResponse buildRiskOverview(List<StudentRiskPredictionResponse> predictions) {
        RiskOverviewResponse response = new RiskOverviewResponse();
        long total = predictions.size();
        long high = predictions.stream().filter(p -> "High Risk".equalsIgnoreCase(p.getRiskCategory())).count();
        long medium = predictions.stream().filter(p -> "Medium Risk".equalsIgnoreCase(p.getRiskCategory())).count();
        long low = predictions.stream().filter(p -> "Low Risk".equalsIgnoreCase(p.getRiskCategory())).count();

        response.setTotalAnalyzed(total);
        response.setHighRiskCount(high);
        response.setMediumRiskCount(medium);
        response.setLowRiskCount(low);
        response.setHighRiskPercentage(total > 0 ? ((double) high / total) * 100.0 : 0.0);
        response.setStudentPredictions(predictions);
        response.setModelStatus("Online");
        return response;
    }

    /**
     * Executes the Python process via ProcessBuilder with strict JSON over standard streams.
     */
    private Map<String, Object> executeInferenceProcess(Map<String, Object> inputPayload) {
        File scriptFile = resolveScriptFile();
        if (!scriptFile.exists()) {
            throw new IllegalStateException("Prediction bridge script not found at " + scriptFile.getPath());
        }

        ProcessBuilder pb = new ProcessBuilder(
                pythonPath,
                scriptFile.getAbsolutePath()
        );

        pb.redirectErrorStream(false);

        try {
            Process process = pb.start();

            // Write JSON input to process standard input
            String jsonInput = objectMapper.writeValueAsString(inputPayload);
            try (BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8))) {
                writer.write(jsonInput);
                writer.flush();
            }

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new IllegalStateException("ML prediction process timed out after " + timeoutSeconds + " seconds.");
            }

            int exitCode = process.exitValue();
            String stdout = readStream(process.getInputStream());
            String stderr = readStream(process.getErrorStream());

            if (exitCode != 0) {
                logger.error("Python inference exited with code {}. Stderr: {}", exitCode, stderr);
                throw new IllegalStateException("ML prediction engine error: " + (stderr.isEmpty() ? stdout : stderr));
            }

            JsonNode root = objectMapper.readTree(stdout);
            if (root.has("error")) {
                throw new IllegalStateException("ML model returned error: " + root.get("error").asText());
            }

            return objectMapper.convertValue(root, new TypeReference<Map<String, Object>>() {});

        } catch (IOException | InterruptedException e) {
            logger.error("Failed to execute ML inference process: {}", e.getMessage());
            throw new IllegalStateException("ML prediction service unavailable: " + e.getMessage(), e);
        }
    }

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString().trim();
    }

    private double calculateAttendancePercentage(Long studentId, Long courseId) {
        long total;
        long present;
        long late;
        if (courseId != null) {
            total = attendanceRecordRepository.countByStudentIdAndCourseId(studentId, courseId);
            present = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(studentId, courseId, AttendanceStatus.PRESENT);
            late = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(studentId, courseId, AttendanceStatus.LATE);
        } else {
            total = attendanceRecordRepository.countByStudentId(studentId);
            present = attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
            late = attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE);
        }
        if (total == 0) {
            return 80.0; // Baseline assumption for newly enrolled student
        }
        return ((double) (present + late) / total) * 100.0;
    }

    /**
     * Calculates the authoritative attendance percentage matching the Student Portal logic.
     * Evaluates total attendance records across enrolled courses counting PRESENT and LATE.
     */
    private Double calculateAuthoritativeAttendance(Long studentId) {
        long totalAttendance = attendanceRecordRepository.countByStudentId(studentId);
        if (totalAttendance > 0) {
            long present = attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
            long late = attendanceRecordRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE);
            return Math.round(((double) (present + late) / totalAttendance * 100.0) * 10.0) / 10.0;
        }
        return null;
    }

    private Double calculateAssessmentAverage(Long studentId, Long courseId, AssessmentType type) {
        List<AssessmentMark> marks;
        if (courseId != null) {
            marks = assessmentMarkRepository.findByAssessment_CourseIdAndStudentId(courseId, studentId);
        } else {
            // All marks for student across courses
            marks = assessmentMarkRepository.findAll().stream()
                    .filter(m -> m.getStudent().getId().equals(studentId))
                    .toList();
        }

        List<Double> percentages = marks.stream()
                .filter(m -> m.getAssessment().getType() == type)
                .filter(m -> m.getMarksObtained() != null && m.getAssessment().getMaxMarks() > 0)
                .map(m -> (m.getMarksObtained() / m.getAssessment().getMaxMarks()) * 100.0)
                .toList();

        if (percentages.isEmpty()) {
            return null;
        }

        double sum = 0;
        for (Double p : percentages) {
            sum += p;
        }
        return sum / percentages.size();
    }

    private String generateRecommendation(String riskLevel, double attendance, double midterm) {
        if ("High Risk".equalsIgnoreCase(riskLevel)) {
            if (attendance < 75.0) {
                return "Immediate attendance counseling required. Schedule a 1-on-1 advisor meeting and provide make-up course assignments.";
            } else if (midterm < 60.0) {
                return "Academic tutorial recommended. Student demonstrates low test comprehension; recommend peer tutoring.";
            }
            return "Urgent academic intervention advised across coursework and periodic evaluations.";
        } else if ("Medium Risk".equalsIgnoreCase(riskLevel)) {
            if (attendance < 80.0) {
                return "Encourage consistent class attendance to prevent sliding into high-risk threshold.";
            }
            return "Monitor weekly assignments and quiz progress to bolster cumulative performance.";
        }
        return "Student is demonstrating healthy academic progress. Continue standard course engagement.";
    }
}
