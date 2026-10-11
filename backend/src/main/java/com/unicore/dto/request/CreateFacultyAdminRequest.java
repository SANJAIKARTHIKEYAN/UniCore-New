package com.unicore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CreateFacultyAdminRequest {

    @NotBlank(message = "Faculty name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String password;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Faculty ID is required")
    private String facultyId;

    public CreateFacultyAdminRequest() {
    }

    public CreateFacultyAdminRequest(String name, String email, String password, String department, String facultyId) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.department = department;
        this.facultyId = facultyId;
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

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }
}
