package com.unicore.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "student_id", nullable = false, unique = true)
    private String studentId;

    @Column(name = "admission_year", nullable = false)
    private Integer admissionYear;

    @Column(name = "current_semester", nullable = false)
    private Integer currentSemester;

    public StudentProfile() {
    }

    public StudentProfile(User user, String studentId, Integer admissionYear, Integer currentSemester) {
        this.user = user;
        this.studentId = studentId;
        this.admissionYear = admissionYear;
        this.currentSemester = currentSemester;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    /**
     * Derives academic year from current semester:
     * 1–2 → 1st Year
     * 3–4 → 2nd Year
     * 5–6 → 3rd Year
     */
    @Transient
    public String getDerivedYear() {
        if (this.currentSemester == null) {
            return "Unassigned";
        }
        if (this.currentSemester == 1 || this.currentSemester == 2) {
            return "1st Year";
        } else if (this.currentSemester == 3 || this.currentSemester == 4) {
            return "2nd Year";
        } else if (this.currentSemester == 5 || this.currentSemester == 6) {
            return "3rd Year";
        }
        return "Advanced Year (Sem " + this.currentSemester + ")";
    }
}
