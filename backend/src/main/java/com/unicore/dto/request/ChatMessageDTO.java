package com.unicore.dto.request;

public class ChatMessageDTO {
    private String role; // "user" or "model" / "assistant" / "advisor"
    private String content; // message text

    public ChatMessageDTO() {
    }

    public ChatMessageDTO(String role, String content) {
        this.role = role;
        this.content = content;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
