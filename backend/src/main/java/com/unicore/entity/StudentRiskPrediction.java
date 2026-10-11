package com.unicore.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_risk_predictions", indexes = {
        @Index(name = "idx_risk_student", columnList = "student_id"),
        @Index(name = "idx_risk_category", columnList = "risk_category")
})
public class StudentRiskPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "risk_category", nullable = false, length = 30)
    private String riskCategory; // "High Risk", "Medium Risk", "Low Risk"

    private Double confidence;

    @Column(name = "probabilities_json", columnDefinition = "TEXT")
    private String probabilitiesJson;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "predicted_at", nullable = false)
    private LocalDateTime predictedAt;

    @PrePersist
    protected void onCreate() {
        if (this.predictedAt == null) {
            this.predictedAt = LocalDateTime.now();
        }
    }

    public StudentRiskPrediction() {
    }

    public StudentRiskPrediction(User student, Course course, String riskCategory, Double confidence,
                                 String probabilitiesJson, String modelVersion) {
        this.student = student;
        this.course = course;
        this.riskCategory = riskCategory;
        this.confidence = confidence;
        this.probabilitiesJson = probabilitiesJson;
        this.modelVersion = modelVersion;
        this.predictedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getRiskCategory() {
        return riskCategory;
    }

    public void setRiskCategory(String riskCategory) {
        this.riskCategory = riskCategory;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getProbabilitiesJson() {
        return probabilitiesJson;
    }

    public void setProbabilitiesJson(String probabilitiesJson) {
        this.probabilitiesJson = probabilitiesJson;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public LocalDateTime getPredictedAt() {
        return predictedAt;
    }

    public void setPredictedAt(LocalDateTime predictedAt) {
        this.predictedAt = predictedAt;
    }
}
