import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentAttendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentAttendance();
      setAttendanceList(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading attendance records...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading attendance:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadAttendance} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  // Calculate overall metrics
  const totalClasses = attendanceList.reduce((acc, c) => acc + (c.totalClasses || 0), 0);
  const totalPresent = attendanceList.reduce((acc, c) => acc + (c.present || 0), 0);
  const totalLate = attendanceList.reduce((acc, c) => acc + (c.late || 0), 0);
  const totalAbsent = attendanceList.reduce((acc, c) => acc + (c.absent || 0), 0);
  const overallPercent = totalClasses > 0 ? Math.round(((totalPresent + totalLate) / totalClasses) * 1000) / 10 : 0;

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">My Attendance</h1>
          <p className="student-page-subtitle">Course-wise attendance tracking and examination eligibility breakdown.</p>
        </div>
        <div className={`attendance-badge-pill ${overallPercent >= 75 ? 'status-good' : 'status-warning'}`}>
          Overall: {overallPercent}% ({overallPercent >= 75 ? 'Eligible for Exams' : 'Below 75% Requirement'})
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="card attendance-summary-banner">
        <div className="attendance-metric-item">
          <span className="metric-number">{totalClasses}</span>
          <span className="metric-title">Total Classes</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number text-success">{totalPresent}</span>
          <span className="metric-title">Present</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number text-warning">{totalLate}</span>
          <span className="metric-title">Late</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number text-danger">{totalAbsent}</span>
          <span className="metric-title">Absent</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number">{overallPercent}%</span>
          <span className="metric-title">Attendance Rate</span>
        </div>
      </div>

      {/* Course-wise Attendance Cards */}
      <div className="courses-attendance-grid">
        {attendanceList.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--text-secondary)' }}>No enrolled course attendance records found for this semester.</p>
          </div>
        ) : (
          attendanceList.map((course) => {
            const percent = course.attendancePercent || 0;
            const statusClass = percent >= 75 ? 'status-good' : percent >= 65 ? 'status-warning' : 'status-danger';
            return (
              <div key={course.courseCode} className="card course-attendance-card">
                <div className="course-card-top">
                  <div>
                    <span className="course-code-tag">{course.courseCode}</span>
                    <h3 className="course-card-title">{course.courseName}</h3>
                  </div>
                  <div className={`percent-indicator ${statusClass}`}>
                    {percent}%
                  </div>
                </div>

                <div className="attendance-bar-wrapper">
                  <div className="attendance-bar-track">
                    <div
                      className={`attendance-bar-fill ${statusClass}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="attendance-counts-row">
                  <span>Present: <strong>{course.present}</strong></span>
                  <span>Late: <strong>{course.late}</strong></span>
                  <span>Absent: <strong>{course.absent}</strong></span>
                  <span>Total: <strong>{course.totalClasses}</strong></span>
                </div>

                <div className="course-card-footer">
                  <span className={`eligibility-tag ${percent >= 75 ? 'tag-eligible' : 'tag-ineligible'}`}>
                    {percent >= 75 ? '✓ Exam Eligible (>= 75%)' : '⚠ Attendance Shortage'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="card info-box">
        <h4>Attendance Policy & Regulations</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          University regulations require a minimum of 75% aggregate attendance in each registered course to be eligible to appear for the end-semester examinations. Medical leave and institutional on-duty requests must be submitted through the Department Head.
        </p>
      </div>
    </div>
  );
}
