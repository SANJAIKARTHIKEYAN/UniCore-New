package com.unicore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class StudentRegisterRequest {

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotBlank(message = "College email is required")
    @Email(message = "Valid college email is required")
    private String collegeEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    public StudentRegisterRequest() {
    }

    public StudentRegisterRequest(String studentId, String collegeEmail, String password) {
        this.studentId = studentId;
        this.collegeEmail = collegeEmail;
        this.password = password;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getCollegeEmail() {
        return collegeEmail;
    }

    public void setCollegeEmail(String collegeEmail) {
        this.collegeEmail = collegeEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
