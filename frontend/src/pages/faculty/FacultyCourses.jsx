import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function FacultyCourses({ selectedCourseId, onNavigate, onSelectCourse }) {
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
      setError(err.message || 'Failed to load assigned courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading assigned courses...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading courses:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadCourses} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const handleSelectCard = (courseId) => {
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
  };

  const handleOpenRoster = (courseId, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
    if (onNavigate) {
      onNavigate('roster');
    }
  };

  const handleOpenAttendance = (courseId, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
    if (onNavigate) {
      onNavigate('attendance');
    }
  };

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">My Teaching Courses</h1>
          <p className="student-page-subtitle">Assigned academic courses, syllabi, and student enrollment roster overview.</p>
        </div>
        <span className="badge badge-FACULTY">{courses.length} Courses Assigned</span>
      </div>

      {courses.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>No teaching courses currently assigned to your faculty account.</p>
        </div>
      ) : (
        <div className="faculty-courses-grid">
          {courses.map((course) => {
            const isSelected = selectedCourseId === course.id || selectedCourseId === course.courseCode;
            return (
              <div
                key={course.id}
                className={`card course-box-card ${isSelected ? 'selected-course-card' : ''}`}
                onClick={() => handleSelectCard(course.id)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="course-box-top">
                    <span className="code-badge" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {course.courseCode}
                    </span>
                    <span className="badge badge-sem">Sem {course.semester}</span>
                  </div>

                  <h3 className="course-box-title">{course.courseName}</h3>

                  <div className="course-box-meta" style={{ marginTop: '0.75rem' }}>
                    <span className="badge badge-secondary">{course.department}</span>
                    <span className="badge badge-secondary">{course.credits} Credits</span>
                    <span className="badge badge-STUDENT">{course.enrolledStudentsCount} Enrolled</span>
                  </div>
                </div>

                <div className="course-box-actions" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                    onClick={(e) => handleOpenRoster(course.id, e)}
                  >
                    👥 View Enrolled Roster
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                    onClick={(e) => handleOpenAttendance(course.id, e)}
                  >
                    📝 Mark Attendance
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
