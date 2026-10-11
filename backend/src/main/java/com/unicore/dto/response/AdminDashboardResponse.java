package com.unicore.dto.response;

import java.util.List;

public class AdminDashboardResponse {

    private long totalStudents;
    private long totalFaculty;
    private long totalCourses;
    private long totalEnrollments;
    private long activeUsers;
    private long totalDepartments;
    private long totalAssessments;
    private long totalAttendanceRecords;
    private List<String> recentActivity;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(long totalStudents, long totalFaculty, long totalCourses,
                                  long totalEnrollments, long activeUsers, long totalDepartments,
                                  long totalAssessments, long totalAttendanceRecords,
                                  List<String> recentActivity) {
        this.totalStudents = totalStudents;
        this.totalFaculty = totalFaculty;
        this.totalCourses = totalCourses;
        this.totalEnrollments = totalEnrollments;
        this.activeUsers = activeUsers;
        this.totalDepartments = totalDepartments;
        this.totalAssessments = totalAssessments;
        this.totalAttendanceRecords = totalAttendanceRecords;
        this.recentActivity = recentActivity;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalFaculty() {
        return totalFaculty;
    }

    public void setTotalFaculty(long totalFaculty) {
        this.totalFaculty = totalFaculty;
    }

    public long getTotalCourses() {
        return totalCourses;
    }

    public void setTotalCourses(long totalCourses) {
        this.totalCourses = totalCourses;
    }

    public long getTotalEnrollments() {
        return totalEnrollments;
    }

    public void setTotalEnrollments(long totalEnrollments) {
        this.totalEnrollments = totalEnrollments;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getTotalAssessments() {
        return totalAssessments;
    }

    public void setTotalAssessments(long totalAssessments) {
        this.totalAssessments = totalAssessments;
    }

    public long getTotalAttendanceRecords() {
        return totalAttendanceRecords;
    }

    public void setTotalAttendanceRecords(long totalAttendanceRecords) {
        this.totalAttendanceRecords = totalAttendanceRecords;
    }

    public List<String> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<String> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
