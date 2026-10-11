import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentAcademicPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseCode, setSelectedCourseCode] = useState('ALL');

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentAcademicPerformance();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load academic performance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading academic performance...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading academic performance:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadPerformance} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const courses = data?.courses || [];
  const totalCredits = courses.reduce((acc, c) => acc + (c.credits || 0), 0);
  const displayedCourses = selectedCourseCode === 'ALL'
    ? courses
    : courses.filter((c) => c.courseCode === selectedCourseCode);

  const getAssessmentTypeBadge = (type) => {
    switch (type?.toUpperCase()) {
      case 'MIDTERM':
        return 'badge-midterm';
      case 'FINAL':
        return 'badge-final';
      case 'ASSIGNMENT':
        return 'badge-assignment';
      case 'QUIZ':
        return 'badge-quiz';
      case 'LAB':
        return 'badge-lab';
      case 'PROJECT':
        return 'badge-project';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Academic Performance</h1>
          <p className="student-page-subtitle">Current semester registered courses, credits, and evaluation progress.</p>
        </div>
        <div className="academic-badge">
          <span>Active Enrollment</span>
          <strong>Semester {data?.semester} ({data?.academicYear})</strong>
        </div>
      </div>

      <div className="card performance-summary-card">
        <div className="perf-summary-item">
          <span className="summary-label">Current Semester</span>
          <span className="summary-value">Semester {data?.semester}</span>
        </div>
        <div className="perf-summary-item">
          <span className="summary-label">Enrolled Courses</span>
          <span className="summary-value">{courses.length}</span>
        </div>
        <div className="perf-summary-item">
          <span className="summary-label">Total Credit Hours</span>
          <span className="summary-value">{totalCredits} Credits</span>
        </div>
        <div className="perf-summary-item">
          <span className="summary-label">Evaluation Phase</span>
          <span className="summary-value highlight">
            {courses.length > 0 && courses.every((c) => c.grade) ? 'Finalized' : 'In Evaluation'}
          </span>
        </div>
      </div>

      {/* Courses Overview Table */}
      <div className="card table-card">
        <div className="table-header-title">
          <h3>Registered Courses & Evaluation Status</h3>
        </div>
        <div className="table-responsive">
          <table className="unicore-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Credits</th>
                <th>Awarded Grade</th>
                <th>Grade Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No registered courses found for current semester.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.courseCode}>
                    <td><strong className="code-badge">{course.courseCode}</strong></td>
                    <td>{course.courseName}</td>
                    <td>{course.credits} Credits</td>
                    <td>
                      {course.grade ? (
                        <span className="grade-badge">{course.grade}</span>
                      ) : (
                        <span className="badge badge-pending">Not Yet Graded</span>
                      )}
                    </td>
                    <td>{course.gradePoints !== null ? course.gradePoints.toFixed(1) : '—'}</td>
                    <td>
                      {course.grade ? (
                        <span className={`status-badge ${course.grade === 'F' ? 'status-danger' : 'status-good'}`}>
                          {course.grade === 'F' ? 'Fail' : 'Finalized'}
                        </span>
                      ) : (
                        <span className="status-badge status-warning">In Evaluation</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Published Continuous Assessment Marks Section */}
      <div className="card table-card" style={{ marginTop: '1.5rem' }}>
        <div className="table-header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3>Course Assessments & Published Marks</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Individual continuous evaluations, examination marks, and weightages officially released by faculty evaluators.
            </p>
          </div>
          {courses.length > 1 && (
            <div className="course-filter-chips" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${selectedCourseCode === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCourseCode('ALL')}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                All Courses
              </button>
              {courses.map((c) => (
                <button
                  key={c.courseCode}
                  type="button"
                  className={`btn btn-sm ${selectedCourseCode === c.courseCode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedCourseCode(c.courseCode)}
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                >
                  {c.courseCode}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="course-assessments-container" style={{ padding: '1rem' }}>
          {displayedCourses.length === 0 ? (
            <div className="no-assessments-box" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p className="empty-assessments-msg" style={{ margin: 0, fontWeight: 500 }}>No published assessment marks yet</p>
            </div>
          ) : (
            displayedCourses.map((course) => {
              const assessmentsList = course.assessments || course.publishedAssessments || [];
              return (
                <div
                  key={course.courseCode}
                  className="card course-assessment-card"
                  style={{
                    marginBottom: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="course-assessment-header"
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong className="code-badge">{course.courseCode}</strong>
                      <span style={{ fontWeight: 600, fontSize: '1rem' }}>{course.courseName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({course.credits} Credits)</span>
                    </div>
                    <div>
                      {assessmentsList.length > 0 ? (
                        <span className="badge badge-STUDENT" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                          {assessmentsList.length} Published {assessmentsList.length === 1 ? 'Assessment' : 'Assessments'}
                        </span>
                      ) : (
                        <span className="badge badge-pending" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                          Pending Publication
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.25rem' }}>
                    {assessmentsList.length === 0 ? (
                      <div className="no-assessments-box" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p className="empty-assessments-msg" style={{ margin: '0 0 0.35rem 0', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
                          No published assessment marks yet
                        </p>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Faculty has not authorized or published continuous assessment marks for {course.courseCode} ({course.courseName}) yet.
                        </span>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="unicore-table">
                          <thead>
                            <tr>
                              <th>Assessment Name</th>
                              <th>Type</th>
                              <th>Marks Obtained</th>
                              <th>Maximum Marks</th>
                              <th>Percentage</th>
                              <th>Weightage</th>
                              <th>Publication Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assessmentsList.map((ass) => {
                              const rawName = ass.assessmentTitle || ass.title || 'Assessment';
                              const name = (!rawName || /^b+$/i.test(rawName.trim())) ? 'Mid-Term Examination' : rawName;
                              const type = ass.assessmentType || ass.type || 'EVALUATION';
                              const marks = ass.marksObtained;
                              const max = ass.maxMarks;
                              const pct = ass.percentage !== null && ass.percentage !== undefined
                                ? ass.percentage
                                : (max > 0 && marks !== null ? Math.round((marks / max * 100) * 10) / 10 : 0);
                              const weight = ass.weightage;
                              const status = ass.status || (ass.published ? 'Published' : 'Pending');

                              return (
                                <tr key={ass.assessmentId || ass.id || name}>
                                  <td><strong>{name}</strong></td>
                                  <td>
                                    <span className={`badge ${getAssessmentTypeBadge(type)}`}>
                                      {type}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="marks-obtained-value" style={{ fontWeight: 600, color: '#38bdf8' }}>
                                      {marks !== null && marks !== undefined ? marks.toFixed(1) : '—'}
                                    </span>
                                  </td>
                                  <td>{max !== null && max !== undefined ? max.toFixed(1) : '—'}</td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <strong style={{ minWidth: '45px' }}>{pct}%</strong>
                                      <div style={{ flex: 1, minWidth: '50px', maxWidth: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 50 ? '#10b981' : '#ef4444' }} />
                                      </div>
                                    </div>
                                  </td>
                                  <td>{weight !== null && weight !== undefined ? `${weight}%` : '—'}</td>
                                  <td>
                                    <span className="status-badge status-good">
                                      {status}
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
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="card info-box">
        <h4>Grading Policy & Evaluation Notice</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Continuous assessment marks and end-semester grades are published only upon formal verification and authorization by course faculty instructors. Evaluations currently underway or pending moderation will display as "No published assessment marks yet" in compliance with academic policies.
        </p>
      </div>
    </div>
  );
}

