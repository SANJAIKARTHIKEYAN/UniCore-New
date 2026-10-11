package com.unicore.dto.response;

import java.util.List;

public class AcademicPerformanceResponse {
    private Integer semester;
    private Integer academicYear;
    private List<CourseAcademicDetail> courses;

    public AcademicPerformanceResponse() {
    }

    public AcademicPerformanceResponse(Integer semester, Integer academicYear, List<CourseAcademicDetail> courses) {
        this.semester = semester;
        this.academicYear = academicYear;
        this.courses = courses;
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

    public List<CourseAcademicDetail> getCourses() {
        return courses;
    }

    public void setCourses(List<CourseAcademicDetail> courses) {
        this.courses = courses;
    }
}
