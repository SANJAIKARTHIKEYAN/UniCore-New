import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CyberWaveChart from '../../components/common/CyberWaveChart';

export default function StudentDashboard({ onNavigate, currentUser }) {
  const [data, setData] = useState(null);
  const [mlRisk, setMlRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, riskRes] = await Promise.all([
        api.getStudentDashboard(),
        api.getMyRisk().catch((err) => {
          console.warn('ML risk prediction fetch failed:', err);
          return null;
        }),
      ]);
      setData(res);
      setMlRisk(riskRes);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1.5rem', borderRadius: 'var(--radius-3xl)', margin: '1.5rem auto', maxWidth: '800px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 91, 255, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.25rem' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>Loading academic telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ maxWidth: '800px', margin: '1.5rem auto' }}>
        <p><strong>Error loading dashboard:</strong> {error}</p>
        <button className="btn btn-secondary btn-sm" onClick={loadDashboard} style={{ marginTop: '0.75rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const studentName = data?.studentName || currentUser?.name || 'Sanjai Karthikeyan';
  const studentId = data?.studentId || currentUser?.studentProfile?.studentId || 'BCA-STU-001';
  const department = data?.department || currentUser?.department || 'BCA';
  const semester = data?.semester || currentUser?.studentProfile?.currentSemester || 2;
  const derivedYear = data?.derivedYear || '1st Year';
  const attendancePercent = data?.overallAttendancePercent ?? 88.5;
  const enrolledCount = data?.enrolledCoursesCount || 4;

  // Circular progress ring calculation (r = 21, circum = 2 * PI * 21 ~ 131.95)
  const ringCircumference = 131.95;
  const ringOffset = ringCircumference - (Math.min(100, Math.max(0, attendancePercent)) / 100) * ringCircumference;

  // Dynamic wave trend data mapped to attendance & midterm scores
  const midtermScore = mlRisk?.features?.['Midterm_Score'] ?? 82.0;
  const performanceTrend = [
    { label: 'Week 1', value: 70 },
    { label: 'Week 4', value: 78 },
    { label: 'Week 8', value: 84 },
    { label: 'Week 11', value: Math.round(attendancePercent) },
    { label: 'Week 14', value: Math.round(midtermScore) },
    { label: 'Week 16', value: 92 },
  ];

  const handleAskAdvisor = (e) => {
    if (e) e.preventDefault();
    onNavigate('advisor');
  };

  return (
    <div className="student-dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. HERO BANNER: Luminous Glass Panel */}
      <section className="glass-panel glass-glow-subtle hero-glass-banner">
        {/* Subtle decorative glowing flares */}
        <div
          style={{
            position: 'absolute',
            top: '-5rem',
            right: '-4rem',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 91, 255, 0.15) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ maxWidth: '820px' }}>
            {/* Badges Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span className="badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                Spring Term Active • Attendance Synchronized
              </span>
              <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                Roll: {studentId}
              </span>
              <span className="badge" style={{ background: '#f8fafc', color: '#475467', border: '1px solid #e2e8f0' }}>
                Semester 0{semester}
              </span>
            </div>

            <h1
              className="student-page-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.85rem',
                fontWeight: 800,
                color: 'var(--on-surface)',
                letterSpacing: '-0.03em',
                lineHeight: 1.12,
                marginBottom: '0.45rem',
              }}
            >
              Welcome back, {studentName}!
            </h1>
            <p style={{ fontSize: '1.025rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
              Bachelor of Computer Applications ({department}) &bull; Semester <strong>{semester}</strong> ({derivedYear}) &bull; Roll No: <strong>{studentId}</strong>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ background: '#ffffff', borderRadius: '1rem', padding: '0.65rem 1.1rem', fontSize: '0.85rem' }}
              onClick={() => onNavigate('fees')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>
                receipt_long
              </span>
              <span>View Fee Receipt</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ background: '#ffffff', borderRadius: '1rem', padding: '0.65rem 1.1rem', fontSize: '0.85rem' }}
              onClick={() => onNavigate('documents')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                download
              </span>
              <span>Download Hall Ticket</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              style={{ borderRadius: '1rem', padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
              onClick={() => onNavigate('advisor')}
            >
              <span>🤖 Consult AI Advisor &rarr;</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. CAMPUS BULLETIN NOTICE (High Priority Milestone) */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(135deg, #b1006a, #8c0053, #493ee5)',
          color: '#ffffff',
          padding: '1.25rem 1.75rem',
          boxShadow: '0 10px 30px rgba(177, 0, 106, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#ffffff' }}>
              campaign
            </span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255, 255, 255, 0.25)', padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>
                Campus Milestone
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
                Closing in 4 days
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
              Annual Innovation Hackathon 2026 Registration Open &bull; $15,000 Grand Prize Pool
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', zIndex: 1 }}>
          <button
            type="button"
            className="btn"
            style={{ background: '#ffffff', color: 'var(--tertiary)', fontWeight: 700, padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '10px' }}
            onClick={() => onNavigate('notifications')}
          >
            View Event Details
          </button>
        </div>
      </div>

      {/* 3. PROMINENT 4-COLUMN TELEMETRY METRIC CARDS */}
      <section className="telemetry-grid">
        {/* Card 1: Attendance Standing with SVG circular ring */}
        <div
          className="telemetry-card glass-glow-subtle"
          onClick={() => onNavigate('attendance')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Attendance Standing
              </span>
              <div style={{ marginTop: '0.35rem' }}>
                <span className="badge" style={{ background: attendancePercent >= 75 ? '#ecfdf5' : '#fef2f2', color: attendancePercent >= 75 ? '#047857' : '#b91c1c', border: attendancePercent >= 75 ? '1px solid #a7f3d0' : '1px solid #fecaca' }}>
                  {attendancePercent >= 75 ? 'Optimal Standing' : 'Requires Attention'}
                </span>
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #a7f3d0',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                fact_check
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.25rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.1rem', fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1 }}>
                {attendancePercent}<span style={{ fontSize: '1.75rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>142 Present</span>
                <span>&bull;</span>
                <span>18 Absent</span>
              </div>
            </div>

            {/* SVG Circular Progress Ring */}
            <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '64px', height: '64px', transform: 'rotate(-90deg)' }} viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="21" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                <circle
                  cx="26"
                  cy="26"
                  r="21"
                  fill="none"
                  stroke={attendancePercent >= 75 ? '#10b981' : '#ef4444'}
                  strokeWidth="5"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="material-symbols-outlined"
                style={{ position: 'absolute', fontSize: '22px', color: attendancePercent >= 75 ? '#10b981' : '#ef4444' }}
              >
                verified
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Academic Trajectory */}
        <div
          className="telemetry-card glass-glow-subtle"
          onClick={() => onNavigate('academic')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Academic Trajectory
              </span>
              <div style={{ marginTop: '0.35rem' }}>
                <span className="badge" style={{ background: '#f5f3ff', color: 'var(--primary)', border: '1px solid #ddd6fe' }}>
                  Tier 1 Standing
                </span>
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#f5f3ff',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ddd6fe',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                insights
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.35rem', fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1.1 }}>
              Optimal Pace
            </div>
            <div style={{ width: '100%', height: '10px', borderRadius: '9999px', background: '#f1f5f9', border: '1px solid #e2e8f0', overflow: 'hidden', marginTop: '0.75rem' }}>
              <div style={{ width: '38%', height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg, #493ee5, #635bff)' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span>42 Credits Completed</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>120 Total Req.</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Modules */}
        <div
          className="telemetry-card glass-glow-subtle"
          onClick={() => onNavigate('academic')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Enrolled Courses
              </span>
              <div style={{ marginTop: '0.35rem' }}>
                <span className="badge" style={{ background: '#eff6ff', color: 'var(--secondary-container)', border: '1px solid #bfdbfe' }}>
                  Sem 0{semester} Current
                </span>
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                menu_book
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.1rem', fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1 }}>
                {enrolledCount}
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Active Courses
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.65rem', color: 'var(--secondary)', fontSize: '0.825rem', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                schedule
              </span>
              <span>22 Contact Hrs / Week</span>
            </div>
          </div>
        </div>

        {/* Card 4: ML Early Warning & Risk Status */}
        <div
          className="telemetry-card glass-glow-subtle"
          onClick={() => onNavigate('advisor')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Risk Status (ML)
              </span>
              <div style={{ marginTop: '0.35rem' }}>
                <span
                  className="badge"
                  style={{
                    background: mlRisk?.riskCategory === 'High Risk' ? '#fef2f2' : mlRisk?.riskCategory === 'Medium Risk' ? '#fffbeb' : '#ecfdf5',
                    color: mlRisk?.riskCategory === 'High Risk' ? '#b91c1c' : mlRisk?.riskCategory === 'Medium Risk' ? '#b45309' : '#047857',
                    border: mlRisk?.riskCategory === 'High Risk' ? '1px solid #fecaca' : mlRisk?.riskCategory === 'Medium Risk' ? '1px solid #fde68a' : '1px solid #a7f3d0',
                  }}
                >
                  {mlRisk?.riskCategory || 'Low Risk'}
                </span>
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: mlRisk?.riskCategory === 'High Risk' ? '#fef2f2' : '#f5f3ff',
                color: mlRisk?.riskCategory === 'High Risk' ? '#dc2626' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: mlRisk?.riskCategory === 'High Risk' ? '1px solid #fecaca' : '1px solid #ddd6fe',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                smart_toy
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 800,
                color: mlRisk?.riskCategory === 'High Risk' ? '#dc2626' : 'var(--on-surface)',
                lineHeight: 1.15,
              }}
            >
              {mlRisk ? `${mlRisk.riskCategory} (${Math.round(mlRisk.confidence * 100)}% Confidence)` : 'Low Risk (92% Confidence)'}
            </div>
            <div style={{ marginTop: '0.65rem', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, fontWeight: 500 }}>
              {mlRisk?.recommendation || 'Student is demonstrating healthy academic progress. Continue standard course engagement.'}
            </div>
          </div>
        </div>
      </section>

      {/* 4. CENTRAL WORK AREA: Spacious 68% / 32% Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Performance Trajectory Chart & Registered Course Modules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Academic Trajectory Chart */}
          <section className="glass-panel glass-glow-subtle" style={{ borderRadius: 'var(--radius-3xl)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px rgba(99, 91, 255, 0.5)' }}></span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--on-surface)', margin: 0 }}>
                    Academic Performance Trajectory
                  </h2>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Continuous evaluation curve across terms & midterm examinations
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge" style={{ background: '#f8fafc', color: 'var(--on-surface)', border: '1px solid #e2e8f0' }}>
                  Current: <strong>{attendancePercent}%</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('academic')}
                  style={{ borderRadius: '8px' }}
                >
                  View Full Breakdown &rarr;
                </button>
              </div>
            </div>

            {/* Sweeping Luminous Area SVG Spline Chart */}
            <div style={{ marginTop: '1.25rem' }}>
              <CyberWaveChart data={performanceTrend} height={240} />
            </div>

            {/* Legend Footer */}
            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: '#f8f9fd',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                  <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{studentName} ({attendancePercent}%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '12px', height: '2px', background: 'var(--secondary)' }}></span>
                  <span>Cohort Target (81.0%)</span>
                </div>
              </div>

              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={() => onNavigate('results')}
              >
                <span>Semester Results</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  chevron_right
                </span>
              </button>
            </div>
          </section>

          {/* Registered Modules • Sem Current */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--on-surface)', margin: 0 }}>
                  Registered Modules &bull; Sem 0{semester}
                </h3>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Course requirements, instructor allocations, and current attendance standing
                </p>
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                onClick={() => onNavigate('academic')}
              >
                View All Courses &rarr;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* Course 1 */}
              <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge" style={{ background: '#f5f3ff', color: 'var(--primary)', border: '1px solid #ddd6fe' }}>BCA201</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>4 Credits</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--on-surface)', margin: '0.75rem 0 0.25rem' }}>
                    Data Structures &amp; Algorithms
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Prof. Sarah Jenkins &bull; CS Lab 2
                  </p>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Attendance</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>92% (Optimal)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: '92%', height: '100%', borderRadius: '9999px', background: '#10b981' }}></div>
                  </div>
                </div>
              </div>

              {/* Course 2 */}
              <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge" style={{ background: '#eff6ff', color: 'var(--secondary)', border: '1px solid #bfdbfe' }}>BCA202</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>4 Credits</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--on-surface)', margin: '0.75rem 0 0.25rem' }}>
                    Database Management Systems
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Dr. Marcus Vance &bull; Lecture Hall 4
                  </p>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Attendance</span>
                    <span style={{ color: 'var(--secondary)' }}>86%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: '86%', height: '100%', borderRadius: '9999px', background: 'var(--secondary)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Today's Class Schedule Timeline */}
          <section className="glass-panel glass-glow-subtle" style={{ borderRadius: 'var(--radius-3xl)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
                  event_available
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--on-surface)', margin: 0 }}>
                  Today's Live Class Schedule
                </h3>
              </div>
              <span className="badge" style={{ background: '#f8fafc', color: 'var(--text-secondary)', border: '1px solid #e2e8f0' }}>
                Wednesday &bull; 3 Sessions
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Concluded */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-xl)', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '56px', textAlign: 'center', padding: '0.25rem', background: '#f1f5f9', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>09:00</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--on-surface)' }}>AM</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>Algorithms &amp; Complexity Lecture</h5>
                    <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>Concluded</span>
                  </div>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Room 304 &bull; Attended &amp; Logged</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: 'var(--accent-emerald)', fontSize: '22px' }}>
                  check_circle
                </span>
              </div>

              {/* Live Now */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, rgba(226, 223, 255, 0.4), #ffffff)', border: '1px solid rgba(99, 91, 255, 0.3)' }}>
                <div style={{ width: '56px', textAlign: 'center', padding: '0.25rem', background: 'linear-gradient(135deg, #493ee5, #635bff)', borderRadius: '8px', color: '#ffffff' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, display: 'block' }}>11:30</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>AM</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>Database Systems Interactive Lab</h5>
                    <span className="badge" style={{ background: 'var(--primary)', color: '#ffffff' }}>Live Now</span>
                  </div>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>Computer Center 02 &bull; Terminal 18 Assigned</p>
                </div>
                <button
                  type="button"
                  className={checkedIn ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm"}
                  style={{ borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setCheckedIn(true)}
                  disabled={checkedIn}
                >
                  {checkedIn ? '✓ Checked In' : 'Mark Check-in'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: AI Copilot, Submissions Pipeline & Digital Student ID Pass */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Academic Copilot AI Card (Gemini 1.5) */}
          <section className="glass-panel glass-glow-subtle" style={{ borderRadius: 'var(--radius-3xl)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7c3aed, #493ee5)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    smart_toy
                  </span>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--on-surface)', margin: 0 }}>
                    Academic Copilot
                  </h4>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Powered by Google Gemini 1.5</span>
                </div>
              </div>
              <span className="badge" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(224, 36, 138, 0.15))', color: '#7c3aed' }}>
                Pro
              </span>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fd', borderRadius: 'var(--radius-xl)', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--on-surface)', lineHeight: 1.5 }}>
                "{studentName}, your Mid-Term DBMS score of <strong>{Math.round(midtermScore)}%</strong> qualifies you for advanced tracks. Would you like to review elective projections or study plans?"
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  style={{ background: '#ffffff', border: '1px solid rgba(99, 91, 255, 0.3)', color: 'var(--primary)', padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => onNavigate('advisor')}
                >
                  Plan Semester 3 Electives
                </button>
                <button
                  type="button"
                  style={{ background: '#ffffff', border: '1px solid rgba(13, 80, 213, 0.3)', color: 'var(--secondary)', padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => onNavigate('advisor')}
                >
                  Review Attendance Buffer
                </button>
              </div>
            </div>

            {/* AI Advisor direct query launcher */}
            <form onSubmit={handleAskAdvisor} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ask AI Advisor anything..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                style={{ height: '2.75rem', fontSize: '0.825rem', borderRadius: '12px' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '42px', height: '42px', minWidth: '42px', padding: 0, borderRadius: '12px' }}
                title="Send query to AI Advisor"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  send
                </span>
              </button>
            </form>
          </section>

          {/* Submissions Pipeline */}
          <section className="glass-panel" style={{ borderRadius: 'var(--radius-3xl)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--on-surface)', margin: 0 }}>
                Submissions Pipeline
              </h4>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => onNavigate('academic')}
              >
                View All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: 'var(--radius-xl)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-rose)' }}>Due in 2 days</span>
                  <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>BCA202</span>
                </div>
                <h5 style={{ margin: '0.35rem 0 0.15rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                  Normalized Schema Design: E-Commerce
                </h5>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>ERD Diagram &bull; SQL Scripts (DDL/DML)</p>
              </div>

              <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: 'var(--radius-xl)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary)' }}>Due in 6 days</span>
                  <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>BCA201</span>
                </div>
                <h5 style={{ margin: '0.35rem 0 0.15rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                  Binary Search Tree &amp; Graph Traversals
                </h5>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Java Implementation &bull; Complexity Analysis</p>
              </div>
            </div>
          </section>

          {/* Digital Student ID Pass ("UniCore Pass") */}
          <div
            style={{
              borderRadius: 'var(--radius-3xl)',
              background: 'linear-gradient(135deg, #493ee5, #635bff, #0d50d5)',
              color: '#ffffff',
              padding: '1.5rem',
              boxShadow: '0 15px 35px rgba(73, 62, 229, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '190px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              cursor: 'pointer',
            }}
            onClick={() => onNavigate('documents')}
            title="Click to view digital student documents"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  contactless
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  UniCore Pass
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontFamily: 'monospace', fontWeight: 700 }}>
                {studentId}
              </span>
            </div>

            <div style={{ zIndex: 1, marginTop: 'auto' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {studentName}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.85 }}>
                <span>Valid Thru: 06/2028</span>
                <span style={{ fontFamily: 'monospace' }}>SECURE RFID ENABLED</span>
              </div>
            </div>

            {/* Decorative background glass orb */}
            <div style={{ position: 'absolute', right: '-2rem', bottom: '-2rem', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', filter: 'blur(20px)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
