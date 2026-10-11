import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentProfile({ currentUser }) {
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
      const res = await api.getMyStudentProfile();
      setProfile(res);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading student profile...</div>;
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

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">My Student Profile</h1>
          <p className="student-page-subtitle">Official university student record verified against admission roster.</p>
        </div>
        <span className="roster-verified-badge">✓ Roster Verified Record</span>
      </div>

      <div className="profile-details-grid">
        <div className="card profile-card-main">
          <div className="profile-header-meta">
            <div className="profile-avatar-large">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="profile-name-title">{currentUser?.name}</h2>
              <span className="profile-email-text">{currentUser?.email}</span>
              <div className="profile-badge-row">
                <span className="badge badge-STUDENT">Role: Student</span>
                <span className="badge badge-good">Status: Active</span>
              </div>
            </div>
          </div>

          <div className="profile-specs-table">
            <div className="spec-row">
              <span className="spec-label">Student Identification (Roll No.)</span>
              <span className="spec-value highlight">{profile?.studentId}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Academic Department</span>
              <span className="spec-value">{currentUser?.department}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Current Semester</span>
              <span className="spec-value">Semester {profile?.currentSemester}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Academic Year Level</span>
              <span className="spec-value">{profile?.derivedYear}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Admission Year</span>
              <span className="spec-value">{profile?.admissionYear}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Registration Authority</span>
              <span className="spec-value">UniCore Approved Admission Roster</span>
            </div>
          </div>
        </div>

        <div className="profile-side-box">
          <div className="card">
            <h4>Academic Standing Note</h4>
            <p className="side-note-text">
              This record is managed centrally by institutional administrators. Roster fields (Student ID, Department, Admission Year) are synchronized with university databases.
            </p>
            <div className="info-box-pill">
              <strong>Need to update details?</strong>
              <span>Contact the Academic Registrar office for corrections or official changes.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
