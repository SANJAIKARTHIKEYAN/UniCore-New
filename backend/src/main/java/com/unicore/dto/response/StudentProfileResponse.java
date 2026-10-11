package com.unicore.dto.response;

public class StudentProfileResponse {
    private String studentId;
    private Integer admissionYear;
    private Integer currentSemester;
    private String derivedYear;

    public StudentProfileResponse() {
    }

    public StudentProfileResponse(String studentId, Integer admissionYear, Integer currentSemester, String derivedYear) {
        this.studentId = studentId;
        this.admissionYear = admissionYear;
        this.currentSemester = currentSemester;
        this.derivedYear = derivedYear;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Integer getAdmissionYear() {
        return admissionYear;
    }

    public void setAdmissionYear(Integer admissionYear) {
        this.admissionYear = admissionYear;
    }

    public Integer getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(Integer currentSemester) {
        this.currentSemester = currentSemester;
    }

    public String getDerivedYear() {
        return derivedYear;
    }

    public void setDerivedYear(String derivedYear) {
        this.derivedYear = derivedYear;
    }
}
