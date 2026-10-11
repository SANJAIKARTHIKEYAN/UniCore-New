package com.unicore.dto.response;

import com.unicore.entity.NotificationType;
import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isExpired = false;
    private Boolean isActive = true;

    public NotificationResponse() {
    }

    public NotificationResponse(Long id, String title, String message, NotificationType type,
                                LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public NotificationResponse(Long id, String title, String message, NotificationType type,
                                LocalDateTime createdAt, LocalDateTime expiresAt,
                                Boolean isExpired, Boolean isActive) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.isExpired = isExpired;
        this.isActive = isActive;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getIsExpired() {
        return isExpired;
    }

    public void setIsExpired(Boolean isExpired) {
        this.isExpired = isExpired;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
