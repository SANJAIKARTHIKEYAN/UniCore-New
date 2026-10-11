import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadEnrollments();
  }, [selectedCourseId, selectedSemester]);

  const loadCourses = async () => {
    try {
      const res = await api.getAdminCourses();
      setCourses(res || []);
    } catch (err) {
      console.error('Failed to load courses for filter', err);
    }
  };

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.getAdminEnrollments({
        courseId: selectedCourseId || null,
        semester: selectedSemester ? Number(selectedSemester) : null,
      });
      setEnrollments(res || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load enrollment records.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      (e.studentName && e.studentName.toLowerCase().includes(q)) ||
      (e.studentRegistrationNumber && e.studentRegistrationNumber.toLowerCase().includes(q)) ||
      (e.courseCode && e.courseCode.toLowerCase().includes(q)) ||
      (e.courseName && e.courseName.toLowerCase().includes(q))
    );
  });

  const getGradePillClass = (grade) => {
    switch (grade) {
      case 'O': return 'grade-pill-O';
      case 'A+': return 'grade-pill-Aplus';
      case 'A': return 'grade-pill-A';
      case 'B+': return 'grade-pill-Bplus';
      case 'B': return 'grade-pill-B';
      case 'C': return 'grade-pill-C';
      case 'F': return 'grade-pill-F';
      default: return 'grade-pill-default';
    }
  };

  return (
    <div className="student-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Institutional Enrollment Records</h1>
          <p className="student-page-subtitle">
            Auditable enrollment master records, course registrations, and awarded semester grades.
          </p>
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

      {/* Filters */}
      <div className="card attendance-filter-card" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-filter-bar">
          <div className="filter-group" style={{ flex: '1 1 250px' }}>
            <label className="form-label" htmlFor="enrollment-search">
              Search by Student or Course:
            </label>
            <input
              type="text"
              id="enrollment-search"
              className="form-control"
              placeholder="e.g. Sanjai, BCA-STU-001, BCA101..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group" style={{ minWidth: '220px' }}>
            <label className="form-label" htmlFor="filter-course">
              Filter by Course:
            </label>
            <select
              id="filter-course"
              className="form-control"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} &ndash; {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ minWidth: '150px' }}>
            <label className="form-label" htmlFor="filter-sem-enroll">
              Semester:
            </label>
            <select
              id="filter-sem-enroll"
              className="form-control"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {(selectedCourseId || selectedSemester || search) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedCourseId('');
                  setSelectedSemester('');
                  setSearch('');
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enrollments Table */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading enrollment records...</p>
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">📋</span>
          <h3>No Enrollments Found</h3>
          <p>No enrollment records match your search criteria.</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="unicore-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Semester</th>
                  <th>Academic Year</th>
                  <th>Final Grade</th>
                  <th>Grade Points</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((e, idx) => (
                  <tr key={e.id}>
                    <td className="text-secondary">{idx + 1}</td>
                    <td>
                      <span className="reg-number-pill">{e.studentRegistrationNumber}</span>
                    </td>
                    <td>
                      <strong>{e.studentName}</strong>
                    </td>
                    <td>
                      <span className="code-badge">{e.courseCode}</span>
                    </td>
                    <td>{e.courseName}</td>
                    <td>Sem {e.semester}</td>
                    <td className="text-secondary">{e.academicYear}</td>
                    <td>
                      <span className={`grade-pill ${getGradePillClass(e.grade)}`}>
                        {e.grade || '—'}
                      </span>
                    </td>
                    <td>
                      <strong className="grade-points-value">
                        {e.gradePoints !== null && e.gradePoints !== undefined ? e.gradePoints.toFixed(1) : '—'}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer-strip">
            <span>Showing {filteredEnrollments.length} of {enrollments.length} total enrollments</span>
          </div>
        </div>
      )}
    </div>
  );
}
