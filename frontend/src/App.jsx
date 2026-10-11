import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import DashboardPreview from './pages/DashboardPreview';
import StudentLayout from './components/student/StudentLayout';
import FacultyLayout from './components/faculty/FacultyLayout';
import AdminLayout from './components/admin/AdminLayout';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('unicore_token');
    if (token) {
      api.getCurrentUser()
        .then((user) => {
          setCurrentUser(user);
        })
        .catch(() => {
          localStorage.removeItem('unicore_token');
          setCurrentUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('unicore_token');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading UniCore Portal...</p>
      </div>
    );
  }

  const isStudent = currentUser?.role === 'STUDENT';
  const isFaculty = currentUser?.role === 'FACULTY';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isWideLayout = isStudent || isFaculty || isAdmin;

  return (
    <>
      {/* Ambient Lighting Layer */}
      <div className="ambient-orbitals" aria-hidden="true">
        <div className="orbital-blob-1"></div>
        <div className="orbital-blob-2"></div>
        <div className="orbital-blob-3"></div>
      </div>

      {!currentUser ? (
        <div className="unicore-auth-shell">
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </div>
      ) : (
        <div className="unicore-authenticated-app">
          <Navbar currentUser={currentUser} onLogout={handleLogout} />
          <div className="unicore-viewport-wrapper">
            {isStudent ? (
              <StudentLayout currentUser={currentUser} onLogout={handleLogout} />
            ) : isFaculty ? (
              <FacultyLayout currentUser={currentUser} onLogout={handleLogout} />
            ) : isAdmin ? (
              <AdminLayout currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <div className="student-portal-layout">
                <main className="student-portal-content">
                  <DashboardPreview currentUser={currentUser} onLogout={handleLogout} />
                </main>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
