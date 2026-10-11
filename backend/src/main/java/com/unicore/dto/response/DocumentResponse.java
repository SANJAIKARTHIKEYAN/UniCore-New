package com.unicore.dto.response;

import com.unicore.entity.DocumentStatus;
import java.time.LocalDate;

public class DocumentResponse {
    private Long id;
    private String documentType;
    private String title;
    private String description;
    private Integer semester;
    private LocalDate issuedDate;
    private DocumentStatus status;

    public DocumentResponse() {
    }

    public DocumentResponse(Long id, String documentType, String title, String description,
                            Integer semester, LocalDate issuedDate, DocumentStatus status) {
        this.id = id;
        this.documentType = documentType;
        this.title = title;
        this.description = description;
        this.semester = semester;
        this.issuedDate = issuedDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public LocalDate getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDate issuedDate) {
        this.issuedDate = issuedDate;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public void setStatus(DocumentStatus status) {
        this.status = status;
    }
}
