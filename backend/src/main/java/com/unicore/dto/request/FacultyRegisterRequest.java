package com.unicore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FacultyRegisterRequest {

    @NotBlank(message = "Faculty ID is required")
    private String facultyId;

    @NotBlank(message = "College email is required")
    @Email(message = "Valid college email is required")
    private String collegeEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    public FacultyRegisterRequest() {
    }

    public FacultyRegisterRequest(String facultyId, String collegeEmail, String password) {
        this.facultyId = facultyId;
        this.collegeEmail = collegeEmail;
        this.password = password;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
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
