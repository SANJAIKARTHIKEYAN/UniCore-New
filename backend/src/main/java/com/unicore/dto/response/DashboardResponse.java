package com.unicore.dto.response;

public class DashboardResponse {
    private String studentName;
    private String studentId;
    private String department;
    private Integer semester;
    private String derivedYear;
    private Integer enrolledCoursesCount;
    private Double overallAttendancePercent;
    private Double semesterGpa;
    private Long pendingFeesCount;
    private Long unreadNotificationsCount;
    private String riskStatus;

    public DashboardResponse() {
    }

    public DashboardResponse(String studentName, String studentId, String department,
                             Integer semester, String derivedYear, Integer enrolledCoursesCount,
                             Double overallAttendancePercent, Double semesterGpa,
                             Long pendingFeesCount, Long unreadNotificationsCount, String riskStatus) {
        this.studentName = studentName;
        this.studentId = studentId;
        this.department = department;
        this.semester = semester;
        this.derivedYear = derivedYear;
        this.enrolledCoursesCount = enrolledCoursesCount;
        this.overallAttendancePercent = overallAttendancePercent;
        this.semesterGpa = semesterGpa;
        this.pendingFeesCount = pendingFeesCount;
        this.unreadNotificationsCount = unreadNotificationsCount;
        this.riskStatus = riskStatus;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getDerivedYear() {
        return derivedYear;
    }

    public void setDerivedYear(String derivedYear) {
        this.derivedYear = derivedYear;
    }

    public Integer getEnrolledCoursesCount() {
        return enrolledCoursesCount;
    }

    public void setEnrolledCoursesCount(Integer enrolledCoursesCount) {
        this.enrolledCoursesCount = enrolledCoursesCount;
    }

    public Double getOverallAttendancePercent() {
        return overallAttendancePercent;
    }

    public void setOverallAttendancePercent(Double overallAttendancePercent) {
        this.overallAttendancePercent = overallAttendancePercent;
    }

    public Double getSemesterGpa() {
        return semesterGpa;
    }

    public void setSemesterGpa(Double semesterGpa) {
        this.semesterGpa = semesterGpa;
    }

    public Long getPendingFeesCount() {
        return pendingFeesCount;
    }

    public void setPendingFeesCount(Long pendingFeesCount) {
        this.pendingFeesCount = pendingFeesCount;
    }

    public Long getUnreadNotificationsCount() {
        return unreadNotificationsCount;
    }

    public void setUnreadNotificationsCount(Long unreadNotificationsCount) {
        this.unreadNotificationsCount = unreadNotificationsCount;
    }

    public String getRiskStatus() {
        return riskStatus;
    }

    public void setRiskStatus(String riskStatus) {
        this.riskStatus = riskStatus;
    }
}
