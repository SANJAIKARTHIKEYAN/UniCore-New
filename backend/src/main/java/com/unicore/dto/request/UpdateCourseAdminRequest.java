package com.unicore.dto.request;

public class UpdateCourseAdminRequest {

    private String courseName;
    private String department;
    private Integer semester;
    private Integer credits;
    private Long instructorId;

    public UpdateCourseAdminRequest() {
    }

    public UpdateCourseAdminRequest(String courseName, String department, Integer semester, Integer credits, Long instructorId) {
        this.courseName = courseName;
        this.department = department;
        this.semester = semester;
        this.credits = credits;
        this.instructorId = instructorId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(Long instructorId) {
        this.instructorId = instructorId;
    }
}
