import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

/**
 * Checks whether a notification is expired with precise date-only and timestamp boundary handling.
 * Avoids timezone and off-by-one errors:
 * - If expiry date is 2026-09-22 (stored as date-only / midnight), it remains valid until end of 2026-09-22 (23:59:59).
 * - It is strictly EXPIRED on 2026-09-23 or later.
 */
export const isNotificationExpired = (itemOrExpiresAt) => {
  if (!itemOrExpiresAt) return false;
  if (typeof itemOrExpiresAt === 'object' && typeof itemOrExpiresAt.isExpired === 'boolean') {
    return itemOrExpiresAt.isExpired;
  }
  const rawDateStr = typeof itemOrExpiresAt === 'object' ? itemOrExpiresAt.expiresAt : itemOrExpiresAt;
  if (!rawDateStr) return false;

  const expiry = new Date(rawDateStr);
  if (isNaN(expiry.getTime())) return false;

  const now = new Date();
  // Check if date-only (midnight 00:00:00)
  const isMidnight = (expiry.getHours() === 0 && expiry.getMinutes() === 0 && expiry.getSeconds() === 0);
  if (isMidnight) {
    // Valid through 23:59:59.999 of that calendar day
    const endOfDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate(), 23, 59, 59, 999);
    return now.getTime() > endOfDay.getTime();
  }
  return now.getTime() > expiry.getTime();
};

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'EXPIRED'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Read notifications tracking
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('unicore_read_notifs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentNotifications();
      setNotifications(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem('unicore_read_notifs', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save read notifications state', e);
      }
    }
  };

  const handleCardClick = (id) => {
    markAsRead(id);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem('unicore_read_notifs', JSON.stringify(allIds));
    } catch (e) {
      console.error('Failed to save read notifications state', e);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading announcements...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading notifications:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadNotifications} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'EXAM':
        return <span className="status-badge status-danger">Examination</span>;
      case 'FEE':
        return <span className="status-badge status-warning">Fee Notice</span>;
      case 'DEPARTMENT':
        return <span className="status-badge status-STUDENT">Department</span>;
      case 'ACADEMIC':
        return <span className="status-badge status-info">Academic</span>;
      default:
        return <span className="status-badge status-secondary">General</span>;
    }
  };

  // Compute status counts
  const activeCount = notifications.filter((n) => !isNotificationExpired(n)).length;
  const expiredCount = notifications.filter((n) => isNotificationExpired(n)).length;
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id) && !isNotificationExpired(n)).length;

  // Filter list by Category and Status
  const filteredNotifs = notifications.filter((item) => {
    const expired = isNotificationExpired(item);
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (statusFilter === 'ACTIVE' && expired) return false;
    if (statusFilter === 'EXPIRED' && !expired) return false;
    return true;
  });

  return (
    <div className="student-page">
      <div className="page-header-row" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <h1 className="student-page-title">Notifications &amp; Bulletins</h1>
          <p className="student-page-subtitle">Official announcements, examination notices, and departmental alerts.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleMarkAllAsRead}
              title="Mark all notifications as read"
              style={{ fontSize: '0.78rem' }}
            >
              ✓ Mark All as Read ({unreadCount})
            </button>
          )}
          <span className="badge badge-STUDENT">
            {activeCount} Active &bull; {expiredCount} Expired
          </span>
        </div>
      </div>

      {/* Filter Toolbar: Status Filter Pills + Category Tabs */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginRight: '0.2rem', fontWeight: 600 }}>
              Status:
            </span>
            <button
              type="button"
              className={`tab-button ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '4px' }}
            >
              All Records ({notifications.length})
            </button>
            <button
              type="button"
              className={`tab-button ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ACTIVE')}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '4px' }}
            >
              Active Only ({activeCount})
            </button>
            <button
              type="button"
              className={`tab-button ${statusFilter === 'EXPIRED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('EXPIRED')}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '4px' }}
            >
              Expired Archive ({expiredCount})
            </button>
          </div>

          {/* Category Tabs */}
          <div className="tab-group" style={{ marginBottom: 0, padding: '0.15rem' }}>
            {['ALL', 'EXAM', 'FEE', 'DEPARTMENT', 'GENERAL'].map((type) => (
              <button
                key={type}
                type="button"
                className={`tab-button ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                {type === 'ALL' ? 'All Categories' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              No notifications match the selected filter criteria.
            </p>
          </div>
        ) : (
          filteredNotifs.map((item) => {
            const expired = isNotificationExpired(item);
            const isRead = readIds.includes(item.id);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`card notif-card ${expired ? 'notif-card-expired' : ''} ${!isRead ? 'notif-card-unread' : ''}`}
                onClick={() => handleCardClick(item.id)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: expired ? 0.78 : 1,
                  borderLeft: expired
                    ? '3px solid rgba(239, 68, 68, 0.6)'
                    : !isRead
                    ? '3px solid var(--cyber-cyan, #00f2fe)'
                    : '3px solid rgba(255, 255, 255, 0.1)',
                  background: !isRead && !expired
                    ? 'rgba(0, 242, 254, 0.03)'
                    : undefined,
                }}
              >
                <div className="notif-header-row">
                  <div className="notif-title-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {getTypeBadge(item.type)}

                    {/* Expiry / Active Status Badge */}
                    {expired ? (
                      <span
                        className="status-badge status-danger"
                        style={{
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        EXPIRED
                      </span>
                    ) : (
                      <span className="status-badge status-good">
                        Active
                      </span>
                    )}

                    {/* Unread indicator */}
                    {!isRead && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--cyber-cyan, #00f2fe)',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <span style={{ fontSize: '0.65rem' }}>●</span> Unread
                      </span>
                    )}

                    <h3 className="notif-title" style={{ margin: 0, fontSize: '0.98rem' }}>{item.title}</h3>
                  </div>

                  <span className="notif-date" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <p
                  className="notif-body"
                  style={{
                    margin: '0.5rem 0 0.6rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    color: expired ? '#94a3b8' : '#e2e8f0',
                  }}
                >
                  {item.message}
                </p>

                <div
                  className="notif-footer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '0.45rem',
                  }}
                >
                  <div>
                    {item.expiresAt ? (
                      expired ? (
                        <span style={{ color: '#ef4444' }}>
                          ⚠️ Expired on: <strong>{new Date(item.expiresAt).toLocaleDateString()}</strong>
                        </span>
                      ) : (
                        <span>
                          Valid until: <strong>{new Date(item.expiresAt).toLocaleDateString()}</strong>
                        </span>
                      )
                    ) : (
                      <span>Standing institutional notice (No expiry)</span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                    {isRead ? '✓ Read' : 'Click to mark read'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
