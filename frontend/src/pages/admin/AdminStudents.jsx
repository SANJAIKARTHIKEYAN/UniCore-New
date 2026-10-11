import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const DEPARTMENTS = ['BCA', 'BSCS', 'BCOM', 'BBA', 'BSM'];

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'BCA',
    studentId: '',
    admissionYear: new Date().getFullYear(),
    currentSemester: 1,
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    status: 'ACTIVE',
    currentSemester: 1,
    admissionYear: 2024,
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async (query = search) => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.getAdminStudents(query);
      setStudents(res || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load students.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudents(search);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAdd(true);
      setFeedback(null);
      const res = await api.createAdminStudent({
        ...addForm,
        admissionYear: Number(addForm.admissionYear),
        currentSemester: Number(addForm.currentSemester),
      });
      setStudents((prev) => [res, ...prev]);
      setShowAddModal(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        department: 'BCA',
        studentId: '',
        admissionYear: new Date().getFullYear(),
        currentSemester: 1,
      });
      const enrollNotice = res.enrollmentMessage
        ? ` ${res.enrollmentMessage}`
        : (res.enrolledCoursesCount > 0 ? ` Automatically enrolled into ${res.enrolledCoursesCount} course(s).` : '');
      setFeedback({
        type: 'success',
        message: `Student "${res.name}" successfully created with ID ${res.studentId}.${enrollNotice}`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create student.' });
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleEditClick = (student) => {
    setEditStudent(student);
    setEditForm({
      name: student.name || '',
      department: student.department || 'BCA',
      status: student.status || 'ACTIVE',
      currentSemester: student.currentSemester || 1,
      admissionYear: student.admissionYear || 2024,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editStudent) return;
    try {
      setSubmittingEdit(true);
      setFeedback(null);
      const res = await api.updateAdminStudent(editStudent.id, {
        ...editForm,
        currentSemester: Number(editForm.currentSemester),
        admissionYear: Number(editForm.admissionYear),
      });
      setStudents((prev) => prev.map((s) => (s.id === editStudent.id ? res : s)));
      setShowEditModal(false);
      setEditStudent(null);
      setFeedback({ type: 'success', message: `Student "${res.name}" updated successfully.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update student.' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeactivate = async (student) => {
    const isDeactivating = student.status === 'ACTIVE';
    const confirmMessage = isDeactivating
      ? `Are you sure you want to deactivate student ${student.name} (${student.studentId})? They will no longer be able to log in.`
      : `Reactivate student ${student.name}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setFeedback(null);
      if (isDeactivating) {
        await api.deleteAdminStudent(student.id);
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, status: 'INACTIVE' } : s))
        );
        setFeedback({ type: 'success', message: `Student ${student.name} has been deactivated.` });
      } else {
        const res = await api.updateAdminStudent(student.id, { status: 'ACTIVE' });
        setStudents((prev) => prev.map((s) => (s.id === student.id ? res : s)));
        setFeedback({ type: 'success', message: `Student ${student.name} has been reactivated.` });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Action failed.' });
    }
  };

  const filteredStudents = students.filter((s) => {
    if (selectedDept && s.department !== selectedDept) return false;
    return true;
  });

  return (
    <div className="student-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Student Account Management</h1>
          <p className="student-page-subtitle">
            Create, search, update academic details, and manage lifecycle status of all enrolled students.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Student
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

      {/* Search & Filter Toolbar */}
      <div className="card attendance-filter-card" style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} className="admin-filter-bar">
          <div className="filter-group" style={{ flex: '1 1 300px' }}>
            <label className="form-label" htmlFor="student-search-input">
              Search by Name, Email, or Student ID:
            </label>
            <div className="date-input-wrapper">
              <input
                type="text"
                id="student-search-input"
                className="form-control"
                placeholder="e.g. Sanjai, bca.stu001, BCA-STU-001..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                🔍 Search
              </button>
              {search && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearch('');
                    loadStudents('');
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="filter-group" style={{ minWidth: '180px' }}>
            <label className="form-label" htmlFor="student-dept-select">
              Filter by Department:
            </label>
            <select
              id="student-dept-select"
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments ({students.length})</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading student records...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">👨‍🎓</span>
          <h3>No Students Found</h3>
          <p>No student accounts match your filter criteria.</p>
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
                  <th>Email Address</th>
                  <th>Department</th>
                  <th>Semester / Year</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', width: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="text-secondary">{idx + 1}</td>
                    <td>
                      <span className="reg-number-pill">{s.studentId}</span>
                    </td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td className="text-secondary">{s.email}</td>
                    <td>
                      <span className="badge badge-secondary">{s.department}</span>
                    </td>
                    <td>
                      Sem {s.currentSemester} &bull; {s.derivedYear}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.status === 'ACTIVE'
                            ? 'badge-attendance-present'
                            : 'badge-attendance-absent'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-action-btn-group">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditClick(s)}
                          title="Edit Student Information"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            s.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'
                          }`}
                          onClick={() => handleDeactivate(s)}
                          title={s.status === 'ACTIVE' ? 'Deactivate Student Account' : 'Reactivate Student Account'}
                        >
                          {s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer-strip">
            <span>Showing {filteredStudents.length} of {students.length} total students</span>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card assessment-modal-card modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Register New Student Account</h3>
              <button type="button" className="alert-close-btn" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
          <form onSubmit={handleAddSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="add-name">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="add-name"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-email">
                  University Email *
                </label>
                <input
                  type="email"
                  id="add-email"
                  className="form-control"
                  placeholder="e.g. john.doe@unicore.edu"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-id">
                  Student ID / Roll No *
                </label>
                <input
                  type="text"
                  id="add-id"
                  className="form-control"
                  placeholder="e.g. BCA-STU-010"
                  value={addForm.studentId}
                  onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-dept">
                  Department *
                </label>
                <select
                  id="add-dept"
                  className="form-control"
                  value={addForm.department}
                  onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-year">
                  Admission Year *
                </label>
                <input
                  type="number"
                  id="add-year"
                  className="form-control"
                  min="2000"
                  value={addForm.admissionYear}
                  onChange={(e) => setAddForm({ ...addForm, admissionYear: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-sem">
                  Current Semester *
                </label>
                <input
                  type="number"
                  id="add-sem"
                  className="form-control"
                  min="1"
                  max="12"
                  value={addForm.currentSemester}
                  onChange={(e) => setAddForm({ ...addForm, currentSemester: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-pwd">
                  Initial Password (Optional)
                </label>
                <input
                  type="password"
                  id="add-pwd"
                  className="form-control"
                  placeholder="Defaults to UniCore@2026"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={submittingAdd}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingAdd}>
                {submittingAdd ? 'Creating Student...' : 'Create Student'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editStudent && (
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
              <h3>Edit Student &mdash; {editStudent.name} ({editStudent.studentId})</h3>
              <button type="button" className="alert-close-btn" onClick={() => setShowEditModal(false)}>
                &times;
              </button>
            </div>
          <form onSubmit={handleEditSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-dept">
                  Department *
                </label>
                <select
                  id="edit-dept"
                  className="form-control"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-sem">
                  Current Semester *
                </label>
                <input
                  type="number"
                  id="edit-sem"
                  className="form-control"
                  min="1"
                  max="12"
                  value={editForm.currentSemester}
                  onChange={(e) => setEditForm({ ...editForm, currentSemester: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-year">
                  Admission Year *
                </label>
                <input
                  type="number"
                  id="edit-year"
                  className="form-control"
                  min="2000"
                  value={editForm.admissionYear}
                  onChange={(e) => setEditForm({ ...editForm, admissionYear: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-status">
                  Account Status *
                </label>
                <select
                  id="edit-status"
                  className="form-control"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
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
    </div>
  );
}
