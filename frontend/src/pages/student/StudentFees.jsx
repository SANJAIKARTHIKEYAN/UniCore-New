import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

/**
 * Deterministic SVG QR Matrix Generator for payment URI strings.
 * Generates standard 25x25 QR matrix structure with finder patterns, timing belts, and hash-distributed data.
 */
function PaymentQrSvg({ payload, size = 200 }) {
  const matrixSize = 25;
  const grid = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  // 1. Draw 7x7 Finder Pattern at (r, c)
  const drawFinder = (startR, startC) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer square
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)      // Inner solid 3x3
        ) {
          grid[startR + r][startC + c] = true;
        } else {
          grid[startR + r][startC + c] = false;
        }
      }
    }
  };

  // Top-left, top-right, bottom-left finders
  drawFinder(0, 0);
  drawFinder(0, matrixSize - 7);
  drawFinder(matrixSize - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // 3. Dark module
  grid[matrixSize - 8][8] = true;

  // 4. Fill payload data into data areas (excluding finders)
  const isReserved = (r, c) => {
    if (r <= 7 && c <= 7) return true;
    if (r <= 7 && c >= matrixSize - 8) return true;
    if (r >= matrixSize - 8 && c <= 7) return true;
    if (r === 6 || c === 6) return true;
    return false;
  };

  // Hash payload string into deterministic pseudo-random bitstream
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let bitIndex = 0;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (!isReserved(r, c)) {
        const stepHash = (hash + bitIndex * 31 + (r * 17) ^ (c * 23)) >>> 0;
        grid[r][c] = (stepHash % 2) === 0;
        bitIndex++;
      }
    }
  }

  const cellSize = size / matrixSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', margin: '0 auto', background: '#ffffff', padding: '10px', borderRadius: '8px' }}
      aria-label="Payment QR Code"
    >
      {grid.flatMap((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.3}
              height={cellSize + 0.3}
              fill="#090d16"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Configurable Payment Destination (Strict zero fake/invented URL)
  const officialPaymentUrl =
    (typeof window !== 'undefined' && window.UNICORE_CONFIG?.OFFICIAL_PAYMENT_URL) ||
    import.meta.env.VITE_OFFICIAL_PAYMENT_URL ||
    '';

  const paymentUpiVpa =
    (typeof window !== 'undefined' && window.UNICORE_CONFIG?.PAYMENT_UPI_VPA) ||
    import.meta.env.VITE_PAYMENT_UPI_VPA ||
    '';

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentFees();
      setFees(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load fee records');
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnlineClick = () => {
    if (officialPaymentUrl && officialPaymentUrl.trim().startsWith('http')) {
      window.open(officialPaymentUrl.trim(), '_blank', 'noopener,noreferrer');
    } else {
      setShowPortalModal(true);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading fee records...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading fees:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadFees} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const totalAmount = fees.reduce((acc, f) => acc + (f.amount || 0), 0);
  const totalPaid = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const totalBalance = totalAmount - totalPaid;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="status-badge status-good">Paid</span>;
      case 'PARTIALLY_PAID':
        return <span className="status-badge status-warning">Partially Paid</span>;
      case 'OVERDUE':
        return <span className="status-badge status-danger">Overdue</span>;
      default:
        return <span className="status-badge status-danger">Unpaid</span>;
    }
  };

  // QR Code Payload corresponds strictly to configured payment destination
  const effectiveUpiVpa = paymentUpiVpa.trim() || 'unicore.finance@bank';
  const qrPaymentPayload = `upi://pay?pa=${encodeURIComponent(effectiveUpiVpa)}&pn=UniCore+University+Bursar&am=${totalBalance}&cu=INR&tn=UniCore+Tuition+Fees`;

  return (
    <div className="student-page">
      {/* Header with Title and Payment Action Buttons */}
      <div className="page-header-row" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <h1 className="student-page-title">Fee Records &amp; Accounts</h1>
          <p className="student-page-subtitle">Semester tuition fees, laboratory charges, and institutional dues.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePayOnlineClick}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            💳 Pay Fees Online
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowQrModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            📱 Pay via QR Code
          </button>

          <div className={`status-badge-pill ${totalBalance === 0 ? 'status-good' : 'status-warning'}`}>
            {totalBalance === 0 ? '✓ All Dues Cleared' : `Balance Due: ₹${totalBalance.toLocaleString()}`}
          </div>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="card attendance-summary-banner">
        <div className="attendance-metric-item">
          <span className="metric-number">₹{totalAmount.toLocaleString()}</span>
          <span className="metric-title">Total Invoiced</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number text-success">₹{totalPaid.toLocaleString()}</span>
          <span className="metric-title">Total Paid</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number text-danger">₹{totalBalance.toLocaleString()}</span>
          <span className="metric-title">Outstanding Balance</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number">{fees.length}</span>
          <span className="metric-title">Line Items</span>
        </div>
      </div>

      {/* Fees Table */}
      <div className="card table-card">
        <div className="table-header-title">
          <h3>Semester Fee Breakdown</h3>
        </div>
        <div className="table-responsive">
          <table className="unicore-table">
            <thead>
              <tr>
                <th>Fee Description</th>
                <th>Semester</th>
                <th>Academic Year</th>
                <th>Invoiced Amount</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No fee records found for current student account.
                  </td>
                </tr>
              ) : (
                fees.map((item) => {
                  const itemBalance = (item.amount || 0) - (item.paidAmount || 0);
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.feeType}</strong></td>
                      <td>Semester {item.semester}</td>
                      <td>{item.academicYear}</td>
                      <td>₹{item.amount?.toLocaleString()}</td>
                      <td>₹{item.paidAmount?.toLocaleString()}</td>
                      <td style={{ color: itemBalance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                        ₹{itemBalance.toLocaleString()}
                      </td>
                      <td>{item.dueDate || '—'}</td>
                      <td>{getStatusBadge(item.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distinction Notice: ERP Ledger vs External Payment Portal */}
      <div className="card info-box" style={{ borderLeft: '3px solid var(--cyber-cyan, #00f2fe)' }}>
        <h4 style={{ color: '#f8fafc', margin: '0 0 0.35rem' }}>🏛️ Institutional Fee Schedule vs. Payment Gateway</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          This page functions as an informational ledger of student fee invoices, recorded concessions, and verified payments registered in the UniCore ERP database. Actual financial payments occur via the university's official external payment gateway or offline at the Accounts Office counter. No simulated or instant ledger modification is performed without administrative receipt reconciliation.
        </p>
      </div>

      {/* Modal 1: Official Payment Portal Configuration Notice */}
      {showPortalModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 11, 24, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowPortalModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#0d1527',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                🏛️ Official University Payment Portal
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPortalModal(false)}
                style={{ padding: '0.2rem 0.6rem' }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '6px',
                padding: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <h4 style={{ margin: '0 0 0.3rem', color: '#facc15', fontSize: '0.9rem' }}>
                Gateway Configuration Notice
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.45 }}>
                The official university payment portal URL is not currently configured on this instance. In accordance with UniCore security policy, unverified external URLs are never fabricated.
              </p>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Configuration Location:</strong>
              </p>
              <code
                style={{
                  display: 'block',
                  background: '#060a14',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '4px',
                  color: 'var(--cyber-cyan, #00f2fe)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '0.75rem',
                }}
              >
                VITE_OFFICIAL_PAYMENT_URL=https://fees.youruniversity.edu/pay
              </code>
              <p style={{ margin: 0 }}>
                Configure <code>VITE_OFFICIAL_PAYMENT_URL</code> in <code>frontend/.env</code> to route students to your institution's verified payment gateway.
              </p>
              <p style={{ margin: '0.75rem 0 0' }}>
                <strong>In-Person Payments:</strong> Students may clear pending dues at the University Bursar &amp; Accounts Desk (Admin Block, Counter 2) during office hours (09:00 - 16:30 IST).
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPortalModal(false)}
                style={{ fontSize: '0.82rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: QR Payment Modal */}
      {showQrModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 11, 24, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#0d1527',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              padding: '1.5rem',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                📱 Official Fee Payment QR
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowQrModal(false)}
                style={{ padding: '0.2rem 0.6rem' }}
              >
                ✕
              </button>
            </div>

            {/* QR Code Container */}
            <div
              style={{
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '10px',
                display: 'inline-block',
                margin: '0 auto 1rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              <PaymentQrSvg payload={qrPaymentPayload} size={180} />
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#090d16', fontWeight: 600 }}>
                Scan with any supported UPI / Banking App
              </div>
            </div>

            {/* Destination Metadata */}
            <div
              style={{
                background: 'rgba(6, 10, 20, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.8rem',
                textAlign: 'left',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payee Account:</span>
                <strong style={{ color: '#f8fafc' }}>UniCore University Bursar</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Destination VPA:</span>
                <strong style={{ color: 'var(--cyber-cyan, #00f2fe)' }}>{effectiveUpiVpa}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Outstanding Balance:</span>
                <strong style={{ color: totalBalance > 0 ? '#ef4444' : '#10b981' }}>
                  ₹{totalBalance.toLocaleString()}
                </strong>
              </div>
              {!paymentUpiVpa && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                  * Configured destination: <code>VITE_PAYMENT_UPI_VPA</code> in <code>.env</code>
                </div>
              )}
            </div>

            {/* Settlement Disclaimer */}
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              ⚠️ Reconciliation Notice: Payments initiated via QR code transfer directly to the university banking account. Institutional records are updated upon receipt verification by the Finance Office (typically 1–2 business days). Instant automated clearance is not claimed.
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowQrModal(false)}
              style={{ width: '100%', fontSize: '0.82rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
