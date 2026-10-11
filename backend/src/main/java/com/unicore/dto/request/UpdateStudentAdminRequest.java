package com.unicore.dto.request;

import com.unicore.entity.UserStatus;

public class UpdateStudentAdminRequest {

    private String name;
    private String department;
    private UserStatus status;
    private Integer currentSemester;
    private Integer admissionYear;

    public UpdateStudentAdminRequest() {
    }

    public UpdateStudentAdminRequest(String name, String department, UserStatus status, Integer currentSemester, Integer admissionYear) {
        this.name = name;
        this.department = department;
        this.status = status;
        this.currentSemester = currentSemester;
        this.admissionYear = admissionYear;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public Integer getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(Integer currentSemester) {
        this.currentSemester = currentSemester;
    }

    public Integer getAdmissionYear() {
        return admissionYear;
    }

    public void setAdmissionYear(Integer admissionYear) {
        this.admissionYear = admissionYear;
    }
}
