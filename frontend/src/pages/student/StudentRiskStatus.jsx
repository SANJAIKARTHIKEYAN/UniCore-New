import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentRiskStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRiskStatus();
  }, []);

  const loadRiskStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentRiskStatus();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load risk status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading academic risk standing...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading risk status:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadRiskStatus} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Academic Risk Standing & AI Advisor</h1>
          <p className="student-page-subtitle">Predictive early-warning indicator and retention monitoring framework.</p>
        </div>
        <span className="badge badge-info" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>
          Step 4: Baseline Framework
        </span>
      </div>

      {/* Main Integration Banner */}
      <div className="card risk-main-card">
        <div className="risk-indicator-header">
          <div className="risk-icon-large">🛡️</div>
          <div>
            <h2>Current Academic Standing: Good</h2>
            <p className="risk-status-desc">
              All academic indicators are currently within standard institutional parameters.
            </p>
          </div>
        </div>

        <div className="risk-metrics-row">
          <div className="risk-metric-box">
            <span className="risk-metric-label">Current Attendance Rate</span>
            <span className="risk-metric-value text-success">
              {data?.currentAttendancePercent !== null ? `${data.currentAttendancePercent}%` : 'N/A'}
            </span>
            <span className="risk-metric-status">Threshold: 75.0%</span>
          </div>

          <div className="risk-metric-box">
            <span className="risk-metric-label">Enrolled Semester</span>
            <span className="risk-metric-value">Semester {data?.currentSemester}</span>
            <span className="risk-metric-status">Regular Track</span>
          </div>

          <div className="risk-metric-box">
            <span className="risk-metric-label">Predictive Assessment Status</span>
            <span className="risk-metric-value text-warning">Pending Integration</span>
            <span className="risk-metric-status">AI Advisor Module</span>
          </div>
        </div>

        <div className="risk-notice-box">
          <div className="notice-icon">ℹ️</div>
          <div>
            <strong>AI Advisor Predictive Inference Notice</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {data?.message || 'Risk assessment will be available when AI Advisor is integrated.'} In Step 4, this interface displays structural academic telemetry. Live machine learning risk scoring (Random Forest classifier) and prescriptive intervention alerts will be integrated in subsequent phases.
            </p>
          </div>
        </div>
      </div>

      {/* Telemetry Architecture Overview */}
      <div className="card">
        <h4>ML Telemetry Input Features</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          The machine learning risk pipeline monitors the following multi-factor student telemetry variables:
        </p>

        <div className="telemetry-grid">
          <div className="telemetry-item">
            <span className="telemetry-name">Attendance Rate (%)</span>
            <span className="telemetry-desc">Day-level classroom attendance tracking</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-name">Course Credit Load</span>
            <span className="telemetry-desc">Total registered credit hours per semester</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-name">Continuous Assessment Scores</span>
            <span className="telemetry-desc">Mid-term exams, lab assessments, and assignments</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-name">Fee Settlement Timeliness</span>
            <span className="telemetry-desc">Institutional clearance and payment tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
