import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function FacultyAttendance({ selectedCourseId, onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(selectedCourseId || null);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [students, setStudents] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hasExistingRecords, setHasExistingRecords] = useState(false);

  // 1. Load faculty's assigned courses
  useEffect(() => {
    loadAssignedCourses();
  }, []);

  // 2. When course or date changes, load attendance
  useEffect(() => {
    if (activeCourseId && selectedDate) {
      loadAttendance(activeCourseId, selectedDate);
    }
  }, [activeCourseId, selectedDate]);

  // Sync prop changes
  useEffect(() => {
    if (selectedCourseId && selectedCourseId !== activeCourseId) {
      setActiveCourseId(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadAssignedCourses = async () => {
    try {
      setLoadingCourses(true);
      setFeedback(null);
      const res = await api.getMyAssignedCourses();
      const courseList = res || [];
      setCourses(courseList);

      if (!activeCourseId && courseList.length > 0) {
        const initialCourseId = selectedCourseId || courseList[0].id;
        setActiveCourseId(initialCourseId);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load assigned courses' });
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAttendance = async (courseId, date, clearFeedback = true) => {
    try {
      setLoadingAttendance(true);
      if (clearFeedback) {
        setFeedback(null);
      }
      const res = await api.getCourseAttendance(courseId, date);
      const entries = res || [];
      setStudents(entries);
      const hasExisting = entries.some((e) => e.status !== null);
      setHasExistingRecords(hasExisting);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load attendance for selected date' });
      setStudents([]);
      setHasExistingRecords(false);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = Number(e.target.value);
    setActiveCourseId(courseId);
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSetStatus = (studentUserId, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentUserId === studentUserId ? { ...s, status } : s))
    );
  };

  const handleMarkAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCourseId || !selectedDate) return;

    // Filter students that have an assigned status
    const markedEntries = students
      .filter((s) => s.status !== null && s.status !== undefined)
      .map((s) => ({
        studentId: s.studentUserId,
        status: s.status,
      }));

    if (markedEntries.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Please mark attendance (Present, Absent, or Late) for at least one student before saving.',
      });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);
      const payload = {
        date: selectedDate,
        entries: markedEntries,
      };

      const res = await api.submitCourseAttendance(activeCourseId, payload);
      setFeedback({
        type: 'success',
        message: res?.message || `Attendance saved successfully for ${markedEntries.length} student(s) on ${selectedDate}.`,
      });
      // Refresh to ensure database state parity without wiping feedback
      await loadAttendance(activeCourseId, selectedDate, false);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save attendance' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingCourses) {
    return <div className="student-loading">Loading faculty courses & attendance...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="student-page">
        <h1 className="student-page-title">Mark Student Attendance</h1>
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            No courses are currently assigned to your faculty account. Course assignments are required to mark attendance.
          </p>
        </div>
      </div>
    );
  }

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  // Summary counts
  const totalCount = students.length;
  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const lateCount = students.filter((s) => s.status === 'LATE').length;
  const unmarkedCount = students.filter((s) => !s.status).length;

  return (
    <div className="student-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Mark Student Attendance</h1>
          <p className="student-page-subtitle">
            Daily attendance recording and roster verification for enrolled students.
          </p>
        </div>
        <div className="attendance-session-badge">
          <span>Date:</span>
          <strong>{selectedDate}</strong>
        </div>
      </div>

      {/* Course & Date Filter Toolbar */}
      <div className="card attendance-filter-card">
        <div className="attendance-filter-grid">
          <div className="filter-group">
            <label className="form-label" htmlFor="course-select">
              Select Course:
            </label>
            <select
              id="course-select"
              className="form-control"
              value={activeCourseId || ''}
              onChange={handleCourseChange}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} &ndash; {c.courseName} (Sem {c.semester})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label" htmlFor="attendance-date">
              Attendance Date:
            </label>
            <div className="date-input-wrapper">
              <input
                type="date"
                id="attendance-date"
                className="form-control"
                value={selectedDate}
                onChange={handleDateChange}
                max={getTodayString()}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedDate(getTodayString())}
                title="Set to today's date"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Selected Course Metadata Banner */}
        {activeCourse && (
          <div className="course-active-info-strip">
            <div className="course-active-title">
              <span className="code-badge">{activeCourse.courseCode}</span>
              <strong>{activeCourse.courseName}</strong>
            </div>
            <div className="course-active-badges">
              <span className="badge badge-secondary">{activeCourse.department}</span>
              <span className="badge badge-secondary">Semester {activeCourse.semester}</span>
              <span className="badge badge-secondary">{activeCourse.credits} Credits</span>
              <span className="badge badge-STUDENT">{totalCount} Enrolled</span>
              {hasExistingRecords ? (
                <span className="badge badge-attendance-recorded" title="Attendance previously recorded for this date">
                  ✓ Recorded
                </span>
              ) : (
                <span className="badge badge-attendance-pending" title="No records saved yet for this date">
                  ○ Unrecorded
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback Alerts */}
      {feedback && (
        <div
          className={`alert ${
            feedback.type === 'success' ? 'alert-success' : 'alert-danger'
          }`}
          style={{ marginBottom: '1.25rem' }}
        >
          <span>{feedback.message}</span>
          <button
            className="alert-close-btn"
            onClick={() => setFeedback(null)}
            title="Dismiss"
          >
            &times;
          </button>
        </div>
      )}

      {/* Attendance Workspace */}
      <div className="card table-card">
        {/* Action & Metric Bar */}
        <div className="attendance-action-bar">
          <div className="attendance-metrics-row">
            <span className="metric-chip chip-total">
              Enrolled: <strong>{totalCount}</strong>
            </span>
            <span className="metric-chip chip-present">
              Present: <strong>{presentCount}</strong>
            </span>
            <span className="metric-chip chip-absent">
              Absent: <strong>{absentCount}</strong>
            </span>
            <span className="metric-chip chip-late">
              Late: <strong>{lateCount}</strong>
            </span>
            {unmarkedCount > 0 && (
              <span className="metric-chip chip-unmarked">
                Unmarked: <strong>{unmarkedCount}</strong>
              </span>
            )}
          </div>

          <div className="quick-actions-row">
            <button
              type="button"
              className="btn btn-sm btn-mark-all-present"
              onClick={() => handleMarkAll('PRESENT')}
              disabled={loadingAttendance || totalCount === 0}
            >
              ✓ All Present
            </button>
            <button
              type="button"
              className="btn btn-sm btn-mark-all-absent"
              onClick={() => handleMarkAll('ABSENT')}
              disabled={loadingAttendance || totalCount === 0}
            >
              ✕ All Absent
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loadingAttendance ? (
          <div className="student-loading" style={{ padding: '3rem' }}>
            Loading student attendance list...
          </div>
        ) : totalCount === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No students are currently enrolled in this course section.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="unicore-table attendance-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', minWidth: '220px' }}>Mark Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const status = student.status;
                  return (
                    <tr key={student.studentUserId} className="attendance-row">
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td>
                        <span className="student-id-tag">{student.studentId || 'N/A'}</span>
                      </td>
                      <td>
                        <strong>{student.studentName}</strong>
                      </td>
                      <td>
                        {status === 'PRESENT' && (
                          <span className="badge badge-status-present">Present</span>
                        )}
                        {status === 'ABSENT' && (
                          <span className="badge badge-status-absent">Absent</span>
                        )}
                        {status === 'LATE' && (
                          <span className="badge badge-status-late">Late</span>
                        )}
                        {!status && (
                          <span className="badge badge-status-unmarked">Unmarked</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="attendance-toggle-group">
                          <button
                            type="button"
                            className={`toggle-btn toggle-present ${
                              status === 'PRESENT' ? 'active' : ''
                            }`}
                            onClick={() => handleSetStatus(student.studentUserId, 'PRESENT')}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn toggle-absent ${
                              status === 'ABSENT' ? 'active' : ''
                            }`}
                            onClick={() => handleSetStatus(student.studentUserId, 'ABSENT')}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn toggle-late ${
                              status === 'LATE' ? 'active' : ''
                            }`}
                            onClick={() => handleSetStatus(student.studentUserId, 'LATE')}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with Submit Button */}
        {totalCount > 0 && (
          <div className="attendance-submit-footer">
            <div className="footer-status-text">
              {hasExistingRecords ? (
                <span>
                  Updates will overwrite the existing records for <strong>{selectedDate}</strong>.
                </span>
              ) : (
                <span>
                  Ready to record attendance for <strong>{totalCount}</strong> students on <strong>{selectedDate}</strong>.
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-save-attendance"
              onClick={handleSubmit}
              disabled={saving || loadingAttendance}
            >
              {saving ? 'Saving Attendance...' : '💾 Save Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
