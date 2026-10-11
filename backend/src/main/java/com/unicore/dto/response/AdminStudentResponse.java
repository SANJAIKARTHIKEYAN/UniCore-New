package com.unicore.dto.response;

import com.unicore.entity.UserStatus;

import java.time.LocalDateTime;

public class AdminStudentResponse {

    private Long id;
    private String name;
    private String email;
    private String department;
    private UserStatus status;
    private String studentId;
    private Integer admissionYear;
    private Integer currentSemester;
    private String derivedYear;
    private int enrolledCoursesCount;
    private String enrollmentMessage;
    private LocalDateTime createdAt;

    public AdminStudentResponse() {
    }

    public AdminStudentResponse(Long id, String name, String email, String department,
                                UserStatus status, String studentId, Integer admissionYear,
                                Integer currentSemester, String derivedYear, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.department = department;
        this.status = status;
        this.studentId = studentId;
        this.admissionYear = admissionYear;
        this.currentSemester = currentSemester;
        this.derivedYear = derivedYear;
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

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Integer getAdmissionYear() {
        return admissionYear;
    }

    public void setAdmissionYear(Integer admissionYear) {
        this.admissionYear = admissionYear;
    }

    public Integer getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(Integer currentSemester) {
        this.currentSemester = currentSemester;
    }

    public String getDerivedYear() {
        return derivedYear;
    }

    public void setDerivedYear(String derivedYear) {
        this.derivedYear = derivedYear;
    }

    public int getEnrolledCoursesCount() {
        return enrolledCoursesCount;
    }

    public void setEnrolledCoursesCount(int enrolledCoursesCount) {
        this.enrolledCoursesCount = enrolledCoursesCount;
    }

    public String getEnrollmentMessage() {
        return enrollmentMessage;
    }

    public void setEnrollmentMessage(String enrollmentMessage) {
        this.enrollmentMessage = enrollmentMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
