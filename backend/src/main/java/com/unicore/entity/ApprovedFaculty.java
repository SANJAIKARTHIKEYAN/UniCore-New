package com.unicore.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "approved_faculties")
public class ApprovedFaculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "faculty_id", nullable = false, unique = true)
    private String facultyId;

    @Column(nullable = false)
    private String name;

    @Column(name = "college_email", nullable = false, unique = true)
    private String collegeEmail;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "is_registered", nullable = false)
    private boolean isRegistered = false;

    public ApprovedFaculty() {
    }

    public ApprovedFaculty(String facultyId, String name, String collegeEmail, String department) {
        this.facultyId = facultyId;
        this.name = name;
        this.collegeEmail = collegeEmail;
        this.department = department;
        this.active = true;
        this.isRegistered = false;
    }

    public ApprovedFaculty(String facultyId, String name, String collegeEmail, String department, boolean active) {
        this.facultyId = facultyId;
        this.name = name;
        this.collegeEmail = collegeEmail;
        this.department = department;
        this.active = active;
        this.isRegistered = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCollegeEmail() {
        return collegeEmail;
    }

    public void setCollegeEmail(String collegeEmail) {
        this.collegeEmail = collegeEmail;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isRegistered() {
        return isRegistered;
    }

    public void setRegistered(boolean registered) {
        isRegistered = registered;
    }
}
