package com.unicore.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class MarkEntryRequest {

    @NotEmpty(message = "Mark entries cannot be empty.")
    @Valid
    @JsonAlias({"marks", "entries"})
    private List<MarkEntry> entries;

    public MarkEntryRequest() {
    }

    public MarkEntryRequest(List<MarkEntry> entries) {
        this.entries = entries;
    }

    public List<MarkEntry> getEntries() { return entries; }
    public void setEntries(List<MarkEntry> entries) { this.entries = entries; }

    @JsonProperty("marks")
    public void setMarks(List<MarkEntry> marks) {
        this.entries = marks;
    }

    public static class MarkEntry {

        @JsonAlias({"studentUserId", "userId"})
        private Long studentUserId;

        private Long studentId;

        @JsonAlias({"rollNo", "rollNumber", "regNumber", "studentRegistrationNumber"})
        private String studentRegistrationNumber;

        /**
         * Nullable — null means "not yet graded" (clears the mark).
         */
        private Double marksObtained;

        public MarkEntry() {
        }

        public MarkEntry(Long studentId, Double marksObtained) {
            this.studentId = studentId;
            this.studentUserId = studentId;
            this.marksObtained = marksObtained;
        }

        public Long getStudentId() {
            if (studentId != null) return studentId;
            return studentUserId;
        }

        public void setStudentId(Object val) {
            if (val instanceof Number) {
                this.studentId = ((Number) val).longValue();
                this.studentUserId = this.studentId;
            } else if (val instanceof String str) {
                try {
                    this.studentId = Long.parseLong(str.trim());
                    this.studentUserId = this.studentId;
                } catch (NumberFormatException e) {
                    this.studentRegistrationNumber = str.trim();
                }
            }
        }

        public Long getStudentUserId() { return studentUserId != null ? studentUserId : studentId; }
        public void setStudentUserId(Long studentUserId) {
            this.studentUserId = studentUserId;
            if (this.studentId == null) this.studentId = studentUserId;
        }

        public String getStudentRegistrationNumber() { return studentRegistrationNumber; }
        public void setStudentRegistrationNumber(String studentRegistrationNumber) {
            this.studentRegistrationNumber = studentRegistrationNumber;
        }

        public Double getMarksObtained() { return marksObtained; }
        public void setMarksObtained(Double marksObtained) { this.marksObtained = marksObtained; }
    }
}
