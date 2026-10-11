package com.unicore.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public class AdminAdvisorOverviewDTO {
    private long totalStudentsAnalyzed;
    private long highPriorityCount;
    private long mediumPriorityCount;
    private long lowPriorityCount;
    private long lowAttendanceStudentsCount;
    private long lowMarksStudentsCount;
    private Map<String, Long> priorityDistributionByDepartment;
    private LocalDateTime generatedAt;

    public AdminAdvisorOverviewDTO() {
    }

    public long getTotalStudentsAnalyzed() { return totalStudentsAnalyzed; }
    public void setTotalStudentsAnalyzed(long totalStudentsAnalyzed) { this.totalStudentsAnalyzed = totalStudentsAnalyzed; }

    public long getHighPriorityCount() { return highPriorityCount; }
    public void setHighPriorityCount(long highPriorityCount) { this.highPriorityCount = highPriorityCount; }

    public long getMediumPriorityCount() { return mediumPriorityCount; }
    public void setMediumPriorityCount(long mediumPriorityCount) { this.mediumPriorityCount = mediumPriorityCount; }

    public long getLowPriorityCount() { return lowPriorityCount; }
    public void setLowPriorityCount(long lowPriorityCount) { this.lowPriorityCount = lowPriorityCount; }

    public long getLowAttendanceStudentsCount() { return lowAttendanceStudentsCount; }
    public void setLowAttendanceStudentsCount(long lowAttendanceStudentsCount) { this.lowAttendanceStudentsCount = lowAttendanceStudentsCount; }

    public long getLowMarksStudentsCount() { return lowMarksStudentsCount; }
    public void setLowMarksStudentsCount(long lowMarksStudentsCount) { this.lowMarksStudentsCount = lowMarksStudentsCount; }

    public Map<String, Long> getPriorityDistributionByDepartment() { return priorityDistributionByDepartment; }
    public void setPriorityDistributionByDepartment(Map<String, Long> priorityDistributionByDepartment) { this.priorityDistributionByDepartment = priorityDistributionByDepartment; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
