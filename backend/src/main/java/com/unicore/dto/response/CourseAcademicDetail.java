package com.unicore.dto.response;

import java.util.ArrayList;
import java.util.List;

public class CourseAcademicDetail {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String grade;
    private Double gradePoints;
    private List<StudentAssessmentMarkDTO> assessments = new ArrayList<>();

    public CourseAcademicDetail() {
    }

    public CourseAcademicDetail(String courseCode, String courseName, Integer credits, String grade, Double gradePoints) {
        this(null, courseCode, courseName, credits, grade, gradePoints, new ArrayList<>());
    }

    public CourseAcademicDetail(String courseCode, String courseName, Integer credits, String grade, Double gradePoints, List<StudentAssessmentMarkDTO> assessments) {
        this(null, courseCode, courseName, credits, grade, gradePoints, assessments);
    }

    public CourseAcademicDetail(Long courseId, String courseCode, String courseName, Integer credits, String grade, Double gradePoints, List<StudentAssessmentMarkDTO> assessments) {
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.credits = credits;
        this.grade = grade;
        this.gradePoints = gradePoints;
        this.assessments = assessments != null ? assessments : new ArrayList<>();
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

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
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

    public List<StudentAssessmentMarkDTO> getAssessments() {
        return assessments;
    }

    public void setAssessments(List<StudentAssessmentMarkDTO> assessments) {
        this.assessments = assessments != null ? assessments : new ArrayList<>();
    }

    public List<StudentAssessmentMarkDTO> getPublishedAssessments() {
        return assessments;
    }
}
