package com.unicore.dto.response;

public class FacultyCourseResponse {
    private Long id;
    private String courseCode;
    private String courseName;
    private String department;
    private Integer semester;
    private Integer credits;
    private Integer enrolledStudentsCount;

    public FacultyCourseResponse() {
    }

    public FacultyCourseResponse(Long id, String courseCode, String courseName, String department,
                                 Integer semester, Integer credits, Integer enrolledStudentsCount) {
        this.id = id;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.department = department;
        this.semester = semester;
        this.credits = credits;
        this.enrolledStudentsCount = enrolledStudentsCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getEnrolledStudentsCount() {
        return enrolledStudentsCount;
    }

    public void setEnrolledStudentsCount(Integer enrolledStudentsCount) {
        this.enrolledStudentsCount = enrolledStudentsCount;
    }
}
