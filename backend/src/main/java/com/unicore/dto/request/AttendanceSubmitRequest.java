package com.unicore.dto.request;

import com.unicore.entity.AttendanceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class AttendanceSubmitRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotEmpty(message = "Attendance entries are required")
    @Valid
    private List<AttendanceEntry> entries;

    public AttendanceSubmitRequest() {
    }

    public AttendanceSubmitRequest(LocalDate date, List<AttendanceEntry> entries) {
        this.date = date;
        this.entries = entries;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<AttendanceEntry> getEntries() {
        return entries;
    }

    public void setEntries(List<AttendanceEntry> entries) {
        this.entries = entries;
    }

    public static class AttendanceEntry {

        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Attendance status is required")
        private AttendanceStatus status;

        public AttendanceEntry() {
        }

        public AttendanceEntry(Long studentId, AttendanceStatus status) {
            this.studentId = studentId;
            this.status = status;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public AttendanceStatus getStatus() {
            return status;
        }

        public void setStatus(AttendanceStatus status) {
            this.status = status;
        }
    }
}
