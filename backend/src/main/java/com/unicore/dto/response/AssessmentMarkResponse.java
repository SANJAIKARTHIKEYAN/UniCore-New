package com.unicore.dto.response;

import java.time.LocalDateTime;

public class AssessmentMarkResponse {

    private Long assessmentId;
    private String assessmentTitle;
    private Long studentUserId;
    private String studentId;
    private String studentRegistrationNumber;
    private String studentName;
    private Double marksObtained;
    private Double maxMarks;
    private Double percentage;
    private LocalDateTime gradedAt;

    public AssessmentMarkResponse() {
    }

    public AssessmentMarkResponse(Long assessmentId, String assessmentTitle,
                                  Long studentUserId, String studentId, String studentName,
                                  Double marksObtained, Double maxMarks, LocalDateTime gradedAt) {
        this.assessmentId = assessmentId;
        this.assessmentTitle = assessmentTitle;
        this.studentUserId = studentUserId;
        this.studentId = studentId;
        this.studentRegistrationNumber = studentId;
        this.studentName = studentName;
        this.marksObtained = marksObtained;
        this.maxMarks = maxMarks;
        this.gradedAt = gradedAt;
        if (marksObtained != null && maxMarks != null && maxMarks > 0) {
            this.percentage = Math.round((marksObtained / maxMarks * 100.0) * 10.0) / 10.0;
        }
    }

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }

    public Long getStudentUserId() { return studentUserId; }
    public void setStudentUserId(Long studentUserId) { this.studentUserId = studentUserId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) {
        this.studentId = studentId;
        if (this.studentRegistrationNumber == null) {
            this.studentRegistrationNumber = studentId;
        }
    }

    public String getStudentRegistrationNumber() {
        return studentRegistrationNumber != null ? studentRegistrationNumber : studentId;
    }
    public void setStudentRegistrationNumber(String studentRegistrationNumber) {
        this.studentRegistrationNumber = studentRegistrationNumber;
    }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Double getMarksObtained() { return marksObtained; }
    public void setMarksObtained(Double marksObtained) { this.marksObtained = marksObtained; }

    public Double getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }
}
