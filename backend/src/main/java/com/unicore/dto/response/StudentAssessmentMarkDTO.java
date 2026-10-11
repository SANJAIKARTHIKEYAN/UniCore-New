package com.unicore.dto.response;

import java.time.LocalDateTime;

public class StudentAssessmentMarkDTO {

    private Long assessmentId;
    private String assessmentTitle;
    private String assessmentType;
    private Double marksObtained;
    private Double maxMarks;
    private Double percentage;
    private Double weightage;
    private String status;
    private Boolean published;
    private LocalDateTime gradedAt;

    public StudentAssessmentMarkDTO() {
    }

    public StudentAssessmentMarkDTO(Long assessmentId, String assessmentTitle, String assessmentType,
                                  Double marksObtained, Double maxMarks, Double percentage,
                                  Double weightage, String status, Boolean published,
                                  LocalDateTime gradedAt) {
        this.assessmentId = assessmentId;
        this.assessmentTitle = assessmentTitle;
        this.assessmentType = assessmentType;
        this.marksObtained = marksObtained;
        this.maxMarks = maxMarks;
        this.percentage = percentage;
        this.weightage = weightage;
        this.status = status;
        this.published = published;
        this.gradedAt = gradedAt;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getAssessmentTitle() {
        return assessmentTitle;
    }

    public void setAssessmentTitle(String assessmentTitle) {
        this.assessmentTitle = assessmentTitle;
    }

    // Convenience alias for frontend compatibility
    public String getTitle() {
        return assessmentTitle;
    }

    public String getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(String assessmentType) {
        this.assessmentType = assessmentType;
    }

    // Convenience alias for frontend compatibility
    public String getType() {
        return assessmentType;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Double maxMarks) {
        this.maxMarks = maxMarks;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Double getWeightage() {
        return weightage;
    }

    public void setWeightage(Double weightage) {
        this.weightage = weightage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getPublished() {
        return published;
    }

    public void setPublished(Boolean published) {
        this.published = published;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }
}
