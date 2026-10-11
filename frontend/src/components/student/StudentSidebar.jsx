import React, { useState, useEffect, useRef } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'profile', label: 'My Profile', icon: 'account_circle' },
  { id: 'attendance', label: 'Attendance', icon: 'fact_check' },
  { id: 'academic', label: 'Academic Performance', icon: 'analytics' },
  { id: 'results', label: 'Semester Results', icon: 'history_edu' },
  { id: 'advisor', label: 'AI Advisor', icon: 'smart_toy', badge: 'Gemini' },
  { id: 'fees', label: 'Fees & Dues', icon: 'payments' },
  { id: 'documents', label: 'Documents', icon: 'folder_shared' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
];

export default function StudentSidebar({ activeTab, onTabChange, currentUser }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapseTimerRef = useRef(null);

  const studentProfile = currentUser?.studentProfile;

  // Listen to mobile menu toggle event dispatched by Navbar
  useEffect(() => {
    const handleToggle = () => {
      setMobileOpen((prev) => !prev);
    };
    window.addEventListener('unicore:toggle-sidebar', handleToggle);
    return () => {
      window.removeEventListener('unicore:toggle-sidebar', handleToggle);
    };
  }, []);

  // Smooth hover expansion & delayed collapse
  const handleMouseEnter = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
    }
    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 220); // 220ms graceful delay before collapse
  };

  const handleNavClick = (tabId) => {
    onTabChange(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* 1. Left Edge Hover Trigger Zone (Desktop) */}
      <div
        className="sidebar-trigger-zone hide-on-mobile"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-hidden="true"
      />

      {/* 2. Desktop Collapsible Glass Sidebar */}
      <aside
        className={`unicore-sidebar hide-on-mobile ${isExpanded ? 'expanded' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Student Portal Navigation"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, minHeight: 0 }}>
          {/* Brand Mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0 0.5rem', flexShrink: 0 }}>
            <img
              src="/unicore-logo.png"
              alt="UniCore Emblem"
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                borderRadius: '10px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 3px 8px rgba(99, 91, 255, 0.35))',
              }}
            />
            <div className="sidebar-label" style={{ overflow: 'hidden' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: 'var(--on-surface)',
                  display: 'block',
                  lineHeight: 1.15,
                }}
              >
                UNICORE
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Student Portal
              </span>
            </div>
          </div>

          {/* Student Profile Quick Chip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'rgba(241, 245, 249, 0.7)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0d50d5, #493ee5)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="sidebar-label" style={{ overflow: 'hidden' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--on-surface)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {currentUser?.name || 'Sanjai Karthikeyan'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                {studentProfile?.studentId || 'BCA-STU-001'}
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <nav
            className="sidebar-nav-container"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
            <div className="sidebar-label" style={{ padding: '0.25rem 0.65rem', marginBottom: '0.2rem', flexShrink: 0 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Main Navigation
              </span>
            </div>

            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label} // Native tooltip when sidebar is collapsed
                >
                  <span className="nav-icon material-symbols-outlined">
                    {item.icon}
                  </span>
                  <span className="sidebar-label" style={{ flex: 1 }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="sidebar-label"
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #b1006a, #493ee5)',
                        color: '#ffffff',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Collapsible Lower Section (Semester Progress Widget) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            className="sidebar-collapsed-hide"
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-xl)',
              background: '#f8f9fd',
              border: '1px solid rgba(226, 232, 240, 0.9)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)' }}>Spring Term</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--success)', background: '#ecfdf5', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>
                Active
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', borderRadius: '9999px', background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, #493ee5, #0d50d5)', borderRadius: '9999px' }}></div>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
              Week 11 of 16 (68% Complete)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
            <span className="sidebar-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              UniCore ERP v1.0
            </span>
            <span
              style={{
                width: '8px',
                height: '8px',
                minWidth: '8px',
                borderRadius: '50%',
                background: 'var(--success)',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
              }}
              title="Portal Connected"
            ></span>
          </div>
        </div>
      </aside>

      {/* 3. Mobile / Tablet Slide-Over Drawer Navigation */}
      {mobileOpen && (
        <>
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="mobile-drawer open" aria-label="Mobile Navigation">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Mobile Drawer Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #493ee5, #635bff)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  school
                </span>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)' }}>
                  UniCore
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Student Portal</span>
              </div>
            </div>

            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close Navigation Menu"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                close
              </span>
            </button>
          </div>

          {/* Student Info in Mobile Drawer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#f8f9fd', borderRadius: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0d50d5, #493ee5)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>{currentUser?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{studentProfile?.studentId || 'Student'}</div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="sidebar-nav-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  style={{ width: '100%' }}
                >
                  <span className="nav-icon material-symbols-outlined">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #b1006a, #493ee5)',
                        color: '#ffffff',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          UniCore ERP v1.0 • Connected
        </div>
      </aside>
      </>
      )}
    </>
  );
}
