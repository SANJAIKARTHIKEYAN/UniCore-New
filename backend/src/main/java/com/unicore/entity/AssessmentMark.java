package com.unicore.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_marks", uniqueConstraints = {
        @UniqueConstraint(name = "uk_assessment_student", columnNames = {"assessment_id", "student_id"})
})
public class AssessmentMark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "marks_obtained")
    private Double marksObtained;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    public AssessmentMark() {
    }

    public AssessmentMark(Assessment assessment, User student, Double marksObtained) {
        this.assessment = assessment;
        this.student = student;
        this.marksObtained = marksObtained;
        this.gradedAt = marksObtained != null ? LocalDateTime.now() : null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Double getMarksObtained() { return marksObtained; }
    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
        this.gradedAt = marksObtained != null ? LocalDateTime.now() : null;
    }

    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }
}
