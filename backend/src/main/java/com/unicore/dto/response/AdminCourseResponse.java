package com.unicore.dto.response;

public class AdminCourseResponse {

    private Long id;
    private String courseCode;
    private String courseName;
    private String department;
    private Integer semester;
    private Integer credits;
    private Long instructorId;
    private String instructorName;
    private long enrolledStudentsCount;

    public AdminCourseResponse() {
    }

    public AdminCourseResponse(Long id, String courseCode, String courseName, String department,
                               Integer semester, Integer credits, Long instructorId,
                               String instructorName, long enrolledStudentsCount) {
        this.id = id;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.department = department;
        this.semester = semester;
        this.credits = credits;
        this.instructorId = instructorId;
        this.instructorName = instructorName;
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

    public Long getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(Long instructorId) {
        this.instructorId = instructorId;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public void setInstructorName(String instructorName) {
        this.instructorName = instructorName;
    }

    public long getEnrolledStudentsCount() {
        return enrolledStudentsCount;
    }

    public void setEnrolledStudentsCount(long enrolledStudentsCount) {
        this.enrolledStudentsCount = enrolledStudentsCount;
    }
}
