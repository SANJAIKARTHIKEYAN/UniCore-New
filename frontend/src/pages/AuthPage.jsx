import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AuthPage({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'student' | 'faculty'
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'faculty' | 'admin'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('bca.stu001@unicore.edu');
  const [loginPassword, setLoginPassword] = useState('Student@UniCore2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Student registration form state
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Faculty registration form state
  const [facultyId, setFacultyId] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    api.getDepartments()
      .then((data) => setDepartments(data || []))
      .catch(() => {});
  }, []);

  // Sync role tabs with email presets
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError(null);
    setSuccessMsg(null);
    if (role === 'student') {
      setLoginEmail('bca.stu001@unicore.edu');
      setLoginPassword('Student@UniCore2026');
    } else if (role === 'faculty') {
      setLoginEmail('bca.fac001@unicore.edu');
      setLoginPassword('Faculty@UniCore2026');
    } else if (role === 'admin') {
      setLoginEmail('admin@unicore.edu');
      setLoginPassword('Admin@UniCore2026');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(loginEmail, loginPassword);
      localStorage.setItem('unicore_token', data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.registerStudent(studentId, studentEmail, studentPassword);
      localStorage.setItem('unicore_token', data.token);
      setSuccessMsg(`Welcome, ${data.user.name}! Student account activated under ${data.user.department}.`);
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Student registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.registerFaculty(facultyId, facultyEmail, facultyPassword);
      localStorage.setItem('unicore_token', data.token);
      setSuccessMsg(`Welcome, ${data.user.name}! Faculty account activated under ${data.user.department}.`);
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Faculty registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unicore-auth-screen">
      {/* Top University Brand Bar */}
      <header className="unicore-auth-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src="/unicore-logo.png"
            alt="UniCore Emblem"
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'contain',
              borderRadius: '10px',
              filter: 'drop-shadow(0 4px 10px rgba(99, 91, 255, 0.3))',
            }}
          />
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--on-surface)',
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1.15,
              }}
            >
              UNICORE
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              University ERP System
            </span>
          </div>
        </div>

        {/* Academic Session & Helpdesk */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '9999px',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              fontSize: '0.78rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>
              calendar_month
            </span>
            <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>2025–2026 Session</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '9999px', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
            onClick={() => {
              setError(null);
              setSuccessMsg('UniCore Institutional Helpdesk: Contact support@unicore.edu or ext. 4402.');
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
              support_agent
            </span>
            <span>Helpdesk</span>
          </button>
        </div>
      </header>

      {/* Main Focus: Large, Visually Dominant UniCore Authentication Card */}
      <main className="unicore-auth-body">
        <div className="unicore-auth-card">
          {/* Prominent Logo & Heading Section */}
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                position: 'relative',
              }}
            >
              <img
                src="/unicore-logo.png"
                alt="UniCore Logo"
                style={{
                  width: '96px',
                  height: '96px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 24px rgba(99, 91, 255, 0.35))',
                }}
              />
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.6rem',
                fontWeight: 800,
                color: 'var(--on-surface)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '0.65rem',
              }}
            >
              Welcome to{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #493ee5, #0d50d5, #b1006a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                UniCore
              </span>
            </h1>
            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              Sign in to access your university dashboard and services.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
              paddingBottom: '0.65rem',
            }}
          >
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.5rem 0.85rem',
                fontSize: '0.95rem',
                fontWeight: activeTab === 'login' ? 700 : 500,
                color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'login' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setSuccessMsg(null);
              }}
            >
              Portal Login
            </button>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.5rem 0.85rem',
                fontSize: '0.95rem',
                fontWeight: activeTab === 'student' ? 700 : 500,
                color: activeTab === 'student' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'student' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onClick={() => {
                setActiveTab('student');
                setError(null);
                setSuccessMsg(null);
              }}
            >
              Student Activation
            </button>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.5rem 0.85rem',
                fontSize: '0.95rem',
                fontWeight: activeTab === 'faculty' ? 700 : 500,
                color: activeTab === 'faculty' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'faculty' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onClick={() => {
                setActiveTab('faculty');
                setError(null);
                setSuccessMsg(null);
              }}
            >
              Faculty Registration
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', padding: '0.85rem 1.15rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', padding: '0.85rem 1.15rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* PORTAL LOGIN VIEW */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* Scaled Role Selector Tabs */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.65rem',
                  }}
                >
                  Select University Role
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    padding: '0.35rem',
                    background: 'rgba(241, 245, 249, 0.8)',
                    borderRadius: '16px',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                  }}
                >
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.85rem 0.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.925rem',
                      fontWeight: selectedRole === 'student' ? 800 : 600,
                      background: selectedRole === 'student' ? '#ffffff' : 'transparent',
                      color: selectedRole === 'student' ? 'var(--primary)' : 'var(--text-secondary)',
                      boxShadow: selectedRole === 'student' ? '0 4px 12px rgba(99, 91, 255, 0.15)' : 'none',
                      transition: 'var(--transition)',
                    }}
                    onClick={() => handleRoleSelect('student')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      school
                    </span>
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.85rem 0.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.925rem',
                      fontWeight: selectedRole === 'faculty' ? 800 : 600,
                      background: selectedRole === 'faculty' ? '#ffffff' : 'transparent',
                      color: selectedRole === 'faculty' ? 'var(--secondary)' : 'var(--text-secondary)',
                      boxShadow: selectedRole === 'faculty' ? '0 4px 12px rgba(13, 80, 213, 0.15)' : 'none',
                      transition: 'var(--transition)',
                    }}
                    onClick={() => handleRoleSelect('faculty')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      groups
                    </span>
                    <span>Faculty &amp; Staff</span>
                  </button>

                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.85rem 0.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.925rem',
                      fontWeight: selectedRole === 'admin' ? 800 : 600,
                      background: selectedRole === 'admin' ? '#ffffff' : 'transparent',
                      color: selectedRole === 'admin' ? 'var(--tertiary)' : 'var(--text-secondary)',
                      boxShadow: selectedRole === 'admin' ? '0 4px 12px rgba(177, 0, 106, 0.15)' : 'none',
                      transition: 'var(--transition)',
                    }}
                    onClick={() => handleRoleSelect('admin')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      admin_panel_settings
                    </span>
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Institutional Email / Username Field */}
              <div>
                <label
                  className="form-label"
                  style={{
                    display: 'block',
                    fontSize: '0.925rem',
                    fontWeight: 700,
                    color: 'var(--on-surface)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Institutional Email / Username
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: 'absolute',
                      left: '1.15rem',
                      color: 'var(--text-muted)',
                      fontSize: '22px',
                      pointerEvents: 'none',
                    }}
                  >
                    alternate_email
                  </span>
                  <input
                    type="text"
                    className="form-input"
                    style={{
                      paddingLeft: '3.25rem',
                      height: '3.6rem',
                      fontSize: '1.05rem',
                      borderRadius: '14px',
                      background: '#ffffff',
                    }}
                    placeholder="e.g. bca.stu001@unicore.edu"
                    required
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (error) setError(null);
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label
                    className="form-label"
                    style={{
                      fontSize: '0.925rem',
                      fontWeight: 700,
                      color: 'var(--on-surface)',
                      marginBottom: 0,
                    }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onClick={() => {
                      setSuccessMsg(null);
                      setError('For password resets, contact the institutional registrar: registrar@unicore.edu.');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: 'absolute',
                      left: '1.15rem',
                      color: 'var(--text-muted)',
                      fontSize: '22px',
                      pointerEvents: 'none',
                    }}
                  >
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{
                      paddingLeft: '3.25rem',
                      paddingRight: '3.25rem',
                      height: '3.6rem',
                      fontSize: '1.05rem',
                      borderRadius: '14px',
                      background: '#ffffff',
                    }}
                    placeholder="Enter your password"
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (error) setError(null);
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.25rem',
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Meta Row: Keep Me Signed In + Passkey */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--on-surface)', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Keep me signed in for 30 days</span>
                </label>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSuccessMsg(null);
                    setError('Passkey authentication: Hardware key or WebAuthn is available via institutional SSO.');
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                    passkey
                  </span>
                  <span>Use Passkey</span>
                </button>
              </div>

              {/* Large Primary CTA Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  height: '3.75rem',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  borderRadius: '16px',
                  marginTop: '0.5rem',
                  boxShadow: '0 8px 24px rgba(99, 91, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                }}
                disabled={loading}
              >
                <span>{loading ? 'Authenticating...' : 'Access UniCore'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  arrow_forward
                </span>
              </button>
            </form>
          )}

          {/* CONTROLLED STUDENT REGISTRATION VIEW */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="alert alert-info" style={{ fontSize: '0.9rem' }}>
                <strong>Controlled Student Self-Registration:</strong> Enter your Institutional Student ID and official College Email verified by admission records.
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Student ID (Roll Number)
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ height: '3.5rem', fontSize: '1.05rem', borderRadius: '14px' }}
                  placeholder="e.g. BCA-STU-001"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Official College Email
                </label>
                <input
                  type="email"
                  className="form-input"
                  style={{ height: '3.5rem', fontSize: '1.05rem', borderRadius: '14px' }}
                  placeholder="e.g. bca.stu001@unicore.edu"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Choose Password (min 6 characters)
                </label>
                <input
                  type="password"
                  className="form-input"
                  style={{ height: '3.5rem', fontSize: '1.05rem', borderRadius: '14px' }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ height: '3.75rem', fontSize: '1.1rem', fontWeight: 800, borderRadius: '16px', marginTop: '0.5rem' }}
              >
                {loading ? 'Verifying Admission Records...' : 'Activate Student Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                  onClick={() => setActiveTab('login')}
                >
                  &larr; Back to Portal Login
                </button>
              </div>
            </form>
          )}

          {/* CONTROLLED FACULTY REGISTRATION VIEW */}
          {activeTab === 'faculty' && (
            <form onSubmit={handleFacultyRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="alert alert-info" style={{ fontSize: '0.9rem' }}>
                <strong>Controlled Faculty Self-Registration:</strong> Enter your Faculty ID and official College Email verified by department records.
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Faculty ID
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ height: '3.5rem', fontSize: '1.05rem', borderRadius: '14px' }}
                  placeholder="e.g. BCA-FAC-001"
                  required
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Official College Email
                </label>
                <input
                  type="email"
                  className="form-input"
                  style={{ height: '3.5rem', fontSize: '1.05rem', borderRadius: '14px' }}
                  placeholder="e.g. bca.fac001@unicore.edu"
                  required
                  value={facultyEmail}
                  onChange={(e) => setFacultyEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Choose Password (min 6 characters)
                </label>
                <input
                  type="password"
                  className="form-input"
                  style={{ height: '3.5rem', fontSize: '1.05rem', borderRadius: '14px' }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={facultyPassword}
                  onChange={(e) => setFacultyPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ height: '3.75rem', fontSize: '1.1rem', fontWeight: 800, borderRadius: '16px', marginTop: '0.5rem' }}
              >
                {loading ? 'Verifying Department Records...' : 'Register Faculty Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                  onClick={() => setActiveTab('login')}
                >
                  &larr; Back to Portal Login
                </button>
              </div>
            </form>
          )}

          {/* Security & Compliance Footer */}
          <div
            style={{
              paddingTop: '1.75rem',
              borderTop: '1px solid rgba(226, 232, 240, 0.85)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.75rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>
                policy
              </span>
              <span style={{ fontWeight: 600 }}>FERPA &amp; UGC Compliant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                encrypted
              </span>
              <span style={{ fontWeight: 600 }}>256-bit TLS Encrypted</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
