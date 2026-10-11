package com.unicore.dto.response;

public class FacultyProfileResponse {
    private String facultyId;
    private String department;

    public FacultyProfileResponse() {
    }

    public FacultyProfileResponse(String facultyId, String department) {
        this.facultyId = facultyId;
        this.department = department;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
