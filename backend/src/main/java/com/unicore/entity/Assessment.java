package com.unicore.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessments", indexes = {
        @Index(name = "idx_assessment_course", columnList = "course_id")
})
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssessmentType type;

    @Column(name = "max_marks", nullable = false)
    private Double maxMarks;

    @Column(nullable = false)
    private Double weightage;

    @Column(name = "published", nullable = false)
    private Boolean published = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.published == null) {
            this.published = false;
        }
    }

    public Assessment() {
        this.published = false;
    }

    public Assessment(Course course, String title, AssessmentType type, Double maxMarks, Double weightage) {
        this.course = course;
        this.title = title;
        this.type = type;
        this.maxMarks = maxMarks;
        this.weightage = weightage;
        this.published = false;
    }

    public Assessment(Course course, String title, AssessmentType type, Double maxMarks, Double weightage, Boolean published) {
        this.course = course;
        this.title = title;
        this.type = type;
        this.maxMarks = maxMarks;
        this.weightage = weightage;
        this.published = published != null ? published : false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public AssessmentType getType() { return type; }
    public void setType(AssessmentType type) { this.type = type; }

    public Double getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }

    public Double getWeightage() { return weightage; }
    public void setWeightage(Double weightage) { this.weightage = weightage; }

    public Boolean getPublished() { return published != null && published; }
    public boolean isPublished() { return published != null && published; }
    public void setPublished(Boolean published) { this.published = published != null && published; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
