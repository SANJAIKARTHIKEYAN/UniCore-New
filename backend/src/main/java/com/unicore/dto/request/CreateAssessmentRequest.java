package com.unicore.dto.request;

import com.unicore.entity.AssessmentType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreateAssessmentRequest {

    @NotBlank(message = "Assessment title is required.")
    private String title;

    @NotNull(message = "Assessment type is required.")
    private AssessmentType type;

    @NotNull(message = "Max marks is required.")
    @Positive(message = "Max marks must be a positive number.")
    private Double maxMarks;

    @NotNull(message = "Weightage is required.")
    @DecimalMin(value = "0.0", message = "Weightage must be at least 0.")
    @DecimalMax(value = "100.0", message = "Weightage cannot exceed 100.")
    private Double weightage;

    private Boolean published;

    public CreateAssessmentRequest() {
    }

    public CreateAssessmentRequest(String title, AssessmentType type, Double maxMarks, Double weightage) {
        this.title = title;
        this.type = type;
        this.maxMarks = maxMarks;
        this.weightage = weightage;
        this.published = false;
    }

    public CreateAssessmentRequest(String title, AssessmentType type, Double maxMarks, Double weightage, Boolean published) {
        this.title = title;
        this.type = type;
        this.maxMarks = maxMarks;
        this.weightage = weightage;
        this.published = published;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public AssessmentType getType() { return type; }
    public void setType(AssessmentType type) { this.type = type; }

    public Double getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }

    public Double getWeightage() { return weightage; }
    public void setWeightage(Double weightage) { this.weightage = weightage; }

    public Boolean getPublished() { return published; }
    public void setPublished(Boolean published) { this.published = published; }
}
