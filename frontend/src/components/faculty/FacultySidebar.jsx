import React, { useState, useEffect, useRef } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'courses', label: 'My Courses', icon: 'menu_book' },
  { id: 'roster', label: 'Student Roster', icon: 'groups' },
  { id: 'attendance', label: 'Attendance', icon: 'fact_check' },
  { id: 'assessments', label: 'Assessments', icon: 'assignment' },
  { id: 'risk', label: 'Risk Advisor (ML)', icon: 'psychology' },
  { id: 'profile', label: 'Faculty Profile', icon: 'account_circle' },
];

export default function FacultySidebar({ activeTab, onTabChange, currentUser }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapseTimerRef = useRef(null);

  const facultyProfile = currentUser?.facultyProfile;

  useEffect(() => {
    const handleToggle = () => {
      setMobileOpen((prev) => !prev);
    };
    window.addEventListener('unicore:toggle-sidebar', handleToggle);
    return () => {
      window.removeEventListener('unicore:toggle-sidebar', handleToggle);
    };
  }, []);

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
    }, 220);
  };

  const handleNavClick = (tabId) => {
    onTabChange(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Trigger Zone on Left Viewport Edge */}
      <div
        className="sidebar-trigger-zone hide-on-mobile"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-hidden="true"
      />

      {/* Desktop Collapsible Glass Sidebar */}
      <aside
        className={`unicore-sidebar hide-on-mobile ${isExpanded ? 'expanded' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Faculty Portal Navigation"
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
                filter: 'drop-shadow(0 3px 8px rgba(13, 80, 213, 0.35))',
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
              <span style={{ fontSize: '0.68rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Faculty Portal
              </span>
            </div>
          </div>

          {/* User Profile Card */}
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
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'F'}
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
                {currentUser?.name || 'Dr. K. Sharma'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                {facultyProfile?.facultyId || 'BCA-FAC-001'}
              </span>
              <div style={{ marginTop: '0.2rem' }}>
                <span className="badge badge-FACULTY" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {currentUser?.department || 'BCA'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
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
                Faculty Navigation
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
                  title={item.label}
                >
                  <span className="nav-icon material-symbols-outlined">{item.icon}</span>
                  <span className="sidebar-label" style={{ flex: 1 }}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
          <span className="sidebar-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            UniCore Faculty v1.0
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
            title="Faculty Engine Online"
          ></span>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <>
          <div className="mobile-drawer-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="mobile-drawer open" aria-label="Faculty Mobile Navigation">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--secondary)' }}>
                    school
                  </span>
                  <div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)' }}>
                      UniCore
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Faculty Portal</span>
                  </div>
                </div>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                    close
                  </span>
                </button>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                    >
                      <span className="nav-icon material-symbols-outlined">{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
