package com.unicore.dto.response;

import com.unicore.entity.AssessmentType;

import java.time.LocalDateTime;

public class AssessmentResponse {

    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String title;
    private AssessmentType type;
    private Double maxMarks;
    private Double weightage;
    private Boolean published;
    private LocalDateTime createdAt;

    public AssessmentResponse() {
    }

    public AssessmentResponse(Long id, Long courseId, String courseCode, String courseName,
                              String title, AssessmentType type, Double maxMarks,
                              Double weightage, LocalDateTime createdAt) {
        this(id, courseId, courseCode, courseName, title, type, maxMarks, weightage, false, createdAt);
    }

    public AssessmentResponse(Long id, Long courseId, String courseCode, String courseName,
                              String title, AssessmentType type, Double maxMarks,
                              Double weightage, Boolean published, LocalDateTime createdAt) {
        this.id = id;
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.title = title;
        this.type = type;
        this.maxMarks = maxMarks;
        this.weightage = weightage;
        this.published = published != null ? published : false;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public AssessmentType getType() { return type; }
    public void setType(AssessmentType type) { this.type = type; }

    public Double getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }

    public Double getWeightage() { return weightage; }
    public void setWeightage(Double weightage) { this.weightage = weightage; }

    public Boolean getPublished() { return published; }
    public boolean isPublished() { return published != null && published; }
    public void setPublished(Boolean published) { this.published = published; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
