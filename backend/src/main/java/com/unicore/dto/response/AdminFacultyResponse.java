package com.unicore.dto.response;

import com.unicore.entity.UserStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AdminFacultyResponse {

    private Long id;
    private String name;
    private String email;
    private String department;
    private UserStatus status;
    private String facultyId;
    private int assignedCoursesCount;
    private List<AdminCourseResponse> assignedCourses = new ArrayList<>();
    private LocalDateTime createdAt;

    public AdminFacultyResponse() {
    }

    public AdminFacultyResponse(Long id, String name, String email, String department,
                                UserStatus status, String facultyId, int assignedCoursesCount,
                                LocalDateTime createdAt) {
        this(id, name, email, department, status, facultyId, assignedCoursesCount, new ArrayList<>(), createdAt);
    }

    public AdminFacultyResponse(Long id, String name, String email, String department,
                                UserStatus status, String facultyId, int assignedCoursesCount,
                                List<AdminCourseResponse> assignedCourses,
                                LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.department = department;
        this.status = status;
        this.facultyId = facultyId;
        this.assignedCoursesCount = assignedCoursesCount;
        this.assignedCourses = assignedCourses != null ? assignedCourses : new ArrayList<>();
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public int getAssignedCoursesCount() {
        return assignedCoursesCount;
    }

    public void setAssignedCoursesCount(int assignedCoursesCount) {
        this.assignedCoursesCount = assignedCoursesCount;
    }

    public List<AdminCourseResponse> getAssignedCourses() {
        return assignedCourses;
    }

    public void setAssignedCourses(List<AdminCourseResponse> assignedCourses) {
        this.assignedCourses = assignedCourses;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
