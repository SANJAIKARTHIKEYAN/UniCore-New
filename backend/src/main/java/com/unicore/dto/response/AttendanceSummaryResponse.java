package com.unicore.dto.response;

public class AttendanceSummaryResponse {
    private String courseCode;
    private String courseName;
    private Long totalClasses;
    private Long present;
    private Long absent;
    private Long late;
    private Double attendancePercent;

    public AttendanceSummaryResponse() {
    }

    public AttendanceSummaryResponse(String courseCode, String courseName, Long totalClasses,
                                     Long present, Long absent, Long late, Double attendancePercent) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.totalClasses = totalClasses;
        this.present = present;
        this.absent = absent;
        this.late = late;
        this.attendancePercent = attendancePercent;
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

    public Long getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(Long totalClasses) {
        this.totalClasses = totalClasses;
    }

    public Long getPresent() {
        return present;
    }

    public void setPresent(Long present) {
        this.present = present;
    }

    public Long getAbsent() {
        return absent;
    }

    public void setAbsent(Long absent) {
        this.absent = absent;
    }

    public Long getLate() {
        return late;
    }

    public void setLate(Long late) {
        this.late = late;
    }

    public Double getAttendancePercent() {
        return attendancePercent;
    }

    public void setAttendancePercent(Double attendancePercent) {
        this.attendancePercent = attendancePercent;
    }
}
