package com.unicore.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class AdvisorOverviewDTO {
    private Long studentId;
    private String studentName;
    private String studentRoll;
    private String department;
    private Integer semester;
    private double overallAttendancePercent;
    private Double averageMarksPercent;
    private String riskCategory;
    private Double riskConfidence;
    private int courseCount;
    private List<AdvisorRecommendationDTO> recommendations;
    private String summaryHeadline;
    private LocalDateTime generatedAt;

    public AdvisorOverviewDTO() {
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRoll() { return studentRoll; }
    public void setStudentRoll(String studentRoll) { this.studentRoll = studentRoll; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public double getOverallAttendancePercent() { return overallAttendancePercent; }
    public void setOverallAttendancePercent(double overallAttendancePercent) { this.overallAttendancePercent = overallAttendancePercent; }

    public Double getAverageMarksPercent() { return averageMarksPercent; }
    public void setAverageMarksPercent(Double averageMarksPercent) { this.averageMarksPercent = averageMarksPercent; }

    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }

    public Double getRiskConfidence() { return riskConfidence; }
    public void setRiskConfidence(Double riskConfidence) { this.riskConfidence = riskConfidence; }

    public int getCourseCount() { return courseCount; }
    public void setCourseCount(int courseCount) { this.courseCount = courseCount; }

    public List<AdvisorRecommendationDTO> getRecommendations() { return recommendations; }
    public void setRecommendations(List<AdvisorRecommendationDTO> recommendations) { this.recommendations = recommendations; }

    public String getSummaryHeadline() { return summaryHeadline; }
    public void setSummaryHeadline(String summaryHeadline) { this.summaryHeadline = summaryHeadline; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
