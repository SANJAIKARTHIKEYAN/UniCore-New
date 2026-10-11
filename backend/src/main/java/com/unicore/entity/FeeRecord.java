package com.unicore.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "fee_records")
public class FeeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private Integer semester;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;

    @Column(name = "fee_type", nullable = false, length = 100)
    private String feeType;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "paid_amount", nullable = false)
    private Double paidAmount = 0.0;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeeStatus status = FeeStatus.UNPAID;

    public FeeRecord() {
    }

    public FeeRecord(User student, Integer semester, Integer academicYear, String feeType,
                     Double amount, Double paidAmount, LocalDate dueDate, FeeStatus status) {
        this.student = student;
        this.semester = semester;
        this.academicYear = academicYear;
        this.feeType = feeType;
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

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
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

    public String getFeeType() {
        return feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
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
