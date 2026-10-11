package com.unicore.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "approved_students")
public class ApprovedStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, unique = true)
    private String studentId;

    @Column(nullable = false)
    private String name;

    @Column(name = "college_email", nullable = false, unique = true)
    private String collegeEmail;

    @Column(nullable = false)
    private String department;

    @Column(name = "admission_year", nullable = false)
    private Integer admissionYear;

    @Column(name = "current_semester", nullable = false)
    private Integer currentSemester;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "is_registered", nullable = false)
    private boolean isRegistered = false;

    public ApprovedStudent() {
    }

    public ApprovedStudent(String studentId, String name, String collegeEmail, String department, Integer admissionYear, Integer currentSemester) {
        this.studentId = studentId;
        this.name = name;
        this.collegeEmail = collegeEmail;
        this.department = department;
        this.admissionYear = admissionYear;
        this.currentSemester = currentSemester;
        this.active = true;
        this.isRegistered = false;
    }

    public ApprovedStudent(String studentId, String name, String collegeEmail, String department, Integer admissionYear, Integer currentSemester, boolean active) {
        this.studentId = studentId;
        this.name = name;
        this.collegeEmail = collegeEmail;
        this.department = department;
        this.admissionYear = admissionYear;
        this.currentSemester = currentSemester;
        this.active = active;
        this.isRegistered = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
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
