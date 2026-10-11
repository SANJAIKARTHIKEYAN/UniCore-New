import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const DEPARTMENTS = ['BCA', 'BSCS', 'BCOM', 'BBA', 'BSM'];

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [departmentList, setDepartmentList] = useState(DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Create Course Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    courseCode: '',
    courseName: '',
    department: 'BCA',
    semester: 1,
    credits: 3,
    instructorId: '',
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Course Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [editForm, setEditForm] = useState({
    courseName: '',
    department: 'BCA',
    semester: 1,
    credits: 3,
    instructorId: '',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Assign Faculty Modal State
  const [assignModalCourse, setAssignModalCourse] = useState(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedSemester]);

  const loadData = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const [coursesRes, facultyRes, deptsRes] = await Promise.all([
        api.getAdminCourses(selectedDept || null, selectedSemester ? Number(selectedSemester) : null),
        api.getAdminFaculty(),
        api.getDepartments ? api.getDepartments().catch(() => null) : Promise.resolve(null),
      ]);
      setCourses(coursesRes || []);
      setFacultyList(facultyRes || []);
      if (deptsRes && Array.isArray(deptsRes) && deptsRes.length > 0) {
        const codes = deptsRes.map((d) => d.shortCode || d.name).filter(Boolean);
        if (codes.length > 0) {
          setDepartmentList(codes);
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load courses or faculty.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const code = (createForm.courseCode || '').trim().toUpperCase();
    const name = (createForm.courseName || '').trim();
    const dept = (createForm.department || '').trim();
    const sem = Number(createForm.semester);
    const creds = Number(createForm.credits);

    if (!code) {
      setFeedback({ type: 'error', message: 'Course code cannot be empty.' });
      return;
    }
    if (!name) {
      setFeedback({ type: 'error', message: 'Course title cannot be empty.' });
      return;
    }
    if (!dept) {
      setFeedback({ type: 'error', message: 'Department is required.' });
      return;
    }
    if (!sem || sem < 1) {
      setFeedback({ type: 'error', message: 'Semester must be at least 1.' });
      return;
    }
    if (!creds || creds < 1) {
      setFeedback({ type: 'error', message: 'Credits must be at least 1.' });
      return;
    }

    if (courses.some((c) => c.courseCode && c.courseCode.toUpperCase() === code)) {
      setFeedback({ type: 'error', message: `Course code "${code}" already exists in the course catalog.` });
      return;
    }

    try {
      setSubmittingCreate(true);
      setFeedback(null);
      const res = await api.createAdminCourse({
        courseCode: code,
        courseName: name,
        department: dept,
        semester: sem,
        credits: creds,
        instructorId: createForm.instructorId ? Number(createForm.instructorId) : null,
      });

      setShowCreateModal(false);
      setCreateForm({
        courseCode: '',
        courseName: '',
        department: departmentList[0] || 'BCA',
        semester: 1,
        credits: 3,
        instructorId: '',
      });
      await loadData();
      setFeedback({ type: 'success', message: `Course "${res.courseCode} — ${res.courseName}" created successfully.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create course.' });
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleEditClick = (course) => {
    setEditCourse(course);
    setEditForm({
      courseName: course.courseName || '',
      department: course.department || 'BCA',
      semester: course.semester || 1,
      credits: course.credits || 3,
      instructorId: course.instructorId ? String(course.instructorId) : '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCourse) return;

    const name = (editForm.courseName || '').trim();
    const dept = (editForm.department || '').trim();
    const sem = Number(editForm.semester);
    const creds = Number(editForm.credits);

    if (!name) {
      setFeedback({ type: 'error', message: 'Course title cannot be empty.' });
      return;
    }
    if (!dept) {
      setFeedback({ type: 'error', message: 'Department is required.' });
      return;
    }
    if (!sem || sem < 1) {
      setFeedback({ type: 'error', message: 'Semester must be at least 1.' });
      return;
    }
    if (!creds || creds < 1) {
      setFeedback({ type: 'error', message: 'Credits must be at least 1.' });
      return;
    }

    try {
      setSubmittingEdit(true);
      setFeedback(null);
      const res = await api.updateAdminCourse(editCourse.id, {
        courseName: name,
        department: dept,
        semester: sem,
        credits: creds,
        instructorId: editForm.instructorId ? Number(editForm.instructorId) : null,
      });

      // Handle unassignment if instructor was cleared
      if (!editForm.instructorId && editCourse.instructorId) {
        try {
          await api.unassignFacultyFromCourse(editCourse.id, editCourse.instructorId);
        } catch {
          // Ignore if unassignment already handled
        }
      }

      setShowEditModal(false);
      setEditCourse(null);
      await loadData();
      setFeedback({ type: 'success', message: `Course "${res.courseCode}" updated successfully.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update course.' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleOpenAssignModal = (course) => {
    setAssignModalCourse(course);
    setSelectedFacultyId(course.instructorId ? String(course.instructorId) : '');
  };

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    if (!assignModalCourse) return;

    try {
      setSubmittingAssign(true);
      setFeedback(null);
      if (!selectedFacultyId) {
        if (assignModalCourse.instructorId) {
          await api.unassignFacultyFromCourse(assignModalCourse.id, assignModalCourse.instructorId);
        }
      } else {
        await api.assignFacultyToCourse(assignModalCourse.id, Number(selectedFacultyId));
      }
      setAssignModalCourse(null);
      await loadData();
      setFeedback({ type: 'success', message: `Faculty assignment updated for ${assignModalCourse.courseCode}.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update faculty assignment.' });
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Are you sure you want to delete course ${course.courseCode} (${course.courseName})? This action cannot be undone.`)) {
      return;
    }
    try {
      setFeedback(null);
      await api.deleteAdminCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      setFeedback({ type: 'success', message: `Course "${course.courseCode}" successfully deleted.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete course.' });
    }
  };

  return (
    <div className="student-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">University Course Catalog</h1>
          <p className="student-page-subtitle">
            Configure institutional courses, assign faculty instructors, and manage course enrollments.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create New Course
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible`} role="alert">
          <span>{feedback.message}</span>
          <button type="button" className="alert-close-btn" onClick={() => setFeedback(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card attendance-filter-card" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-filter-bar">
          <div className="filter-group" style={{ minWidth: '220px' }}>
            <label className="form-label" htmlFor="filter-dept">
              Department:
            </label>
            <select
              id="filter-dept"
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ minWidth: '160px' }}>
            <label className="form-label" htmlFor="filter-sem">
              Semester:
            </label>
            <select
              id="filter-sem"
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

          {(selectedDept || selectedSemester) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedDept('');
                  setSelectedSemester('');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Courses Table */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading course catalog...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">📚</span>
          <h3>No Courses Found</h3>
          <p>No courses match your selected filter criteria.</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="unicore-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Credits</th>
                  <th>Assigned Faculty</th>
                  <th>Enrolled</th>
                  <th style={{ textAlign: 'right', width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, idx) => (
                  <tr key={c.id}>
                    <td className="text-secondary">{idx + 1}</td>
                    <td>
                      <span className="code-badge">{c.courseCode}</span>
                    </td>
                    <td>
                      <strong>{c.courseName}</strong>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{c.department}</span>
                    </td>
                    <td>Sem {c.semester}</td>
                    <td>{c.credits} cr</td>
                    <td>
                      {c.instructorId ? (
                        <div className="instructor-cell">
                          <span className="badge badge-FACULTY">👨‍🏫 {c.instructorName}</span>
                          <button
                            type="button"
                            className="btn btn-sm text-btn"
                            onClick={() => handleOpenAssignModal(c)}
                            title="Reassign or unassign faculty"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleOpenAssignModal(c)}
                        >
                          + Assign Faculty
                        </button>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-STUDENT">
                        {c.enrolledStudentsCount} Student{c.enrolledStudentsCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-action-btn-group">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditClick(c)}
                          title="Edit Course Details"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteCourse(c)}
                          title="Delete Course (Protected against active enrollments)"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer-strip">
            <span>Showing {courses.length} courses in catalog</span>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card assessment-modal-card modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Add New University Course</h3>
              <button
                type="button"
                className="alert-close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="create-course-code">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    id="create-course-code"
                    className="form-control"
                    placeholder="e.g. BCA301"
                    value={createForm.courseCode}
                    onChange={(e) => setCreateForm({ ...createForm, courseCode: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="create-course-name">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    id="create-course-name"
                    className="form-control"
                    placeholder="e.g. Database Management Systems"
                    value={createForm.courseName}
                    onChange={(e) => setCreateForm({ ...createForm, courseName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="create-dept">
                    Department *
                  </label>
                  <select
                    id="create-dept"
                    className="form-control"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                  >
                    {departmentList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="create-sem">
                    Semester *
                  </label>
                  <input
                    type="number"
                    id="create-sem"
                    className="form-control"
                    min="1"
                    max="12"
                    value={createForm.semester}
                    onChange={(e) => setCreateForm({ ...createForm, semester: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="create-credits">
                    Credits *
                  </label>
                  <input
                    type="number"
                    id="create-credits"
                    className="form-control"
                    min="1"
                    max="10"
                    value={createForm.credits}
                    onChange={(e) => setCreateForm({ ...createForm, credits: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="create-instructor">
                    Assign Faculty Instructor (Optional)
                  </label>
                  <select
                    id="create-instructor"
                    className="form-control"
                    value={createForm.instructorId}
                    onChange={(e) => setCreateForm({ ...createForm, instructorId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {facultyList
                      .filter((f) => f.status === 'ACTIVE')
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.department} &bull; {f.facultyId})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submittingCreate}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingCreate}>
                  {submittingCreate ? 'Creating Course...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editCourse && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="card assessment-modal-card modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Edit Course &mdash; {editCourse.courseCode}</h3>
              <button
                type="button"
                className="alert-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-course-name">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    id="edit-course-name"
                    className="form-control"
                    value={editForm.courseName}
                    onChange={(e) => setEditForm({ ...editForm, courseName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-course-dept">
                    Department *
                  </label>
                  <select
                    id="edit-course-dept"
                    className="form-control"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  >
                    {departmentList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-course-sem">
                    Semester *
                  </label>
                  <input
                    type="number"
                    id="edit-course-sem"
                    className="form-control"
                    min="1"
                    max="12"
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-course-credits">
                    Credits *
                  </label>
                  <input
                    type="number"
                    id="edit-course-credits"
                    className="form-control"
                    min="1"
                    max="10"
                    value={editForm.credits}
                    onChange={(e) => setEditForm({ ...editForm, credits: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-instructor">
                    Faculty Instructor
                  </label>
                  <select
                    id="edit-instructor"
                    className="form-control"
                    value={editForm.instructorId}
                    onChange={(e) => setEditForm({ ...editForm, instructorId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {facultyList
                      .filter((f) => f.status === 'ACTIVE')
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.department} &bull; {f.facultyId})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={submittingEdit}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingEdit}>
                  {submittingEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign / Reassign Faculty Modal */}
      {assignModalCourse && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setAssignModalCourse(null)}
        >
          <div
            className="card assessment-modal-card modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Assign Faculty to {assignModalCourse.courseCode}</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {assignModalCourse.courseName} &bull; Sem {assignModalCourse.semester} ({assignModalCourse.department})
                </p>
              </div>
              <button
                type="button"
                className="alert-close-btn"
                onClick={() => setAssignModalCourse(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAssignFaculty}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Current Instructor:</span>
                  <strong style={{ fontSize: '0.95rem', color: assignModalCourse.instructorId ? 'var(--accent-faculty)' : 'var(--text-muted)' }}>
                    {assignModalCourse.instructorId ? `👨‍🏫 ${assignModalCourse.instructorName}` : 'None (Unassigned)'}
                  </strong>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="select-assign-faculty">
                    Select Teaching Faculty Member:
                  </label>
                  <select
                    id="select-assign-faculty"
                    className="form-control"
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                  >
                    <option value="">-- Unassigned (No Instructor) --</option>
                    {facultyList
                      .filter((f) => f.status === 'ACTIVE')
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.department} &bull; ID: {f.facultyId})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssignModalCourse(null)}
                  disabled={submittingAssign}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingAssign}>
                  {submittingAssign ? 'Saving...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
