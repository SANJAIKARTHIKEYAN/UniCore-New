package com.unicore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class AdvisorQuestionRequest {

    @NotBlank(message = "Question cannot be blank")
    @Size(max = 1000, message = "Question must not exceed 1000 characters")
    private String question;

    private List<ChatMessageDTO> conversationHistory;

    public AdvisorQuestionRequest() {
    }

    public AdvisorQuestionRequest(String question) {
        this.question = question;
    }

    public AdvisorQuestionRequest(String question, List<ChatMessageDTO> conversationHistory) {
        this.question = question;
        this.conversationHistory = conversationHistory;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<ChatMessageDTO> getConversationHistory() { return conversationHistory; }
    public void setConversationHistory(List<ChatMessageDTO> conversationHistory) { this.conversationHistory = conversationHistory; }
}
