import React from 'react';

export default function Navbar({ currentUser, onLogout }) {
  const handleToggleMobile = () => {
    window.dispatchEvent(new CustomEvent('unicore:toggle-sidebar'));
  };

  return (
    <header className="unicore-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Mobile menu toggle trigger */}
        {currentUser && (
          <button
            type="button"
            className="sidebar-mobile-toggle-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem',
              borderRadius: '0.75rem',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              color: 'var(--on-surface)',
              cursor: 'pointer',
            }}
            onClick={handleToggleMobile}
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              menu
            </span>
          </button>
        )}

        {/* UniCore Brand Mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/unicore-logo.png"
            alt="UniCore Logo"
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'contain',
              borderRadius: '8px',
              filter: 'drop-shadow(0 3px 8px rgba(99, 91, 255, 0.35))',
            }}
          />
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: 'var(--on-surface)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                display: 'block',
              }}
            >
              UNICORE
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              University ERP System
            </span>
          </div>
        </div>

        {/* Academic Year Badge */}
        <div
          className="hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(99, 91, 255, 0.08)',
            border: '1px solid rgba(99, 91, 255, 0.15)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--primary)',
            marginLeft: '0.75rem',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
            calendar_month
          </span>
          <span>AY 2025–2026 Session</span>
        </div>
      </div>

      {currentUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Notifications Bell */}
          <button
            type="button"
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            title="Notifications"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              notifications
            </span>
            <span
              style={{
                position: 'absolute',
                top: '7px',
                right: '7px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--accent-rose)',
                border: '1.5px solid #ffffff',
              }}
            ></span>
          </button>

          {/* User Profile Chip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              paddingLeft: '0.5rem',
              borderLeft: '1px solid rgba(226, 232, 240, 0.8)',
            }}
          >
            <div style={{ position: 'relative' }}>
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
                  fontSize: '0.85rem',
                  boxShadow: '0 2px 8px rgba(13, 80, 213, 0.25)',
                }}
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald)',
                  border: '1.5px solid #ffffff',
                }}
              ></span>
            </div>

            <div className="hide-on-mobile" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.15 }}>
                {currentUser.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                <span className={`badge badge-${currentUser.role}`} style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}>
                  {currentUser.role}
                </span>
                {currentUser.department && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{currentUser.department}</span>
                )}
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              style={{
                marginLeft: '0.5rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                borderRadius: '8px',
              }}
              onClick={onLogout}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                logout
              </span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
