import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function FacultyCourseRoster({ selectedCourseId, onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(() => {
    if (selectedCourseId !== null && selectedCourseId !== undefined && selectedCourseId !== '') {
      return Number(selectedCourseId) || selectedCourseId;
    }
    return null;
  });
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Load assigned courses list
  useEffect(() => {
    loadAssignedCourses();
  }, []);

  // 2. Load roster when active course changes
  useEffect(() => {
    if (activeCourseId) {
      loadRoster(activeCourseId);
    }
  }, [activeCourseId]);

  // Sync prop changes
  useEffect(() => {
    if (selectedCourseId !== null && selectedCourseId !== undefined && selectedCourseId !== '') {
      let resolvedId = Number(selectedCourseId) || selectedCourseId;
      if (courses.length > 0) {
        const found = courses.find(
          (c) => c.id === Number(selectedCourseId) || c.courseCode === selectedCourseId || String(c.id) === String(selectedCourseId)
        );
        if (found) {
          resolvedId = found.id;
        }
      }
      if (resolvedId !== activeCourseId) {
        setActiveCourseId(resolvedId);
      }
    }
  }, [selectedCourseId, courses]);

  const loadAssignedCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMyAssignedCourses();
      const courseList = res || [];
      setCourses(courseList);

      // Determine initial course selection:
      // Priority 1: explicitly provided selectedCourseId prop
      // Priority 2: already active courseId
      // Priority 3: default to first course in list (direct roster access without prior selection)
      let targetCourseId = null;
      if (selectedCourseId !== null && selectedCourseId !== undefined && selectedCourseId !== '') {
        const found = courseList.find(
          (c) => c.id === Number(selectedCourseId) || c.courseCode === selectedCourseId || String(c.id) === String(selectedCourseId)
        );
        targetCourseId = found ? found.id : (Number(selectedCourseId) || selectedCourseId);
      } else if (activeCourseId !== null && activeCourseId !== undefined && activeCourseId !== '') {
        const found = courseList.find(
          (c) => c.id === Number(activeCourseId) || c.courseCode === activeCourseId || String(c.id) === String(activeCourseId)
        );
        targetCourseId = found ? found.id : courseList[0]?.id;
      } else if (courseList.length > 0) {
        targetCourseId = courseList[0].id;
      }

      if (targetCourseId) {
        setActiveCourseId(targetCourseId);
        if (onSelectCourse) {
          onSelectCourse(targetCourseId);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load assigned courses');
    } finally {
      setLoading(false);
    }
  };

  const loadRoster = async (courseId) => {
    try {
      setRosterLoading(true);
      setError(null);
      const res = await api.getCourseRoster(courseId);
      setRosterData(res);
    } catch (err) {
      setError(err.message || 'Failed to load course roster');
      setRosterData(null);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = Number(e.target.value);
    setActiveCourseId(courseId);
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading faculty course roster...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="student-page">
        <h1 className="student-page-title">Enrolled Student Roster</h1>
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            No courses are currently assigned to your faculty account. Once assigned, enrolled student rosters will appear here.
          </p>
        </div>
      </div>
    );
  }

  const students = rosterData?.students || [];

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Enrolled Student Roster</h1>
          <p className="student-page-subtitle">Official enrolled student roster and academic attendance telemetry.</p>
        </div>

        {/* Course Selector Dropdown */}
        <div className="filter-dropdown-wrapper">
          <label className="form-label" style={{ marginBottom: '0.2rem' }}>Selected Course:</label>
          <select
            className="form-input form-select"
            value={activeCourseId || ''}
            onChange={handleCourseChange}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} — {c.courseName} (Sem {c.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <p><strong>Error:</strong> {error}</p>
          <button className="btn btn-secondary" onClick={() => loadRoster(activeCourseId)} style={{ marginTop: '0.75rem', width: 'auto' }}>
            Retry
          </button>
        </div>
      )}

      {/* Course Overview Banner */}
      {rosterData && (
        <div className="roster-header-banner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="code-badge" style={{ fontSize: '1rem', fontWeight: 700 }}>
                {rosterData.courseCode}
              </span>
              <span className="badge badge-sem">Semester {rosterData.semester}</span>
              <span className="badge badge-secondary">{rosterData.department}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{rosterData.courseName}</h2>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="badge badge-STUDENT" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
              {rosterData.totalEnrolled} Students Enrolled
            </div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Credits: {rosterData.credits} | Active Curriculum
            </span>
          </div>
        </div>
      )}

      {/* Roster Table Card */}
      <div className="card table-card">
        <div className="table-header-title">
          <h3>Enrolled Students List ({students.length})</h3>
        </div>

        {rosterLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading roster records...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No students currently enrolled in this course section.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="unicore-table">
              <thead>
                <tr>
                  <th>Student Roll No.</th>
                  <th>Student Name</th>
                  <th>College Email</th>
                  <th>Semester / Batch</th>
                  <th>Attendance Rate</th>
                  <th>Awarded Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const att = student.attendancePercentage;
                  const attClass =
                    att === null
                      ? 'status-secondary'
                      : att >= 75
                      ? 'status-good'
                      : att >= 65
                      ? 'status-warning'
                      : 'status-danger';

                  return (
                    <tr key={student.enrollmentId}>
                      <td>
                        <span className="code-badge" style={{ fontWeight: 600 }}>
                          {student.studentId}
                        </span>
                      </td>
                      <td>
                        <strong>{student.studentName}</strong>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {student.collegeEmail}
                      </td>
                      <td>
                        Semester {student.semester} ({student.academicYear})
                      </td>
                      <td>
                        <span className={`status-badge ${attClass}`}>
                          {att !== null ? `${att}%` : 'No Records'}
                        </span>
                      </td>
                      <td>
                        {student.grade ? (
                          <span className="grade-badge">{student.grade}</span>
                        ) : (
                          <span className="badge-pending">Not Yet Graded</span>
                        )}
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
}
