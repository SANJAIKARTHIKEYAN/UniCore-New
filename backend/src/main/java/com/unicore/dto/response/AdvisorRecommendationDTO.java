package com.unicore.dto.response;

import java.time.LocalDateTime;

public class AdvisorRecommendationDTO {
    private String id;
    private String title;
    private String explanation;
    private String priority; // "HIGH", "MEDIUM", "LOW"
    private String relatedCourse;
    private String supportingMetric;
    private String suggestedAction;
    private LocalDateTime generatedAt;

    public AdvisorRecommendationDTO() {
    }

    public AdvisorRecommendationDTO(String id, String title, String explanation, String priority,
                                  String relatedCourse, String supportingMetric, String suggestedAction) {
        this.id = id;
        this.title = title;
        this.explanation = explanation;
        this.priority = priority;
        this.relatedCourse = relatedCourse;
        this.supportingMetric = supportingMetric;
        this.suggestedAction = suggestedAction;
        this.generatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getRelatedCourse() { return relatedCourse; }
    public void setRelatedCourse(String relatedCourse) { this.relatedCourse = relatedCourse; }

    public String getSupportingMetric() { return supportingMetric; }
    public void setSupportingMetric(String supportingMetric) { this.supportingMetric = supportingMetric; }

    public String getSuggestedAction() { return suggestedAction; }
    public void setSuggestedAction(String suggestedAction) { this.suggestedAction = suggestedAction; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
