import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function FacultyRiskOverview({
  selectedCourseId,
  onSelectCourse,
  onBack,
  onNavigate,
  previousTab,
}) {
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(selectedCourseId || '');
  const [riskCategoryFilter, setRiskCategoryFilter] = useState('ALL');
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [assessmentNote, setAssessmentNote] = useState('');

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    if (typeof onNavigate === 'function') {
      const target = (previousTab && previousTab !== 'risk') ? previousTab : 'dashboard';
      onNavigate(target);
      return;
    }
    window.dispatchEvent(
      new CustomEvent('unicore:faculty-navigate', {
        detail: { tab: previousTab || 'dashboard' },
      })
    );
  };

  useEffect(() => {
    loadCoursesAndRisk();
  }, []);

  useEffect(() => {
    if (activeCourseId) {
      loadCourseRisk(activeCourseId);
    } else {
      loadFacultyOverview();
    }
  }, [activeCourseId]);

  const loadCoursesAndRisk = async () => {
    try {
      setLoading(true);
      const coursesRes = await api.getFacultyCourses();
      setCourses(coursesRes || []);
      if (selectedCourseId) {
        setActiveCourseId(selectedCourseId);
      } else {
        await loadFacultyOverview();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load faculty courses.' });
    } finally {
      setLoading(false);
    }
  };

  const loadFacultyOverview = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.getFacultyRiskOverview();
      setOverviewData(res);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load risk overview.' });
    } finally {
      setLoading(false);
    }
  };

  const loadCourseRisk = async (courseId) => {
    try {
      setLoading(true);
      setFeedback(null);
      const list = await api.getCourseRisk(courseId);
      const high = list.filter((p) => p.riskCategory === 'High Risk').length;
      const medium = list.filter((p) => p.riskCategory === 'Medium Risk').length;
      const low = list.filter((p) => p.riskCategory === 'Low Risk').length;
      setOverviewData({
        totalAnalyzed: list.length,
        highRiskCount: high,
        mediumRiskCount: medium,
        lowRiskCount: low,
        highRiskPercentage: list.length > 0 ? (high / list.length) * 100 : 0,
        studentPredictions: list,
        modelStatus: 'Online',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load course risk.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const val = e.target.value;
    setActiveCourseId(val);
    if (onSelectCourse) onSelectCourse(val ? Number(val) : null);
  };

  const getRiskBadgeClass = (category) => {
    if (category === 'High Risk') return 'badge-risk-high';
    if (category === 'Medium Risk') return 'badge-risk-medium';
    return 'badge-risk-low';
  };

  const getAttendanceRate = (pred) => {
    if (!pred) return null;
    if (pred.attendance != null) return pred.attendance;
    if (pred.features?.['Attendance (%)'] != null) return pred.features['Attendance (%)'];
    return null;
  };

  const allLoadedPredictions = overviewData?.studentPredictions || [];

  const filteredPredictions = allLoadedPredictions.filter((p) => {
    if (riskCategoryFilter === 'ALL') return true;
    return p.riskCategory === riskCategoryFilter;
  });

  const selectedStudent = filteredPredictions.find(
    (p) => p.studentId === selectedStudentId
  ) || null;

  // Clear selected student whenever filtered roster changes and selected student is excluded
  useEffect(() => {
    if (selectedStudentId && !filteredPredictions.some((p) => p.studentId === selectedStudentId)) {
      setSelectedStudentId(null);
    }
  }, [filteredPredictions, selectedStudentId]);

  const totalStudentsCount = overviewData?.totalAnalyzed ?? allLoadedPredictions.length;
  const highRiskCount = overviewData?.highRiskCount ?? allLoadedPredictions.filter((p) => p.riskCategory === 'High Risk').length;
  const mediumRiskCount = overviewData?.mediumRiskCount ?? allLoadedPredictions.filter((p) => p.riskCategory === 'Medium Risk').length;
  const lowRiskCount = overviewData?.lowRiskCount ?? allLoadedPredictions.filter((p) => p.riskCategory === 'Low Risk').length;
  const highRiskPercentage = totalStudentsCount > 0 ? (highRiskCount / totalStudentsCount) * 100 : 0;

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <div
            className="faculty-risk-header-title-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '0.35rem',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm faculty-back-btn"
              onClick={handleBack}
              id="faculty-risk-back-btn"
            >
              ← Back
            </button>
            <h1 className="student-page-title" style={{ margin: 0 }}>
              🧠 Student Risk Advisor
            </h1>
          </div>
          <p className="student-page-subtitle">
            Machine Learning early-warning indicators to identify academic risk and target support interventions.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => (activeCourseId ? loadCourseRisk(activeCourseId) : loadFacultyOverview())}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : '🔄 Refresh Risk Data'}
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible`} role="alert">
          <span>{feedback.message}</span>
          <button type="button" className="alert-close-btn" onClick={() => setFeedback(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="card filter-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label htmlFor="course-select" className="form-label" style={{ marginBottom: '0.25rem' }}>
              Filter by Course
            </label>
            <select
              id="course-select"
              className="form-input"
              value={activeCourseId}
              onChange={handleCourseChange}
            >
              <option value="">All Assigned Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '200px' }}>
            <label htmlFor="risk-select" className="form-label" style={{ marginBottom: '0.25rem' }}>
              Risk Level Filter
            </label>
            <select
              id="risk-select"
              className="form-input"
              value={riskCategoryFilter}
              onChange={(e) => setRiskCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="High Risk">🚨 High Risk Only</option>
              <option value="Medium Risk">⚠️ Medium Risk Only</option>
              <option value="Low Risk">✅ Low Risk Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Summary Grid - 4 Chamfered Facets */}
      {overviewData && (
        <div className="hud-hex-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <div className="hud-hex-card hud-hex-cyan">
            <div className="hud-hex-label">Total Students</div>
            <div className="hud-hex-value">{totalStudentsCount}</div>
            <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Active In Scope</div>
          </div>

          <div className="hud-hex-card hud-hex-crimson">
            <div className="hud-hex-label">High Risk</div>
            <div className="hud-hex-value" style={{ color: 'var(--cyber-crimson)' }}>{highRiskCount}</div>
            <div className="hud-hex-subtext" style={{ color: '#fca5a5' }}>
              {totalStudentsCount > 0 ? `${highRiskPercentage.toFixed(0)}% of Cohort` : 'Immediate Action'}
            </div>
          </div>

          <div className="hud-hex-card hud-hex-amber">
            <div className="hud-hex-label">Medium Risk</div>
            <div className="hud-hex-value" style={{ color: 'var(--cyber-amber)' }}>{mediumRiskCount}</div>
            <div className="hud-hex-subtext" style={{ color: '#fde68a' }}>Monitoring Required</div>
          </div>

          <div className="hud-hex-card hud-hex-emerald">
            <div className="hud-hex-label">Low Risk</div>
            <div className="hud-hex-value" style={{ color: 'var(--cyber-emerald)' }}>{lowRiskCount}</div>
            <div className="hud-hex-subtext" style={{ color: '#86efac' }}>Satisfactory Standing</div>
          </div>
        </div>
      )}

      {/* Main Grid: Left At-Risk Students Table & Right Faculty Risk Review */}
      <div className="cyber-dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Left: At-Risk Students Table matching Top-Right of reference */}
        <div className="card table-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="table-header-strip" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.98rem' }}>At-Risk Students Roster</h3>
            <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
              {filteredPredictions.length} Filtered
            </span>
          </div>

          {loading ? (
            <div className="loading-container" style={{ padding: '2rem' }}>
              <div className="loading-spinner"></div>
              <p>Evaluating risk telemetry...</p>
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="empty-state-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No students match current filter criteria.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ flex: 1 }}>
              <table className="unicore-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Attendance</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPredictions.map((pred) => {
                    const isSelected = selectedStudent?.studentId === pred.studentId;
                    return (
                      <tr
                        key={`${pred.studentId}-${pred.courseId || 'all'}`}
                        onClick={() => setSelectedStudentId(pred.studentId)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(0, 242, 254, 0.08)' : undefined,
                          borderLeft: isSelected ? '3px solid var(--cyber-cyan)' : '3px solid transparent',
                          transition: 'background 0.15s ease',
                        }}
                        className={isSelected ? 'selected-student-row' : ''}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(0, 242, 254, 0.15)',
                                border: '1px solid rgba(0, 242, 254, 0.3)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--cyber-cyan)',
                              }}
                            >
                              👤
                            </span>
                            <div>
                              <strong style={{ fontSize: '0.85rem' }}>{pred.studentName}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                {pred.studentRoll || `STD-${pred.studentId}`} &bull; {pred.department || 'BCA'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              color:
                                (getAttendanceRate(pred) ?? 0) >= 75
                                  ? 'var(--cyber-emerald)'
                                  : 'var(--cyber-crimson)',
                            }}
                          >
                            {getAttendanceRate(pred) != null
                              ? `${getAttendanceRate(pred)}%`
                              : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              pred.riskCategory === 'High Risk'
                                ? 'badge-pill-high'
                                : pred.riskCategory === 'Medium Risk'
                                ? 'badge-pill-medium'
                                : 'badge-pill-low'
                            }
                          >
                            {pred.riskCategory === 'High Risk'
                              ? 'High'
                              : pred.riskCategory === 'Medium Risk'
                              ? 'Medium'
                              : 'Low'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Faculty Risk Review Panel matching Mid-Right of reference */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9' }}>Faculty Risk Review</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Targeted student risk intervention &amp; faculty observations
              </p>
            </div>
          </div>

          {!selectedStudent ? (
            <div className="empty-state-card" style={{ padding: '2.5rem 1rem', textAlign: 'center', margin: 'auto 0' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>📋</span>
              <h4 style={{ margin: '0 0 0.5rem', color: '#f1f5f9', fontSize: '0.95rem' }}>No Student Selected</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                {filteredPredictions.length === 0
                  ? 'No students match current filter criteria.'
                  : 'Select a student from the roster to review performance telemetry and log remediation notes.'}
              </p>
            </div>
          ) : (
            <>
              {/* Student Profile Quick Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>👨‍🎓</span>
                  <div>
                    <strong style={{ fontSize: '0.88rem' }}>{selectedStudent.studentName}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {selectedStudent.studentRoll || `STD-${selectedStudent.studentId}`} &bull; {selectedStudent.department || 'BCA'}
                    </div>
                  </div>
                </div>

                {/* Spiky Neon ML Badge */}
                <div className="burst-callout-badge" style={{ margin: 0, padding: '0.35rem 0.65rem' }}>
                  <div className="burst-callout-title" style={{ fontSize: '0.75rem' }}>
                    <span>⚡</span> ML Prediction
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color:
                        selectedStudent.riskCategory === 'High Risk'
                          ? '#fca5a5'
                          : selectedStudent.riskCategory === 'Medium Risk'
                          ? '#fde68a'
                          : '#86efac',
                      fontWeight: 600,
                    }}
                  >
                    {selectedStudent.riskCategory}
                  </div>
                </div>
              </div>

              {/* Metrics summary list */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.78rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Attendance: </span>
                  <strong>{getAttendanceRate(selectedStudent) != null ? `${getAttendanceRate(selectedStudent)}%` : 'N/A'}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Midterm: </span>
                  <strong>{selectedStudent.features?.['Midterm_Score'] != null ? `${selectedStudent.features['Midterm_Score']}%` : 'N/A'}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Assignments: </span>
                  <strong>{selectedStudent.features?.['Assignments_Avg'] != null ? `${selectedStudent.features['Assignments_Avg']}%` : 'N/A'}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Quizzes: </span>
                  <strong>{selectedStudent.features?.['Quizzes_Avg'] != null ? `${selectedStudent.features['Quizzes_Avg']}%` : 'N/A'}</strong>
                </div>
              </div>

              {/* Faculty Assessment input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 0 }}>
                  Faculty Assessment &amp; Remediation Notes:
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={assessmentNote}
                  onChange={(e) => setAssessmentNote(e.target.value)}
                  placeholder="Enter specific remediation guidance or action items..."
                  style={{ fontSize: '0.8rem', resize: 'vertical' }}
                ></textarea>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, fontSize: '0.78rem' }}
                  onClick={() => {
                    setFeedback({
                      type: 'success',
                      message: `Risk remediation notice logged for ${selectedStudent.studentName}.`,
                    });
                    setAssessmentNote('');
                  }}
                >
                  Log Assessment &rarr;
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => {
                    setFeedback({
                      type: 'info',
                      message: `Opening student detailed document record for ${selectedStudent.studentName}.`,
                    });
                  }}
                >
                  View Records
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

