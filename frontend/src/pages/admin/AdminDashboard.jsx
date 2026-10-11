import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CyberWaveChart from '../../components/common/CyberWaveChart';


export default function AdminDashboard({ onNavigate, currentUser }) {
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, attRes] = await Promise.all([
        api.getAdminDashboard(),
        typeof api.getAdminAttendanceSummary === 'function'
          ? Promise.resolve(api.getAdminAttendanceSummary()).catch(() => null)
          : Promise.resolve(null),
      ]);
      setStats(dashRes);
      setAttendance(attRes);
    } catch (err) {
      setError(err.message || 'Failed to load administration dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    attendance?.departmentSummaries && attendance.departmentSummaries.length > 0
      ? attendance.departmentSummaries.map((ds) => ({
          label: ds.department,
          value: Math.round(ds.percentage),
        }))
      : [
          { label: 'Overall', value: attendance?.overallPercentage ? Math.round(attendance.overallPercentage) : 85 },
        ];

  return (
    <div className="student-page">
      {/* Welcome Banner */}
      <div className="page-header-row admin-welcome-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="student-page-title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            University Administration Portal
          </h1>
          <p className="student-page-subtitle" style={{ fontSize: '0.95rem', marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
            Enterprise overview of academic operations, user accounts, course catalog, and institutional metrics.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadDashboardStats}
            disabled={loading}
            title="Refresh metrics from backend"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button type="button" className="alert-close-btn" onClick={() => setError(null)}>
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading enterprise metrics...</p>
        </div>
      ) : stats ? (
        <>
          {/* Primary Metric Grid with Real Authoritative Institutional Data */}
          <div className="hud-hex-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
            <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('students')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Total Students</div>
              <div className="hud-hex-value">{stats.totalStudents ?? 0}</div>
              <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Enrolled Students</div>
            </div>

            <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('departments')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Departments</div>
              <div className="hud-hex-value">{stats.totalDepartments ?? 0}</div>
              <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Operational Units</div>
            </div>

            <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('faculty')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Faculty</div>
              <div className="hud-hex-value">{stats.totalFaculty ?? 0}</div>
              <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Active Instructors</div>
            </div>

            <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('courses')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Catalog Courses</div>
              <div className="hud-hex-value" style={{ color: 'var(--cyber-cyan)' }}>{stats.totalCourses ?? 0}</div>
              <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Active Syllabus</div>
            </div>

            <div className="hud-hex-card hud-hex-emerald" onClick={() => onNavigate('enrollments')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Course Enrollments</div>
              <div className="hud-hex-value" style={{ color: 'var(--cyber-emerald)' }}>{stats.totalEnrollments ?? 0}</div>
              <div className="hud-hex-subtext" style={{ color: '#86efac' }}>Active Registrations</div>
            </div>

            <div className="hud-hex-card hud-hex-amber" onClick={() => onNavigate('reports')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Attendance Logs</div>
              <div className="hud-hex-value" style={{ color: 'var(--cyber-amber)' }}>{stats.totalAttendanceRecords ?? 0}</div>
              <div className="hud-hex-subtext" style={{ color: '#fde68a' }}>Verified Sessions</div>
            </div>
          </div>

          {/* Secondary Metric Grid & Chart Area */}
          <div className="cyber-dashboard-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--on-surface)' }}>Institutional Attendance Trends</h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {attendance?.overallPercentage != null
                      ? `Aggregate verified attendance across academic departments (${attendance.overallPercentage}% institutional average)`
                      : 'Aggregate verified attendance across academic departments'}
                  </p>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: '180px' }}>
                <CyberWaveChart
                  data={chartData}
                  height={170}
                  strokeColor="#00f2fe"
                />
              </div>
            </div>

            {/* Quick Operations Telemetry */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--on-surface)' }}>Operational Telemetry</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Active Users</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--accent-emerald, #10b981)' }}>{stats.activeUsers ?? 0}</strong>
                </div>
                <div style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Assessments</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--primary, #493ee5)' }}>{stats.totalAssessments ?? 0}</strong>
                </div>
                <div style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Course Enrollments</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--secondary, #0d50d5)' }}>{stats.totalEnrollments ?? 0}</strong>
                </div>
                <div style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Attendance Logs</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--accent-amber, #f59e0b)' }}>{stats.totalAttendanceRecords ?? 0}</strong>
                </div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: '0.78rem' }}
                  onClick={() => onNavigate('reports')}
                >
                  Full Analytics &rarr;
                </button>
              </div>
            </div>
          </div>


          {/* Quick Management Shortcuts */}
          <div className="card admin-quick-actions-card">
            <h2 className="section-subheading" style={{ marginBottom: '1rem' }}>
              Administrative Shortcuts
            </h2>
            <div className="admin-actions-grid">
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('students')}
              >
                <span>👨‍🎓</span> Manage Students
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('faculty')}
              >
                <span>👨‍🏫</span> Manage Faculty
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('courses')}
              >
                <span>📚</span> Course Catalog & Assignments
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('enrollments')}
              >
                <span>📋</span> Enrollment Records
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('reports')}
              >
                <span>📈</span> System Analytics & Summaries
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('departments')}
              >
                <span>🏛️</span> Department Setup & Rosters
              </button>
            </div>
          </div>

          {/* System Activity & Health Feed */}
          {stats.recentActivity && stats.recentActivity.length > 0 && (
            <div className="card table-card" style={{ marginTop: '1.5rem' }}>
              <div className="table-header-strip">
                <h3>System Telemetry & Status Briefing</h3>
              </div>
              <ul className="admin-activity-list">
                {stats.recentActivity.map((act, index) => (
                  <li key={index} className="admin-activity-item">
                    <span className="admin-activity-dot"></span>
                    <span className="admin-activity-text">{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
