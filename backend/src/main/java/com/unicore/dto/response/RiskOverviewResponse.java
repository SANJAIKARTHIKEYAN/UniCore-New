package com.unicore.dto.response;

import java.util.List;
import java.util.Map;

public class RiskOverviewResponse {
    private long totalAnalyzed;
    private long highRiskCount;
    private long mediumRiskCount;
    private long lowRiskCount;
    private double highRiskPercentage;
    private Map<String, Long> departmentBreakdown;
    private List<StudentRiskPredictionResponse> studentPredictions;
    private String modelStatus;

    public RiskOverviewResponse() {
    }

    public long getTotalAnalyzed() { return totalAnalyzed; }
    public void setTotalAnalyzed(long totalAnalyzed) { this.totalAnalyzed = totalAnalyzed; }

    public long getHighRiskCount() { return highRiskCount; }
    public void setHighRiskCount(long highRiskCount) { this.highRiskCount = highRiskCount; }

    public long getMediumRiskCount() { return mediumRiskCount; }
    public void setMediumRiskCount(long mediumRiskCount) { this.mediumRiskCount = mediumRiskCount; }

    public long getLowRiskCount() { return lowRiskCount; }
    public void setLowRiskCount(long lowRiskCount) { this.lowRiskCount = lowRiskCount; }

    public double getHighRiskPercentage() { return highRiskPercentage; }
    public void setHighRiskPercentage(double highRiskPercentage) { this.highRiskPercentage = highRiskPercentage; }

    public Map<String, Long> getDepartmentBreakdown() { return departmentBreakdown; }
    public void setDepartmentBreakdown(Map<String, Long> departmentBreakdown) { this.departmentBreakdown = departmentBreakdown; }

    public List<StudentRiskPredictionResponse> getStudentPredictions() { return studentPredictions; }
    public void setStudentPredictions(List<StudentRiskPredictionResponse> studentPredictions) { this.studentPredictions = studentPredictions; }

    public String getModelStatus() { return modelStatus; }
    public void setModelStatus(String modelStatus) { this.modelStatus = modelStatus; }
}
