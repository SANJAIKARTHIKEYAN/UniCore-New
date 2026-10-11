package com.unicore.dto.response;

import java.util.List;

public class FacultyCourseRosterResponse {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String department;
    private Integer semester;
    private Integer credits;
    private Integer totalEnrolled;
    private List<EnrolledStudentResponse> students;

    public FacultyCourseRosterResponse() {
    }

    public FacultyCourseRosterResponse(Long courseId, String courseCode, String courseName,
                                       String department, Integer semester, Integer credits,
                                       Integer totalEnrolled, List<EnrolledStudentResponse> students) {
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.department = department;
        this.semester = semester;
        this.credits = credits;
        this.totalEnrolled = totalEnrolled;
        this.students = students;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
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

    public Integer getTotalEnrolled() {
        return totalEnrolled;
    }

    public void setTotalEnrolled(Integer totalEnrolled) {
        this.totalEnrolled = totalEnrolled;
    }

    public List<EnrolledStudentResponse> getStudents() {
        return students;
    }

    public void setStudents(List<EnrolledStudentResponse> students) {
        this.students = students;
    }
}
