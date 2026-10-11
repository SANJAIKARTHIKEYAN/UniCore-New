package com.unicore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateStudentAdminRequest {

    @NotBlank(message = "Student name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String password;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotNull(message = "Admission year is required")
    @Min(value = 2000, message = "Admission year must be valid")
    private Integer admissionYear;

    @NotNull(message = "Current semester is required")
    @Min(value = 1, message = "Current semester must be at least 1")
    private Integer currentSemester;

    public CreateStudentAdminRequest() {
    }

    public CreateStudentAdminRequest(String name, String email, String password, String department,
                                     String studentId, Integer admissionYear, Integer currentSemester) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.department = department;
        this.studentId = studentId;
        this.admissionYear = admissionYear;
        this.currentSemester = currentSemester;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
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
}
