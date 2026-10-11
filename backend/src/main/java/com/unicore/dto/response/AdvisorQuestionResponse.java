package com.unicore.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class AdvisorQuestionResponse {
    private String question;
    private String answer;
    private Double confidence;
    private String intent;
    private List<String> suggestedQuestions;
    private LocalDateTime generatedAt;
    private String source;
    private String fallbackNotice;

    public AdvisorQuestionResponse() {
    }

    public AdvisorQuestionResponse(String question, String answer, Double confidence, String intent,
                                   List<String> suggestedQuestions) {
        this.question = question;
        this.answer = answer;
        this.confidence = confidence;
        this.intent = intent;
        this.suggestedQuestions = suggestedQuestions;
        this.generatedAt = LocalDateTime.now();
        this.source = "UNICORE_ACADEMIC_RULE_ENGINE";
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public List<String> getSuggestedQuestions() { return suggestedQuestions; }
    public void setSuggestedQuestions(List<String> suggestedQuestions) { this.suggestedQuestions = suggestedQuestions; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getFallbackNotice() { return fallbackNotice; }
    public void setFallbackNotice(String fallbackNotice) { this.fallbackNotice = fallbackNotice; }
}
