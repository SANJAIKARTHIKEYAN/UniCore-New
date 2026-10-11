import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const DEPARTMENTS = ['BCA', 'BSCS', 'BCOM', 'BBA', 'BSM'];

export default function AdminFaculty() {
  const [facultyList, setFacultyList] = useState([]);
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
    facultyId: '',
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    status: 'ACTIVE',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // View Assigned Courses Modal State
  const [coursesModalFaculty, setCoursesModalFaculty] = useState(null);
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async (query = search) => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.getAdminFaculty(query);
      setFacultyList(res || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load faculty members.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFaculty(search);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAdd(true);
      setFeedback(null);
      const res = await api.createAdminFaculty(addForm);
      setFacultyList((prev) => [res, ...prev]);
      setShowAddModal(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        department: 'BCA',
        facultyId: '',
      });
      setFeedback({ type: 'success', message: `Faculty member "${res.name}" created with ID ${res.facultyId}.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create faculty member.' });
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleEditClick = (faculty) => {
    setEditFaculty(faculty);
    setEditForm({
      name: faculty.name || '',
      department: faculty.department || 'BCA',
      status: faculty.status || 'ACTIVE',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFaculty) return;
    try {
      setSubmittingEdit(true);
      setFeedback(null);
      const res = await api.updateAdminFaculty(editFaculty.id, editForm);
      setFacultyList((prev) => prev.map((f) => (f.id === editFaculty.id ? res : f)));
      setShowEditModal(false);
      setEditFaculty(null);
      setFeedback({ type: 'success', message: `Faculty member "${res.name}" updated successfully.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update faculty member.' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeactivate = async (faculty) => {
    const isDeactivating = faculty.status === 'ACTIVE';
    const confirmMessage = isDeactivating
      ? `Are you sure you want to deactivate faculty member ${faculty.name} (${faculty.facultyId})? They will no longer be able to log in.`
      : `Reactivate faculty member ${faculty.name}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setFeedback(null);
      if (isDeactivating) {
        await api.deleteAdminFaculty(faculty.id);
        setFacultyList((prev) =>
          prev.map((f) => (f.id === faculty.id ? { ...f, status: 'INACTIVE' } : f))
        );
        setFeedback({ type: 'success', message: `Faculty ${faculty.name} has been deactivated.` });
      } else {
        const res = await api.updateAdminFaculty(faculty.id, { status: 'ACTIVE' });
        setFacultyList((prev) => prev.map((f) => (f.id === faculty.id ? res : f)));
        setFeedback({ type: 'success', message: `Faculty ${faculty.name} has been reactivated.` });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Action failed.' });
    }
  };

  const handleViewAssignedCourses = async (faculty) => {
    setCoursesModalFaculty(faculty);
    if (Array.isArray(faculty.assignedCourses)) {
      setFacultyCourses(faculty.assignedCourses);
    } else {
      setFacultyCourses([]);
    }

    try {
      setLoadingCourses(true);
      const res = await api.getAdminFacultyCourses(faculty.id);
      setFacultyCourses(res || []);
    } catch {
      // Keep preloaded assignedCourses if dedicated call fails
      if (Array.isArray(faculty.assignedCourses)) {
        setFacultyCourses(faculty.assignedCourses);
      }
    } finally {
      setLoadingCourses(false);
    }
  };

  const filteredFaculty = facultyList.filter((f) => {
    if (selectedDept && f.department !== selectedDept) return false;
    return true;
  });

  return (
    <div className="student-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Faculty Member Management</h1>
          <p className="student-page-subtitle">
            Register teaching staff, assign departmental affiliations, and manage instructor access.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Register Faculty
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

      {/* Toolbar */}
      <div className="card attendance-filter-card" style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} className="admin-filter-bar">
          <div className="filter-group" style={{ flex: 1, minWidth: '220px' }}>
            <label className="form-label" htmlFor="faculty-search-input">
              Search Faculty:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="faculty-search-input"
                type="text"
                className="form-control"
                placeholder="Search by name, faculty ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">
                Search
              </button>
              {search && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setSearch('');
                    loadFaculty('');
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="filter-group" style={{ minWidth: '180px' }}>
            <label className="form-label" htmlFor="faculty-dept-select">
              Filter by Department:
            </label>
            <select
              id="faculty-dept-select"
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments ({facultyList.length})</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Faculty Table */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading faculty members...</p>
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">👨‍🏫</span>
          <h3>No Faculty Members Found</h3>
          <p>No faculty accounts match your filter criteria.</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="unicore-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Faculty ID</th>
                  <th>Faculty Name</th>
                  <th>Email Address</th>
                  <th>Department</th>
                  <th>Assigned Courses</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', width: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map((f, idx) => (
                  <tr key={f.id}>
                    <td className="text-secondary">{idx + 1}</td>
                    <td>
                      <span className="reg-number-pill">{f.facultyId}</span>
                    </td>
                    <td>
                      <strong>{f.name}</strong>
                    </td>
                    <td className="text-secondary">{f.email}</td>
                    <td>
                      <span className="badge badge-secondary">{f.department}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="badge badge-FACULTY btn-assigned-courses"
                        style={{
                          cursor: 'pointer',
                          border: '1px solid rgba(139, 92, 246, 0.4)',
                          background: 'rgba(139, 92, 246, 0.15)',
                          color: '#c4b5fd',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                        }}
                        onClick={() => handleViewAssignedCourses(f)}
                        title={`View courses assigned to ${f.name}`}
                        aria-label={`View courses assigned to ${f.name}`}
                      >
                        📚 {(f.assignedCoursesCount !== undefined ? f.assignedCoursesCount : (f.assignedCourses?.length || 0))} Course{(f.assignedCoursesCount !== 1) ? 's' : ''}
                      </button>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          f.status === 'ACTIVE'
                            ? 'badge-attendance-present'
                            : 'badge-attendance-absent'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-action-btn-group">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditClick(f)}
                          title="Edit Faculty Information"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            f.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'
                          }`}
                          onClick={() => handleDeactivate(f)}
                          title={f.status === 'ACTIVE' ? 'Deactivate Faculty Account' : 'Reactivate Faculty Account'}
                        >
                          {f.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer-strip">
            <span>Showing {filteredFaculty.length} of {facultyList.length} total faculty members</span>
          </div>
        </div>
      )}

      {/* Assigned Courses Modal */}
      {coursesModalFaculty && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setCoursesModalFaculty(null)}
        >
          <div
            className="card assessment-modal-card modal-card"
            style={{ maxWidth: '680px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Assigned Courses &mdash; {coursesModalFaculty.name}</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ID: {coursesModalFaculty.facultyId} &bull; Dept: {coursesModalFaculty.department} &bull; Email: {coursesModalFaculty.email}
                </p>
              </div>
              <button
                type="button"
                className="alert-close-btn"
                onClick={() => setCoursesModalFaculty(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {loadingCourses ? (
              <div className="loading-container" style={{ padding: '2rem 1rem' }}>
                <div className="loading-spinner"></div>
                <p>Loading assigned courses...</p>
              </div>
            ) : facultyCourses.length === 0 ? (
              <div className="empty-state-card" style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                <span className="empty-icon" style={{ fontSize: '2.5rem' }}>📚</span>
                <h4 style={{ margin: '0.75rem 0 0.25rem', color: 'var(--text-primary)' }}>No courses assigned</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  This faculty member currently has no teaching course assignments.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Total Assigned: <strong>{facultyCourses.length}</strong> course{facultyCourses.length !== 1 ? 's' : ''}
                  </span>
                  <span className="badge badge-FACULTY">
                    Active Teaching Roster
                  </span>
                </div>
                <div className="table-responsive" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  <table className="unicore-table">
                    <thead>
                      <tr>
                        <th style={{ width: '120px' }}>Course Code</th>
                        <th>Course Name</th>
                        <th style={{ width: '90px' }}>Semester</th>
                        <th style={{ width: '80px' }}>Credits</th>
                        <th style={{ width: '90px' }}>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyCourses.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <span className="code-badge">{c.courseCode}</span>
                          </td>
                          <td>
                            <strong>{c.courseName}</strong>
                          </td>
                          <td>Sem {c.semester}</td>
                          <td>{c.credits} cr</td>
                          <td>
                            <span className="badge badge-secondary">{c.department}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="form-actions-row" style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCoursesModalFaculty(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
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
              <h3>Register New Faculty Member</h3>
              <button type="button" className="alert-close-btn" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="add-fac-name">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="add-fac-name"
                    className="form-control"
                    placeholder="e.g. Dr. Jane Smith"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="add-fac-email">
                    University Email *
                  </label>
                  <input
                    type="email"
                    id="add-fac-email"
                    className="form-control"
                    placeholder="e.g. jane.smith@unicore.edu"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="add-fac-id">
                    Faculty ID *
                  </label>
                  <input
                    type="text"
                    id="add-fac-id"
                    className="form-control"
                    placeholder="e.g. BCA-FAC-010"
                    value={addForm.facultyId}
                    onChange={(e) => setAddForm({ ...addForm, facultyId: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="add-fac-dept">
                    Department *
                  </label>
                  <select
                    id="add-fac-dept"
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
                  <label className="form-label" htmlFor="add-fac-pwd">
                    Initial Password (Optional)
                  </label>
                  <input
                    type="password"
                    id="add-fac-pwd"
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
                  {submittingAdd ? 'Creating Faculty...' : 'Create Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {showEditModal && editFaculty && (
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
              <h3>Edit Faculty &mdash; {editFaculty.name} ({editFaculty.facultyId})</h3>
              <button type="button" className="alert-close-btn" onClick={() => setShowEditModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-fac-name">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="edit-fac-name"
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-fac-dept">
                    Department *
                  </label>
                  <select
                    id="edit-fac-dept"
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
                  <label className="form-label" htmlFor="edit-fac-status">
                    Account Status *
                  </label>
                  <select
                    id="edit-fac-status"
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
