import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

const QUICK_PROMPTS = [
  'How is my attendance standing?',
  'Which course should I focus on to improve?',
  'Why was this risk level predicted?',
  'What are my highest priority actions?',
];

export default function StudentAdvisor() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Chat / Q&A state
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showNewResponsePill, setShowNewResponsePill] = useState(false);
  const threadRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadAdvisorData();
  }, []);

  const checkIfNearBottom = () => {
    if (!threadRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = threadRef.current;
    // Consider near bottom if within 110px of bottom
    return scrollHeight - scrollTop - clientHeight <= 110;
  };

  const handleScroll = () => {
    if (!threadRef.current) return;
    const nearBottom = checkIfNearBottom();
    isNearBottomRef.current = nearBottom;
    if (nearBottom && showNewResponsePill) {
      setShowNewResponsePill(false);
    }
  };

  const scrollToBottom = (behavior = 'smooth') => {
    if (threadRef.current) {
      if (typeof threadRef.current.scrollTo === 'function') {
        threadRef.current.scrollTo({
          top: threadRef.current.scrollHeight,
          behavior,
        });
      } else {
        threadRef.current.scrollTop = threadRef.current.scrollHeight || 0;
      }
      setShowNewResponsePill(false);
      isNearBottomRef.current = true;
    }
  };

  const loadAdvisorData = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.getAdvisorOverview();
      setOverview(res);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load academic advisor guidance.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setFeedback(null);
      const res = await api.refreshAdvisor();
      setOverview(res);
      setFeedback({ type: 'success', message: 'Advisor guidance refreshed with latest grades and attendance.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to refresh guidance.' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleAskQuestion = async (qText) => {
    if (asking) return;
    const textToSend = (qText || question).trim();
    if (!textToSend) return;

    // Build session conversation history to send for multi-turn grounding
    const historyPayload = conversation
      .filter((m) => !m.isError && m.text)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

    // Add user message to conversation
    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation((prev) => [...prev, userMsg]);
    setQuestion('');
    setAsking(true);
    setShowNewResponsePill(false);
    isNearBottomRef.current = true;
    setTimeout(() => scrollToBottom('smooth'), 50);

    try {
      const res = await api.askAdvisor(textToSend, historyPayload);
      const advisorMsg = {
        sender: 'advisor',
        text: res.answer,
        intent: res.intent,
        source: res.source,
        fallbackNotice: res.fallbackNotice,
        suggestedQuestions: res.suggestedQuestions || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversation((prev) => [...prev, advisorMsg]);

      // Only scroll down if user was already reading at the bottom
      setTimeout(() => {
        if (isNearBottomRef.current) {
          scrollToBottom('smooth');
        } else {
          setShowNewResponsePill(true);
        }
      }, 60);
    } catch (err) {
      const errorMsg = {
        sender: 'advisor',
        text: 'Sorry, I encountered an issue retrieving that academic metric: ' + (err.message || 'Server error'),
        isError: true,
        failedQuestion: textToSend,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversation((prev) => [...prev, errorMsg]);

      setTimeout(() => {
        if (isNearBottomRef.current) {
          scrollToBottom('smooth');
        } else {
          setShowNewResponsePill(true);
        }
      }, 60);
    } finally {
      setAsking(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleClearChat = () => {
    setConversation([]);
    setQuestion('');
    setShowNewResponsePill(false);
    isNearBottomRef.current = true;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'HIGH') return 'badge-priority-high';
    if (priority === 'MEDIUM') return 'badge-priority-medium';
    return 'badge-priority-low';
  };

  return (
    <div className="student-page">
      {/* Sci-Fi Central Hero Header */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '1.75rem 1.5rem',
          marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.28)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 0 10px rgba(0,242,254,0.6))' }}>🤖</span>
          <h1
            className="student-page-title"
            style={{
              margin: 0,
              fontSize: '1.9rem',
              color: '#ffffff',
              textShadow: '0 0 18px rgba(0,242,254,0.6)',
              letterSpacing: '0.03em',
              fontWeight: 800,
            }}
          >
            UniCore AI Academic Advisor
          </h1>
        </div>
        <p style={{ margin: '0 0 1.15rem', fontSize: '1rem', color: '#cbd5e1', fontWeight: 500 }}>
          Grounded conversational advisory powered by official university telemetry & Google Gemini
        </p>

        {/* Quick Suggested Prompt Chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-chip"
              onClick={() => handleAskQuestion(prompt)}
              disabled={asking}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible`} role="alert">
          <span>{feedback.message}</span>
          <button type="button" className="alert-close-btn" onClick={() => setFeedback(null)}>
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing course evaluations and attendance records...</p>
        </div>
      ) : (
        <>
          {/* Active Conversational Chatbox Card */}
          <div
            className="card advisor-chat-container"
            style={{
              marginBottom: '1.5rem',
            }}
          >
            {/* 1. Fixed Chat Header */}
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.35rem' }}>💬</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 700 }}>
                    Active Discussion Thread
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 500 }}>
                    Authoritative University Data Source • Session Grounding
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {conversation.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleClearChat}
                    disabled={asking}
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.3rem 0.75rem',
                      color: '#cbd5e1',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                    }}
                    title="Clear current session chat history"
                  >
                    🗑️ Clear Chat
                  </button>
                )}
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                  }}
                >
                  {conversation.length} {conversation.length === 1 ? 'Message' : 'Messages'}
                </span>
              </div>
            </div>

            {/* 2. Scrollable Conversation Thread Area */}
            <div
              ref={threadRef}
              onScroll={handleScroll}
              className="conversation-thread"
            >
              {conversation.length === 0 ? (
                <div className="chat-welcome-placeholder">
                  <span style={{ fontSize: '2.8rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 0 14px rgba(0,242,254,0.5))' }}>
                    🤖
                  </span>
                  <h4 style={{ margin: '0 0 0.45rem', color: '#ffffff', fontSize: '1.15rem', fontWeight: 700 }}>
                    Ask your AI Advisor anything...
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.92rem', maxWidth: '540px', color: '#cbd5e1', lineHeight: 1.6 }}>
                    I can answer questions regarding your overall attendance standing, course-level metrics, assessment performance, ML risk factors, or practical academic improvement actions. Select one of the quick prompts above or type your question below.
                  </p>
                </div>
              ) : (
                conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-message ${msg.sender === 'user' ? 'msg-user' : 'msg-advisor'}`}
                  >
                    <div
                      className="msg-avatar"
                      style={{
                        background: msg.sender === 'user'
                          ? 'linear-gradient(135deg, #4f46e5, #06b6d4)'
                          : 'linear-gradient(135deg, #0f172a, #1e293b)',
                        border: `1px solid ${msg.sender === 'user' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(56, 189, 248, 0.45)'}`,
                        color: msg.sender === 'user' ? '#ffffff' : '#38bdf8',
                      }}
                    >
                      {msg.sender === 'user' ? '👤' : '🤖'}
                    </div>

                    <div
                      className="msg-bubble"
                      style={{
                        background: msg.sender === 'user'
                          ? undefined // Defined via .msg-user .msg-bubble in CSS
                          : msg.isError
                          ? 'rgba(127, 29, 29, 0.45)'
                          : '#1e293b',
                        border: `1px solid ${
                          msg.sender === 'user'
                            ? 'rgba(129, 140, 248, 0.45)'
                            : msg.isError
                            ? 'rgba(248, 113, 113, 0.5)'
                            : 'rgba(148, 163, 184, 0.28)'
                        }`,
                        color: msg.isError ? '#fecaca' : '#f8fafc',
                      }}
                    >
                      {/* Fallback Notice Banner if applicable */}
                      {msg.fallbackNotice && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: '#fde68a',
                            background: 'rgba(245, 158, 11, 0.16)',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            borderRadius: '8px',
                            padding: '0.35rem 0.65rem',
                            marginBottom: '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontWeight: 600,
                          }}
                        >
                          <span>ℹ️</span> {msg.fallbackNotice}
                        </div>
                      )}

                      <div className="msg-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </div>

                      {/* Retry button for failed messages */}
                      {msg.isError && msg.failedQuestion && (
                        <div style={{ marginTop: '0.65rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAskQuestion(msg.failedQuestion)}
                            disabled={asking}
                            style={{
                              fontSize: '0.76rem',
                              padding: '0.25rem 0.65rem',
                              background: 'rgba(239, 68, 68, 0.25)',
                              color: '#fee2e2',
                              border: '1px solid rgba(248, 113, 113, 0.5)',
                            }}
                          >
                            🔄 Retry Question
                          </button>
                        </div>
                      )}

                      {/* Suggested follow-up questions from AI */}
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="msg-followups">
                          <span style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, display: 'block', width: '100%', marginBottom: '0.2rem' }}>
                            Follow-up suggestions:
                          </span>
                          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                            {msg.suggestedQuestions.map((sq, sqIdx) => (
                              <button
                                key={sqIdx}
                                type="button"
                                className="prompt-chip prompt-chip-sm"
                                onClick={() => handleAskQuestion(sq)}
                                disabled={asking}
                              >
                                {sq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer: Source + Timestamp */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '0.55rem',
                          gap: '0.75rem',
                          fontSize: '0.72rem',
                        }}
                      >
                        {msg.source ? (
                          <span
                            style={{
                              color: msg.source.includes('GEMINI') ? '#38bdf8' : '#34d399',
                              fontWeight: 700,
                              letterSpacing: '0.02em',
                              textShadow: '0 0 8px rgba(56, 189, 248, 0.35)',
                            }}
                          >
                            {msg.source.includes('GEMINI') ? '✨ Gemini AI Advisor' : '⚡ UniCore Engine'}
                          </span>
                        ) : (
                          <span />
                        )}
                        <div className="msg-time">{msg.time}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Typing / Loading indicator bubble */}
              {asking && (
                <div className="chat-message msg-advisor">
                  <div
                    className="msg-avatar"
                    style={{
                      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                      border: '1px solid rgba(56, 189, 248, 0.45)',
                      color: '#38bdf8',
                    }}
                  >
                    🤖
                  </div>
                  <div className="msg-bubble thinking-bubble">
                    <span style={{ fontSize: '0.84rem', color: '#cbd5e1', marginRight: '0.35rem', fontWeight: 500 }}>
                      Analyzing academic telemetry...
                    </span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Floating New Response Pill Button */}
            {showNewResponsePill && (
              <button
                type="button"
                className="new-response-pill"
                onClick={() => scrollToBottom('smooth')}
                title="Scroll down to newest response"
              >
                <span>↓ New response</span>
              </button>
            )}

            {/* 3. Fixed Chat Composer Area */}
            <div className="chat-composer-area">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskQuestion();
                }}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-end',
                }}
              >
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    ref={textareaRef}
                    className="form-input chat-input-textarea"
                    placeholder="Ask your AI Advisor anything... (Press Enter to send, Shift+Enter for new line)"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value.slice(0, 1000))}
                    onKeyDown={handleKeyDown}
                    disabled={asking}
                    rows={2}
                    maxLength={1000}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 1.6rem',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      bottom: '0.45rem',
                      fontSize: '0.72rem',
                      color: question.length > 900 ? '#f87171' : '#94a3b8',
                      fontWeight: 600,
                      pointerEvents: 'none',
                    }}
                  >
                    {question.length}/1000
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={asking || !question.trim()}
                  style={{
                    height: '56px',
                    padding: '0 1.5rem',
                    fontSize: '0.94rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    flexShrink: 0,
                    background: asking || !question.trim()
                      ? 'rgba(79, 70, 229, 0.35)'
                      : 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: asking || !question.trim()
                      ? 'none'
                      : '0 4px 16px rgba(6, 182, 212, 0.35)',
                    cursor: asking || !question.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {asking ? (
                    <span>...</span>
                  ) : (
                    <>
                      <span>Send</span>
                      <span style={{ fontSize: '1.05rem' }}>→</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Academic Summary Card (Authoritative Data Source) */}
          {overview && (
            <div
              className="card"
              style={{
                marginBottom: '1.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(10, 18, 36, 0.65)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9' }}>Your Academic Summary</h3>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                  style={{ fontSize: '0.76rem', padding: '0.3rem 0.75rem' }}
                >
                  {refreshing ? 'Evaluating...' : '🔄 Refresh Guidance'}
                </button>
              </div>

              {/* 2 Chamfered metric boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="hud-hex-card hud-hex-cyan" style={{ padding: '1rem' }}>
                  <div className="hud-hex-label">Attendance</div>
                  <div
                    className="hud-hex-value"
                    style={{
                      color: (overview.overallAttendancePercent ?? 0) >= 75 ? 'var(--cyber-cyan)' : 'var(--cyber-crimson)',
                    }}
                  >
                    {(overview.overallAttendancePercent ?? 0).toFixed(1)}%
                  </div>
                  <div className="hud-hex-subtext" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {(overview.overallAttendancePercent ?? 0) >= 75 ? 'Optimal Standing' : 'Below 75% Cutoff'}
                  </div>
                </div>

                <div
                  className={`hud-hex-card ${
                    overview.riskCategory === 'High Risk'
                      ? 'hud-hex-crimson'
                      : overview.riskCategory === 'Medium Risk'
                      ? 'hud-hex-amber'
                      : 'hud-hex-emerald'
                  }`}
                  style={{ padding: '1rem' }}
                >
                  <div className="hud-hex-label">Current Risk</div>
                  <div className="hud-hex-value" style={{ fontSize: '1.35rem' }}>
                    {overview.riskCategory || 'Medium Risk'}
                  </div>
                  <div className="hud-hex-subtext">
                    Confidence: {Math.round((overview.riskConfidence || 0.75) * 100)}%
                  </div>
                </div>
              </div>

              {/* Suggested Focus list */}
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Suggested Focus Areas:
                </span>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <li>Attendance buffer: Maintain classes above 75% threshold across all enrolled courses.</li>
                  <li>Targeted focus on upcoming midterms and laboratory quizzes.</li>
                  <li>Consistent assignment submissions for grade stability.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Detailed Recommendations List */}
          {overview?.recommendations && overview.recommendations.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 className="section-subheading" style={{ fontSize: '1.1rem', margin: 0 }}>
                  📋 Personalized Guidance Items
                </h2>
                {overview.summaryHeadline && (
                  <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                    {overview.summaryHeadline}
                  </span>
                )}
              </div>

              <div className="advisor-recs-grid">
                {overview.recommendations.map((rec, idx) => (
                  <div
                    key={rec.id || `${rec.priority}-${rec.title}-${idx}`}
                    className={`card advisor-rec-card rec-${(rec.priority || 'low').toLowerCase()}`}
                  >
                    <div className="rec-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${getPriorityBadgeClass(rec.priority)}`}>
                          {rec.priority} PRIORITY
                        </span>
                        {rec.category && (
                          <span className="badge badge-secondary">{rec.category}</span>
                        )}
                      </div>
                      {(rec.metricTag || rec.supportingMetric) && (
                        <span className="rec-metric-tag">{rec.metricTag || rec.supportingMetric}</span>
                      )}
                    </div>

                    <h3 className="rec-title">{rec.title}</h3>
                    <p className="rec-explanation">{rec.advice || rec.explanation}</p>

                    {(rec.actionItem || rec.suggestedAction) && (
                      <div className="rec-action-callout">
                        <span className="rec-action-icon">🎯</span>
                        <div>
                          <strong>Recommended Action:</strong> {rec.actionItem || rec.suggestedAction}
                        </div>
                      </div>
                    )}

                    {rec.rationale && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                        <em>Data Rationale: {rec.rationale}</em>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
