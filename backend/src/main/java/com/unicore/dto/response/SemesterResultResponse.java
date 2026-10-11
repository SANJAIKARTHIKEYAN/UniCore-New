package com.unicore.dto.response;

import java.util.List;

public class SemesterResultResponse {
    private Integer semester;
    private Integer academicYear;
    private Boolean isCurrentSemester;
    private List<CourseAcademicDetail> courses;
    private Double sgpa;
    private Integer totalCredits;

    public SemesterResultResponse() {
    }

    public SemesterResultResponse(Integer semester, Integer academicYear, Boolean isCurrentSemester,
                                  List<CourseAcademicDetail> courses, Double sgpa, Integer totalCredits) {
        this.semester = semester;
        this.academicYear = academicYear;
        this.isCurrentSemester = isCurrentSemester;
        this.courses = courses;
        this.sgpa = sgpa;
        this.totalCredits = totalCredits;
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

    public Boolean getIsCurrentSemester() {
        return isCurrentSemester;
    }

    public void setIsCurrentSemester(Boolean currentSemester) {
        isCurrentSemester = currentSemester;
    }

    public List<CourseAcademicDetail> getCourses() {
        return courses;
    }

    public void setCourses(List<CourseAcademicDetail> courses) {
        this.courses = courses;
    }

    public Double getSgpa() {
        return sgpa;
    }

    public void setSgpa(Double sgpa) {
        this.sgpa = sgpa;
    }

    public Integer getTotalCredits() {
        return totalCredits;
    }

    public void setTotalCredits(Integer totalCredits) {
        this.totalCredits = totalCredits;
    }
}
