import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function FacultyProfile({ currentUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMyFacultyProfile();
      setProfile(res);
    } catch (err) {
      setError(err.message || 'Failed to load faculty profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading faculty profile...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading profile:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadProfile} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const facultyId = profile?.facultyId || currentUser?.facultyProfile?.facultyId || 'Faculty';

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Faculty Profile</h1>
          <p className="student-page-subtitle">Official university faculty instructor record verified against faculty roster.</p>
        </div>
        <span className="badge-faculty-verified">✓ Roster Verified Faculty</span>
      </div>

      <div className="profile-details-grid">
        <div className="card profile-card-main">
          <div className="profile-header-meta">
            <div className="faculty-avatar-large">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <h2 className="profile-name-title">{currentUser?.name}</h2>
              <span className="profile-email-text">{currentUser?.email}</span>
              <div className="profile-badge-row">
                <span className="badge badge-FACULTY">Role: Faculty</span>
                <span className="badge badge-good">Status: Active</span>
              </div>
            </div>
          </div>

          <div className="profile-specs-table">
            <div className="spec-row">
              <span className="spec-label">Faculty Identification (ID)</span>
              <span className="spec-value highlight">{facultyId}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Academic Department</span>
              <span className="spec-value">{currentUser?.department}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Institutional Designation</span>
              <span className="spec-value">Course Instructor &amp; Evaluator</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Registered Email</span>
              <span className="spec-value">{currentUser?.email}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Registration Authority</span>
              <span className="spec-value">UniCore Approved Faculty Roster</span>
            </div>
          </div>
        </div>

        <div className="profile-side-box">
          <div className="card">
            <h4>Academic Policy Note</h4>
            <p className="side-note-text">
              Faculty members are assigned to department curricula. Cross-department records are isolated by institutional RBAC policies.
            </p>
            <div className="info-box-pill" style={{ borderLeftColor: 'var(--accent-faculty)' }}>
              <strong>Teaching Authorization</strong>
              <span>Authorized to conduct lectures, record course attendance, and evaluate academic assessments.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
