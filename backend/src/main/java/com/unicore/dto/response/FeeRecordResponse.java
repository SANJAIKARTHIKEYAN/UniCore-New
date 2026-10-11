package com.unicore.dto.response;

import com.unicore.entity.FeeStatus;
import java.time.LocalDate;

public class FeeRecordResponse {
    private Long id;
    private String feeType;
    private Integer semester;
    private Integer academicYear;
    private Double amount;
    private Double paidAmount;
    private LocalDate dueDate;
    private FeeStatus status;

    public FeeRecordResponse() {
    }

    public FeeRecordResponse(Long id, String feeType, Integer semester, Integer academicYear,
                             Double amount, Double paidAmount, LocalDate dueDate, FeeStatus status) {
        this.id = id;
        this.feeType = feeType;
        this.semester = semester;
        this.academicYear = academicYear;
        this.amount = amount;
        this.paidAmount = paidAmount;
        this.dueDate = dueDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFeeType() {
        return feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
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

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Double paidAmount) {
        this.paidAmount = paidAmount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public FeeStatus getStatus() {
        return status;
    }

    public void setStatus(FeeStatus status) {
        this.status = status;
    }
}
