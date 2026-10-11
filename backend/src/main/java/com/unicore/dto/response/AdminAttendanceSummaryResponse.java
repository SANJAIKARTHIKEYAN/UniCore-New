package com.unicore.dto.response;

import java.util.List;

public class AdminAttendanceSummaryResponse {

    private long totalRecords;
    private long totalPresent;
    private long totalAbsent;
    private long totalLate;
    private double overallPercentage;
    private List<DepartmentAttendanceSummary> departmentSummaries;

    public AdminAttendanceSummaryResponse() {
    }

    public AdminAttendanceSummaryResponse(long totalRecords, long totalPresent, long totalAbsent,
                                          long totalLate, double overallPercentage,
                                          List<DepartmentAttendanceSummary> departmentSummaries) {
        this.totalRecords = totalRecords;
        this.totalPresent = totalPresent;
        this.totalAbsent = totalAbsent;
        this.totalLate = totalLate;
        this.overallPercentage = overallPercentage;
        this.departmentSummaries = departmentSummaries;
    }

    public long getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(long totalRecords) {
        this.totalRecords = totalRecords;
    }

    public long getTotalPresent() {
        return totalPresent;
    }

    public void setTotalPresent(long totalPresent) {
        this.totalPresent = totalPresent;
    }

    public long getTotalAbsent() {
        return totalAbsent;
    }

    public void setTotalAbsent(long totalAbsent) {
        this.totalAbsent = totalAbsent;
    }

    public long getTotalLate() {
        return totalLate;
    }

    public void setTotalLate(long totalLate) {
        this.totalLate = totalLate;
    }

    public double getOverallPercentage() {
        return overallPercentage;
    }

    public void setOverallPercentage(double overallPercentage) {
        this.overallPercentage = overallPercentage;
    }

    public List<DepartmentAttendanceSummary> getDepartmentSummaries() {
        return departmentSummaries;
    }

    public void setDepartmentSummaries(List<DepartmentAttendanceSummary> departmentSummaries) {
        this.departmentSummaries = departmentSummaries;
    }

    public static class DepartmentAttendanceSummary {
        private String department;
        private long total;
        private long present;
        private double percentage;

        public DepartmentAttendanceSummary() {
        }

        public DepartmentAttendanceSummary(String department, long total, long present, double percentage) {
            this.department = department;
            this.total = total;
            this.present = present;
            this.percentage = percentage;
        }

        public String getDepartment() {
            return department;
        }

        public void setDepartment(String department) {
            this.department = department;
        }

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }

        public long getPresent() {
            return present;
        }

        public void setPresent(long present) {
            this.present = present;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
    }
}
