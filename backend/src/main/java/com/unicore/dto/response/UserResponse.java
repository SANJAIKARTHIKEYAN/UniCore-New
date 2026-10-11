package com.unicore.dto.response;

import com.unicore.entity.Role;
import com.unicore.entity.UserStatus;

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String department;
    private UserStatus status;
    private StudentProfileResponse studentProfile;
    private FacultyProfileResponse facultyProfile;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, String email, Role role, String department, UserStatus status) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.department = department;
        this.status = status;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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

    public StudentProfileResponse getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfileResponse studentProfile) {
        this.studentProfile = studentProfile;
    }

    public FacultyProfileResponse getFacultyProfile() {
        return facultyProfile;
    }

    public void setFacultyProfile(FacultyProfileResponse facultyProfile) {
        this.facultyProfile = facultyProfile;
    }
}
