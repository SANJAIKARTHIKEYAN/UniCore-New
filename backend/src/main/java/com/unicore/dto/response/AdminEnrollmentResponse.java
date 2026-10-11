package com.unicore.dto.response;

public class AdminEnrollmentResponse {

    private Long id;
    private Long studentUserId;
    private String studentName;
    private String studentRegistrationNumber;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer semester;
    private Integer academicYear;
    private String grade;
    private Double gradePoints;

    public AdminEnrollmentResponse() {
    }

    public AdminEnrollmentResponse(Long id, Long studentUserId, String studentName,
                                   String studentRegistrationNumber, Long courseId,
                                   String courseCode, String courseName, Integer semester,
                                   Integer academicYear, String grade, Double gradePoints) {
        this.id = id;
        this.studentUserId = studentUserId;
        this.studentName = studentName;
        this.studentRegistrationNumber = studentRegistrationNumber;
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.semester = semester;
        this.academicYear = academicYear;
        this.grade = grade;
        this.gradePoints = gradePoints;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentUserId() {
        return studentUserId;
    }

    public void setStudentUserId(Long studentUserId) {
        this.studentUserId = studentUserId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentRegistrationNumber() {
        return studentRegistrationNumber;
    }

    public void setStudentRegistrationNumber(String studentRegistrationNumber) {
        this.studentRegistrationNumber = studentRegistrationNumber;
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

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public Double getGradePoints() {
        return gradePoints;
    }

    public void setGradePoints(Double gradePoints) {
        this.gradePoints = gradePoints;
    }
}
