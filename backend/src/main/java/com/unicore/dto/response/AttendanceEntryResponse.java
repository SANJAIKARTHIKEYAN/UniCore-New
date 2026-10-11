package com.unicore.dto.response;

import com.unicore.entity.AttendanceStatus;

public class AttendanceEntryResponse {

    private Long studentUserId;
    private String studentId;
    private String studentName;
    private AttendanceStatus status;

    public AttendanceEntryResponse() {
    }

    public AttendanceEntryResponse(Long studentUserId, String studentId, String studentName, AttendanceStatus status) {
        this.studentUserId = studentUserId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.status = status;
    }

    public Long getStudentUserId() {
        return studentUserId;
    }

    public void setStudentUserId(Long studentUserId) {
        this.studentUserId = studentUserId;
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

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }
}
