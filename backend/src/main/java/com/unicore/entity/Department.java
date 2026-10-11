package com.unicore.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_code", nullable = false, unique = true)
    @JsonAlias({"code", "short_code", "shortCode"})
    private String shortCode;

    @Column(name = "head_of_department")
    private String headOfDepartment;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    public Department() {
    }

    public Department(String name, String shortCode, boolean active) {
        this.name = name;
        this.shortCode = shortCode;
        this.active = active;
    }

    public Department(String name, String shortCode, String headOfDepartment, String description, boolean active) {
        this.name = name;
        this.shortCode = shortCode;
        this.headOfDepartment = headOfDepartment;
        this.description = description;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getShortCode() {
        return shortCode;
    }

    public void setShortCode(String shortCode) {
        this.shortCode = shortCode;
    }

    @JsonProperty("code")
    public String getCode() {
        return shortCode;
    }

    @JsonAlias({"code", "short_code", "shortCode"})
    public void setCode(String code) {
        if (code != null && !code.trim().isEmpty() && (this.shortCode == null || this.shortCode.trim().isEmpty())) {
            this.shortCode = code.trim().toUpperCase();
        }
    }

    public String getHeadOfDepartment() {
        return headOfDepartment;
    }

    public void setHeadOfDepartment(String headOfDepartment) {
        this.headOfDepartment = headOfDepartment;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
