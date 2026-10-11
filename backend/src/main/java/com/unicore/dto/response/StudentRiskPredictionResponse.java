package com.unicore.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public class StudentRiskPredictionResponse {
    private Long studentId;
    private String studentName;
    private String studentRoll;
    private String department;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String riskCategory; // "High Risk", "Medium Risk", "Low Risk"
    private Double confidence;
    private Map<String, Double> probabilities;
    private Map<String, Double> features;
    private String modelVersion;
    private LocalDateTime predictedAt;
    private String recommendation;
    private Double attendance;

    public StudentRiskPredictionResponse() {
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRoll() { return studentRoll; }
    public void setStudentRoll(String studentRoll) { this.studentRoll = studentRoll; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Map<String, Double> getProbabilities() { return probabilities; }
    public void setProbabilities(Map<String, Double> probabilities) { this.probabilities = probabilities; }

    public Map<String, Double> getFeatures() { return features; }
    public void setFeatures(Map<String, Double> features) { this.features = features; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public LocalDateTime getPredictedAt() { return predictedAt; }
    public void setPredictedAt(LocalDateTime predictedAt) { this.predictedAt = predictedAt; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public Double getAttendance() { return attendance; }
    public void setAttendance(Double attendance) { this.attendance = attendance; }
}
