import React, { useState } from 'react';
import { api } from '../services/api';

export default function DashboardPreview({ currentUser, onLogout }) {
  const [testOutput, setTestOutput] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const runTest = async (testName, actionPromise) => {
    setTestLoading(true);
    setTestOutput(null);
    setTestStatus(null);
    try {
      const result = await actionPromise;
      setTestStatus('SUCCESS (200 OK)');
      setTestOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setTestStatus(`BLOCKED / ERROR (HTTP ${err.status || 500})`);
      setTestOutput(JSON.stringify(err.data || { error: err.message }, null, 2));
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Welcome, {currentUser.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Authenticated Session &amp; Role Authorization Verification
          </p>
        </div>
        <span className={`badge badge-${currentUser.role}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
          {currentUser.role}
        </span>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Profile Card */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Account Metadata (from Backend/DB)
          </h3>
          <div className="profile-field">
            <span className="field-label">User ID:</span>
            <span className="field-value">#{currentUser.id}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Full Name:</span>
            <span className="field-value">{currentUser.name}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Email:</span>
            <span className="field-value">{currentUser.email}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Department:</span>
            <span className="field-value">{currentUser.department}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Account Status:</span>
            <span className="field-value" style={{ color: 'var(--accent-student)' }}>{currentUser.status}</span>
          </div>

          {/* Student Specific Fields */}
          {currentUser.role === 'STUDENT' && currentUser.studentProfile && (
            <>
              <div className="profile-field" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="field-label">Student Roll ID:</span>
                <span className="field-value">{currentUser.studentProfile.studentId}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Admission Year:</span>
                <span className="field-value">{currentUser.studentProfile.admissionYear}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Current Semester:</span>
                <span className="field-value">Semester {currentUser.studentProfile.currentSemester}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Academic Year (Derived):</span>
                <span className="field-value" style={{ color: '#93c5fd', fontWeight: 600 }}>
                  {currentUser.studentProfile.derivedYear}
                </span>
              </div>
            </>
          )}

          {/* Faculty Specific Fields */}
          {currentUser.role === 'FACULTY' && currentUser.facultyProfile && (
            <div className="profile-field" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="field-label">Faculty ID:</span>
              <span className="field-value">{currentUser.facultyProfile.facultyId}</span>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Role Authorization Tests */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Authorization &amp; Isolation Boundary Tests
          </h3>

          {/* STUDENT TESTS */}
          {currentUser.role === 'STUDENT' && (
            <>
              <div className="test-action-card">
                <h4>Test 1: View My Student Profile</h4>
                <p>Fetches own record through /api/student/me/profile</p>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => runTest('Student Profile', api.getMyStudentProfile())}
                  disabled={testLoading}
                >
                  Query My Record
                </button>
              </div>

              <div className="test-action-card">
                <h4>Test 2: Access Another Student's Profile (Isolation Check)</h4>
                <p>Attempts to fetch ID #999 or another student's record through /api/student/profile/999</p>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#fca5a5' }}
                  onClick={() => runTest('Other Student Access', api.getStudentProfileById(999))}
                  disabled={testLoading}
                >
                  Simulate Unauthorized Student Access
                </button>
              </div>
            </>
          )}

          {/* FACULTY TESTS */}
          {currentUser.role === 'FACULTY' && (
            <>
              <div className="test-action-card">
                <h4>Test 1: Access My Department Roster</h4>
                <p>Queries students in '{currentUser.department}' (Permitted)</p>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => runTest('Own Dept Roster', api.getDepartmentStudents(currentUser.department))}
                  disabled={testLoading}
                >
                  Query My Department ({currentUser.department})
                </button>
              </div>

              <div className="test-action-card">
                <h4>Test 2: Access Another Department Roster (Isolation Check)</h4>
                <p>Attempts to query students in another department (Unauthorized)</p>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#fca5a5' }}
                  onClick={() => runTest('Cross Dept Access', api.getDepartmentStudents(currentUser.department === 'BCA' ? 'BSCS' : 'BCA'))}
                  disabled={testLoading}
                >
                  Simulate Cross-Department Access ({currentUser.department === 'BCA' ? 'BSCS' : 'BCA'})
                </button>
              </div>
            </>
          )}

          {/* ADMIN TESTS */}
          {currentUser.role === 'ADMIN' && (
            <>
              <div className="test-action-card">
                <h4>Admin Action 1: View Registered Accounts</h4>
                <p>Queries /api/admin/users</p>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => runTest('All Users', api.getAdminUsers())}
                  disabled={testLoading}
                >
                  Fetch All Registered Users
                </button>
              </div>

              <div className="test-action-card">
                <h4>Admin Action 2: View Approved Student Roster</h4>
                <p>Queries /api/admin/approved-students</p>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => runTest('Approved Students', api.getApprovedStudents())}
                  disabled={testLoading}
                >
                  Fetch Approved Student Roster
                </button>
              </div>

              <div className="test-action-card">
                <h4>Admin Action 3: View Approved Faculty Roster</h4>
                <p>Queries /api/admin/approved-faculty</p>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => runTest('Approved Faculty', api.getApprovedFaculty())}
                  disabled={testLoading}
                >
                  Fetch Approved Faculty Roster
                </button>
              </div>
            </>
          )}

          {/* Live API Response Display */}
          {testStatus && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: testStatus.includes('SUCCESS') ? 'var(--accent-student)' : 'var(--danger)' }}>
                Backend Response: {testStatus}
              </div>
              <pre className="code-output">{testOutput}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
