package com.unicore.dto.response;

import java.util.Map;

public class RiskStatusResponse {
    private Double currentAttendancePercent;
    private Integer currentSemester;
    private Boolean assessmentDataAvailable;
    private String riskLevel;
    private Map<String, Double> riskProbabilities;
    private String message;

    public RiskStatusResponse() {
    }

    public RiskStatusResponse(Double currentAttendancePercent, Integer currentSemester,
                              Boolean assessmentDataAvailable, String riskLevel,
                              Map<String, Double> riskProbabilities, String message) {
        this.currentAttendancePercent = currentAttendancePercent;
        this.currentSemester = currentSemester;
        this.assessmentDataAvailable = assessmentDataAvailable;
        this.riskLevel = riskLevel;
        this.riskProbabilities = riskProbabilities;
        this.message = message;
    }

    public Double getCurrentAttendancePercent() {
        return currentAttendancePercent;
    }

    public void setCurrentAttendancePercent(Double currentAttendancePercent) {
        this.currentAttendancePercent = currentAttendancePercent;
    }

    public Integer getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(Integer currentSemester) {
        this.currentSemester = currentSemester;
    }

    public Boolean getAssessmentDataAvailable() {
        return assessmentDataAvailable;
    }

    public void setAssessmentDataAvailable(Boolean assessmentDataAvailable) {
        this.assessmentDataAvailable = assessmentDataAvailable;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Map<String, Double> getRiskProbabilities() {
        return riskProbabilities;
    }

    public void setRiskProbabilities(Map<String, Double> riskProbabilities) {
        this.riskProbabilities = riskProbabilities;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
