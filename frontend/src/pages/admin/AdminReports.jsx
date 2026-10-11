import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminReports() {
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [assessmentSummary, setAssessmentSummary] = useState(null);
  const [riskOverview, setRiskOverview] = useState(null);
  const [advisorOverview, setAdvisorOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const [attRes, assRes, riskRes, advRes] = await Promise.all([
        api.getAdminAttendanceSummary(),
        api.getAdminAssessmentsSummary(),
        api.getAdminRiskOverview().catch((err) => {
          console.warn('Failed to load risk overview:', err);
          return null;
        }),
        api.getAdminAdvisorOverview().catch((err) => {
          console.warn('Failed to load advisor overview:', err);
          return null;
        }),
      ]);
      setAttendanceSummary(attRes);
      setAssessmentSummary(assRes);
      setRiskOverview(riskRes);
      setAdvisorOverview(advRes);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load analytics reports.' });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (pct) => {
    if (pct >= 80) return 'var(--color-success)';
    if (pct >= 65) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Analytics &amp; Institutional Reports</h1>
          <p className="student-page-subtitle">
            System-wide attendance performance and academic assessment coverage summaries.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadReports}
          disabled={loading}
        >
          {loading ? 'Loading...' : '🔄 Refresh Reports'}
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

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading institutional reports...</p>
        </div>
      ) : (
        <>
          {/* Attendance Analytics */}
          {attendanceSummary && (
            <>
              {/* Overall Attendance Cards */}
              <div className="section-header-row" style={{ marginBottom: '0.75rem' }}>
                <h2 className="section-subheading">📊 Institution-Wide Attendance</h2>
              </div>
              <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="card metric-card">
                  <span className="metric-label">Total Records</span>
                  <strong className="metric-value">{attendanceSummary.totalRecords}</strong>
                  <span className="metric-subtext">Daily attendance entries</span>
                </div>
                <div className="card metric-card">
                  <span className="metric-label">Overall Attendance</span>
                  <strong
                    className="metric-value"
                    style={{ color: getAttendanceColor(attendanceSummary.overallPercentage) }}
                  >
                    {attendanceSummary.overallPercentage.toFixed(1)}%
                  </strong>
                  <span className="metric-subtext">Present / Total sessions</span>
                </div>
                <div className="card metric-card">
                  <span className="metric-label">Present</span>
                  <strong className="metric-value text-success">{attendanceSummary.totalPresent}</strong>
                  <span className="metric-subtext">Sessions attended</span>
                </div>
                <div className="card metric-card">
                  <span className="metric-label">Absent</span>
                  <strong className="metric-value text-danger">{attendanceSummary.totalAbsent}</strong>
                  <span className="metric-subtext">Sessions missed</span>
                </div>
              </div>

              {/* Department Breakdown */}
              {attendanceSummary.departmentSummaries && attendanceSummary.departmentSummaries.length > 0 && (
                <div className="card table-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="table-header-strip">
                    <h3>Attendance Breakdown by Department</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="unicore-table">
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th>Total Sessions</th>
                          <th>Present</th>
                          <th>Attendance Rate</th>
                          <th>Health</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceSummary.departmentSummaries.map((ds) => (
                          <tr key={ds.department}>
                            <td>
                              <span className="badge badge-secondary">{ds.department}</span>
                            </td>
                            <td className="text-secondary">{ds.total}</td>
                            <td>{ds.present}</td>
                            <td>
                              <div className="progress-bar-wrapper">
                                <div
                                  className="progress-bar-fill"
                                  style={{
                                    width: `${Math.min(ds.percentage, 100)}%`,
                                    background: getAttendanceColor(ds.percentage),
                                  }}
                                ></div>
                                <span className="progress-bar-label">
                                  {ds.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  ds.percentage >= 80
                                    ? 'badge-attendance-present'
                                    : ds.percentage >= 65
                                    ? 'badge-attendance-late'
                                    : 'badge-attendance-absent'
                                }`}
                              >
                                {ds.percentage >= 80 ? 'Healthy' : ds.percentage >= 65 ? 'Monitor' : 'At Risk'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Assessment Analytics */}
          {assessmentSummary && (
            <>
              <div className="section-header-row" style={{ marginBottom: '0.75rem' }}>
                <h2 className="section-subheading">📝 Academic Assessment Analytics</h2>
              </div>
              <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="card metric-card">
                  <span className="metric-label">Total Assessments</span>
                  <strong className="metric-value">{assessmentSummary.totalAssessments}</strong>
                  <span className="metric-subtext">Created across all courses</span>
                </div>
                <div className="card metric-card">
                  <span className="metric-label">Marks Recorded</span>
                  <strong className="metric-value text-success">{assessmentSummary.totalMarksRecorded}</strong>
                  <span className="metric-subtext">Individual mark entries</span>
                </div>
                {assessmentSummary.typeCounts &&
                  Object.entries(assessmentSummary.typeCounts).map(([type, count]) => (
                    <div key={type} className="card metric-card">
                      <span className="metric-label">{type}</span>
                      <strong className="metric-value">{count}</strong>
                      <span className="metric-subtext">Assessments scheduled</span>
                    </div>
                  ))}
              </div>

              {/* Course Assessment Breakdown */}
              {assessmentSummary.courseOverviews && assessmentSummary.courseOverviews.length > 0 && (
                <div className="card table-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="table-header-strip">
                    <h3>Assessment Coverage by Course</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="unicore-table">
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Title</th>
                          <th>Assessments</th>
                          <th>Total Weightage</th>
                          <th>Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessmentSummary.courseOverviews.map((co) => (
                          <tr key={co.courseId}>
                            <td>
                              <span className="code-badge">{co.courseCode}</span>
                            </td>
                            <td>{co.courseName}</td>
                            <td>
                              <span className="badge badge-FACULTY">{co.assessmentCount}</span>
                            </td>
                            <td>{co.totalWeightage.toFixed(1)}%</td>
                            <td>
                              <div className="progress-bar-wrapper">
                                <div
                                  className="progress-bar-fill"
                                  style={{
                                    width: `${Math.min(co.totalWeightage, 100)}%`,
                                    background:
                                      co.totalWeightage >= 90
                                        ? 'var(--color-success)'
                                        : co.totalWeightage >= 60
                                        ? 'var(--color-warning)'
                                        : 'var(--color-accent)',
                                  }}
                                ></div>
                                <span className="progress-bar-label">
                                  {co.totalWeightage.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ML Early Warning & Risk Analytics */}
          {riskOverview && (
            <>
              <div className="section-header-row" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 className="section-subheading">🧠 ML Early-Warning Student Risk Analytics</h2>
                  <span className="badge badge-attendance-present" style={{ fontSize: '0.72rem' }}>
                    Random Forest Engine Online
                  </span>
                </div>
              </div>
              <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="card metric-card">
                  <span className="metric-label">Students Analyzed</span>
                  <strong className="metric-value">{riskOverview.totalAnalyzed}</strong>
                  <span className="metric-subtext">Active student records</span>
                </div>
                <div className="card metric-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
                  <span className="metric-label">🚨 High Risk</span>
                  <strong className="metric-value text-danger">{riskOverview.highRiskCount}</strong>
                  <span className="metric-subtext">
                    {riskOverview.highRiskPercentage.toFixed(1)}% of student body
                  </span>
                </div>
                <div className="card metric-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                  <span className="metric-label">⚠️ Medium Risk</span>
                  <strong className="metric-value text-warning">{riskOverview.mediumRiskCount}</strong>
                  <span className="metric-subtext">Requires targeted coaching</span>
                </div>
                <div className="card metric-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                  <span className="metric-label">✅ Low Risk</span>
                  <strong className="metric-value text-success">{riskOverview.lowRiskCount}</strong>
                  <span className="metric-subtext">Healthy academic pacing</span>
                </div>
              </div>

              {/* High Risk Breakdown by Department */}
              {riskOverview.departmentBreakdown && Object.keys(riskOverview.departmentBreakdown).length > 0 && (
                <div className="card table-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="table-header-strip">
                    <h3>High-Risk Distribution by Academic Department</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="unicore-table">
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th>High-Risk Students</th>
                          <th>Action Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(riskOverview.departmentBreakdown).map(([dept, count]) => (
                          <tr key={dept}>
                            <td>
                              <span className="badge badge-secondary">{dept}</span>
                            </td>
                            <td>
                              <strong className="text-danger">{count}</strong>
                            </td>
                            <td>
                              <span className="badge badge-attendance-absent">
                                Academic Intervention Recommended
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* AI Advisor Institutional Guidance Telemetry */}
          {advisorOverview && (
            <>
              <div className="section-header-row" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 className="section-subheading">🤖 AI Advisor Institutional Guidance Telemetry</h2>
                  <span className="badge badge-STUDENT" style={{ fontSize: '0.72rem' }}>
                    Rule-Based Intent Engine Active
                  </span>
                </div>
              </div>
              <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="card metric-card">
                  <span className="metric-label">Profiles Analyzed</span>
                  <strong className="metric-value">{advisorOverview.totalStudentsAnalyzed}</strong>
                  <span className="metric-subtext">Students with active telemetry</span>
                </div>
                <div className="card metric-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
                  <span className="metric-label">🚨 High-Priority Actions</span>
                  <strong className="metric-value text-danger">{advisorOverview.highPriorityCount}</strong>
                  <span className="metric-subtext">Critical interventions required</span>
                </div>
                <div className="card metric-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                  <span className="metric-label">📅 Attendance Warnings</span>
                  <strong className="metric-value text-warning">{advisorOverview.lowAttendanceStudentsCount}</strong>
                  <span className="metric-subtext">Below 75% exam cutoff</span>
                </div>
                <div className="card metric-card" style={{ borderLeft: '4px solid var(--color-info)' }}>
                  <span className="metric-label">📚 Academic Remediation</span>
                  <strong className="metric-value text-info">{advisorOverview.lowMarksStudentsCount}</strong>
                  <span className="metric-subtext">Courses with scores &lt; 60%</span>
                </div>
              </div>

              {advisorOverview.priorityDistributionByDepartment &&
                Object.keys(advisorOverview.priorityDistributionByDepartment).length > 0 && (
                  <div className="card table-card">
                    <div className="table-header-strip">
                      <h3>High-Priority Advisor Interventions by Department</h3>
                    </div>
                    <div className="table-responsive">
                      <table className="unicore-table">
                        <thead>
                          <tr>
                            <th>Department</th>
                            <th>Priority Cases</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(advisorOverview.priorityDistributionByDepartment).map(([dept, count]) => (
                            <tr key={dept}>
                              <td>
                                <span className="badge badge-secondary">{dept}</span>
                              </td>
                              <td>
                                <strong className="text-warning">{count}</strong>
                              </td>
                              <td>
                                <span className="badge badge-priority-medium">
                                  Advisor Action Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </>
          )}
        </>
      )}
    </div>
  );
}
