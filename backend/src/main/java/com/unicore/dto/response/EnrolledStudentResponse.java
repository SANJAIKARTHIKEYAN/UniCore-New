package com.unicore.dto.response;

public class EnrolledStudentResponse {
    private Long enrollmentId;
    private String studentId;
    private String studentName;
    private String collegeEmail;
    private String department;
    private Integer semester;
    private Integer academicYear;
    private String grade;
    private Double gradePoints;
    private Double attendancePercentage;

    public EnrolledStudentResponse() {
    }

    public EnrolledStudentResponse(Long enrollmentId, String studentId, String studentName,
                                   String collegeEmail, String department, Integer semester,
                                   Integer academicYear, String grade, Double gradePoints,
                                   Double attendancePercentage) {
        this.enrollmentId = enrollmentId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.collegeEmail = collegeEmail;
        this.department = department;
        this.semester = semester;
        this.academicYear = academicYear;
        this.grade = grade;
        this.gradePoints = gradePoints;
        this.attendancePercentage = attendancePercentage;
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public void setEnrollmentId(Long enrollmentId) {
        this.enrollmentId = enrollmentId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
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

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }
}
