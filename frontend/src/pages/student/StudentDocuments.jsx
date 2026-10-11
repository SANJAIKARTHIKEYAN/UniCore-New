import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentDocuments();
      setDocuments(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading documents...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading documents:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadDocuments} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="status-badge status-good">Available</span>;
      case 'PENDING':
        return <span className="status-badge status-warning">Processing</span>;
      case 'EXPIRED':
        return <span className="status-badge status-danger">Expired</span>;
      default:
        return <span className="status-badge status-secondary">{status}</span>;
    }
  };

  const getDocIcon = (type) => {
    switch (type) {
      case 'Identity Card':
        return '🪪';
      case 'Hall Ticket':
        return '🎫';
      case 'Bonafide Certificate':
        return '📜';
      default:
        return '📄';
    }
  };

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Digital Documents &amp; Certificates</h1>
          <p className="student-page-subtitle">Official university issued digital credentials, ID cards, and hall tickets.</p>
        </div>
        <span className="badge badge-STUDENT">{documents.length} Records</span>
      </div>

      <div className="documents-grid">
        {documents.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--text-secondary)' }}>No documents issued for this student account yet.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="card document-card">
              <div className="document-card-header">
                <div className="doc-icon-box">{getDocIcon(doc.documentType)}</div>
                <div className="doc-meta-info">
                  <span className="doc-type-label">{doc.documentType}</span>
                  <h3 className="doc-title">{doc.title}</h3>
                </div>
                <div>{getStatusBadge(doc.status)}</div>
              </div>

              <p className="doc-description">{doc.description || 'No description provided.'}</p>

              <div className="doc-footer-meta">
                <span>Issued Date: <strong>{doc.issuedDate || 'Pending Clearance'}</strong></span>
                {doc.semester && <span>Semester: <strong>Sem {doc.semester}</strong></span>}
              </div>

              <div className="doc-actions-row">
                {doc.status === 'AVAILABLE' ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedDoc(doc)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    View Document Record
                  </button>
                ) : doc.status === 'PENDING' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem' }}>
                    <span className="doc-pending-note" style={{ color: '#facc15', fontSize: '0.78rem' }}>
                      ⏳ Processing by Academic Office
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedDoc(doc)}
                      style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                    >
                      View Details
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem' }}>
                    <span className="doc-pending-note" style={{ color: '#f87171', fontSize: '0.78rem' }}>
                      ⚠️ Expired Credential
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedDoc(doc)}
                      style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card info-box">
        <h4>Document Repository &amp; Verification Notice</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
          UniCore maintains structured institutional metadata records for official student credentials. Actual binary PDF download and cryptographic verification endpoints will be enabled upon connection to the university document vault.
        </p>
      </div>

      {/* Proper UniCore Modal View for Document Record Metadata */}
      {selectedDoc && (
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
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#0d1527',
              border: '1px solid rgba(0, 242, 254, 0.35)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{getDocIcon(selectedDoc.documentType)}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>{selectedDoc.title}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Type: <strong style={{ color: '#f8fafc' }}>{selectedDoc.documentType}</strong>
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getStatusBadge(selectedDoc.status)}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedDoc(null)}
                  style={{ padding: '0.2rem 0.6rem' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Metadata Fields */}
            <div
              style={{
                background: 'rgba(6, 10, 20, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Document Name:</span>
                <strong style={{ color: '#f8fafc' }}>{selectedDoc.title}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Document Type:</span>
                <strong style={{ color: 'var(--cyber-cyan, #00f2fe)' }}>{selectedDoc.documentType}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lifecycle Status:</span>
                <strong>
                  {selectedDoc.status === 'AVAILABLE' ? (
                    <span style={{ color: '#10b981' }}>Available in Archive</span>
                  ) : selectedDoc.status === 'PENDING' ? (
                    <span style={{ color: '#facc15' }}>Processing / Awaiting Approval</span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>Expired</span>
                  )}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Issue Date:</span>
                <strong style={{ color: '#f8fafc' }}>{selectedDoc.issuedDate || 'Pending Office Clearance'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Semester Scope:</span>
                <strong style={{ color: '#f8fafc' }}>
                  {selectedDoc.semester ? `Semester ${selectedDoc.semester}` : 'All Semesters / Institutional'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Registry ID:</span>
                <code style={{ color: 'var(--cyber-cyan, #00f2fe)' }}>
                  {`#DOC-${String(selectedDoc.id).padStart(5, '0')}`}
                </code>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Description:</span>
                <p style={{ margin: '0.2rem 0 0', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {selectedDoc.description || 'Institutional document record issued to verified student account.'}
                </p>
              </div>

              {/* Verification Metadata (grounded institutional metadata, no fake cryptographic claims) */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Verification Metadata:</span>
                <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
                  <div>&bull; <strong>Authority:</strong> Office of Academic Affairs &amp; Registrar</div>
                  <div>
                    &bull; <strong>Record Verification:</strong>{' '}
                    {selectedDoc.status === 'AVAILABLE'
                      ? 'Verified institutional metadata record'
                      : selectedDoc.status === 'PENDING'
                      ? 'Pending departmental verification'
                      : 'Expired record'}
                  </div>
                  <div>&bull; <strong>Storage Node:</strong> UniCore Registrar Database (H2/MySQL)</div>
                </div>
              </div>
            </div>

            {/* Platform Limitation Notice: Grounded, no fake PDF download */}
            <div
              style={{
                background: 'rgba(0, 242, 254, 0.05)',
                border: '1px solid rgba(0, 242, 254, 0.2)',
                borderRadius: '6px',
                padding: '0.75rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem',
                lineHeight: 1.4,
              }}
            >
              📄 <strong>Record Notice:</strong> This modal displays verified registry metadata. Binary PDF generation and downloads will be enabled once the institution connects external object storage (AWS S3/MinIO).
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedDoc(null)}
                style={{ fontSize: '0.82rem' }}
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
