import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function FacultyDashboard({ onNavigate, onSelectCourse, currentUser }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMyAssignedCourses();
      setCourses(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load faculty dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading faculty dashboard...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading dashboard:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadCourses} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0);
  const facultyId = currentUser?.facultyProfile?.facultyId || 'Faculty';

  const handleOpenRoster = (courseId) => {
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
    if (onNavigate) {
      onNavigate('roster');
    }
  };

  const handleOpenAttendance = (courseId) => {
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
    if (onNavigate) {
      onNavigate('attendance');
    }
  };

  return (
    <div className="student-page">
      {/* Top Welcome Header */}
      <div className="page-header-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="student-page-title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Welcome back, {currentUser?.name || 'Professor Deviss'}!
          </h1>
          <p className="student-page-subtitle" style={{ fontSize: '0.95rem', marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
            Department: <strong>{currentUser?.department || 'BCA'}</strong> &bull; Faculty ID: <strong>{facultyId}</strong> &bull; Role: <strong>Instructor</strong>
          </p>
        </div>
        <div className="academic-badge" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
          <span>Active Session</span>
          <strong>2025–2026</strong>
        </div>
      </div>


      {/* 4 Faceted Metric Polygons matching Top-Right of Reference Image */}
      <div className="hud-hex-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        {/* Total Courses - Teaching */}
        <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('courses')} style={{ cursor: 'pointer' }}>
          <div className="hud-hex-label">Assigned Courses</div>
          <div className="hud-hex-value">{totalCourses}</div>
          <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Active Curriculum</div>
        </div>

        {/* Total Students - Cyan */}
        <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('roster')} style={{ cursor: 'pointer' }}>
          <div className="hud-hex-label">Total Students</div>
          <div className="hud-hex-value">{totalStudents}</div>
          <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Enrolled Roster</div>
        </div>

        {/* High Risk - Crimson */}
        <div className="hud-hex-card hud-hex-crimson" onClick={() => onNavigate('risk')} style={{ cursor: 'pointer' }}>
          <div className="hud-hex-label">High Risk</div>
          <div className="hud-hex-value" style={{ color: 'var(--cyber-crimson)' }}>18</div>
          <div className="hud-hex-subtext" style={{ color: '#fca5a5' }}>Immediate Action</div>
        </div>

        {/* Medium Risk - Amber */}
        <div className="hud-hex-card hud-hex-amber" onClick={() => onNavigate('risk')} style={{ cursor: 'pointer' }}>
          <div className="hud-hex-label">Medium Risk</div>
          <div className="hud-hex-value" style={{ color: 'var(--cyber-amber)' }}>42</div>
          <div className="hud-hex-subtext" style={{ color: '#fde68a' }}>Monitoring Required</div>
        </div>

        {/* Low Risk - Emerald */}
        <div className="hud-hex-card hud-hex-emerald" onClick={() => onNavigate('risk')} style={{ cursor: 'pointer' }}>
          <div className="hud-hex-label">Low Risk</div>
          <div className="hud-hex-value" style={{ color: 'var(--cyber-emerald)' }}>60</div>
          <div className="hud-hex-subtext" style={{ color: '#86efac' }}>Satisfactory Pace</div>
        </div>
      </div>



      {/* Quick Action Shortcuts */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Faculty Workflows</h4>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Direct access to classroom operations, evaluations, and student risk analytics.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('attendance')}
            >
              📅 Daily Attendance
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('assessments')}
            >
              📋 Assessments &amp; Marks
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('risk')}
            >
              🧠 Risk Advisor (ML)
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Courses Summary Section */}
      <div className="card table-card">
        <div className="table-header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>My Assigned Courses Overview</h3>
          <button className="btn btn-secondary" onClick={() => onNavigate('courses')} style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>
            View All Courses &rarr;
          </button>
        </div>

        {courses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No teaching courses currently assigned to this faculty account.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="unicore-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Semester</th>
                  <th>Credits</th>
                  <th>Enrolled Students</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td><span className="code-badge">{course.courseCode}</span></td>
                    <td><strong>{course.courseName}</strong></td>
                    <td>Semester {course.semester}</td>
                    <td>{course.credits} Credits</td>
                    <td>
                      <span className="badge badge-STUDENT">
                        {course.enrolledStudentsCount} Enrolled
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ width: 'auto', padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={() => handleOpenRoster(course.id)}
                        >
                          View Roster
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ width: 'auto', padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={() => handleOpenAttendance(course.id)}
                        >
                          Mark Attendance
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
