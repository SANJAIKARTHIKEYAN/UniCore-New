package com.unicore.dto.request;

import com.unicore.entity.UserStatus;

public class UpdateFacultyAdminRequest {

    private String name;
    private String department;
    private UserStatus status;

    public UpdateFacultyAdminRequest() {
    }

    public UpdateFacultyAdminRequest(String name, String department, UserStatus status) {
        this.name = name;
        this.department = department;
        this.status = status;
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
}
