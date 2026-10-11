package com.unicore.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateCourseAdminRequest {

    @NotBlank(message = "Course code is required")
    private String courseCode;

    @NotBlank(message = "Course name is required")
    private String courseName;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be at least 1")
    private Integer semester;

    @NotNull(message = "Credits is required")
    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits = 3;

    private Long instructorId;

    public CreateCourseAdminRequest() {
    }

    public CreateCourseAdminRequest(String courseCode, String courseName, String department,
                                    Integer semester, Integer credits, Long instructorId) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.department = department;
        this.semester = semester;
        this.credits = credits;
        this.instructorId = instructorId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
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
