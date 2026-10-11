package com.unicore.dto.request;

import jakarta.validation.constraints.NotNull;

public class AssignFacultyRequest {

    @NotNull(message = "Faculty ID is required")
    private Long facultyId;

    public AssignFacultyRequest() {
    }

    public AssignFacultyRequest(Long facultyId) {
        this.facultyId = facultyId;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }
}
