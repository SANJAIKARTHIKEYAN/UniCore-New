import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentResults();
      setResults(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load semester results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading semester results...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading results:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadResults} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const displayedResults =
    selectedSemester === 'ALL'
      ? results
      : results.filter((r) => String(r.semester) === selectedSemester);

  // Compute overall published status across all semesters
  const totalCourses = results.reduce((acc, r) => acc + (r.courses?.length || 0), 0);
  const gradedCourses = results.reduce(
    (acc, r) => acc + (r.courses?.filter((c) => c.grade !== null)?.length || 0),
    0
  );

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Results &amp; Academic Records</h1>
          <p className="student-page-subtitle">Official semester scorecards, published examination grades, and grade points.</p>
        </div>

        <div className="filter-dropdown-wrapper">
          <label className="form-label" style={{ marginBottom: '0.2rem' }}>Filter Semester:</label>
          <select
            className="form-input form-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{ width: 'auto', display: 'inline-block', background: '#0a1224' }}
          >
            <option value="ALL">All Semesters ({results.length})</option>
            {results.map((r) => (
              <option key={r.semester} value={String(r.semester)}>
                Semester {r.semester} {r.isCurrentSemester ? '(Current Active)' : '(Archived)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Institutional Results Status Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9' }}>
              Academic Evaluation &amp; Grade Publication Summary
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Official grades awarded and published by authorized faculty evaluators via the grading engine.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={`badge ${gradedCourses === totalCourses && totalCourses > 0 ? 'badge-STUDENT' : 'badge-sem'}`}>
              {gradedCourses} of {totalCourses} Courses Graded
            </span>
          </div>
        </div>

        <div className="hud-hex-grid" style={{ marginTop: '1rem', marginBottom: '0.25rem' }}>
          <div className="hud-hex-card hud-hex-cyan">
            <div className="hud-hex-label">Semesters Recorded</div>
            <div className="hud-hex-value" style={{ fontSize: '1.15rem' }}>{results.length}</div>
            <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Institutional Ledger</div>
          </div>

          <div className="hud-hex-card hud-hex-amber">
            <div className="hud-hex-label">Evaluation Standing</div>
            <div className="hud-hex-value" style={{ fontSize: '1.15rem' }}>
              {totalCourses === 0
                ? 'No Courses'
                : gradedCourses === totalCourses
                ? 'All Published'
                : `${totalCourses - gradedCourses} In Evaluation`}
            </div>
            <div className="hud-hex-subtext" style={{ color: 'var(--cyber-amber)' }}>
              {gradedCourses === totalCourses && totalCourses > 0 ? 'Fully Finalized' : 'Grading in Progress'}
            </div>
          </div>

          <div className="hud-hex-card hud-hex-emerald">
            <div className="hud-hex-label">Registered Credits</div>
            <div className="hud-hex-value" style={{ fontSize: '1.15rem' }}>
              {results.reduce((acc, r) => acc + (r.totalCredits || 0), 0)}
            </div>
            <div className="hud-hex-subtext" style={{ color: 'var(--cyber-emerald)' }}>Cumulative Total</div>
          </div>
        </div>
      </div>

      {/* Results Tables per Semester */}
      {displayedResults.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>No semester result records available at this time.</p>
        </div>
      ) : (
        displayedResults.map((semResult) => (
          <div key={semResult.semester} className="card semester-result-card" style={{ marginBottom: '1.5rem' }}>
            <div className="semester-result-header">
              <div>
                <div className="sem-header-tags">
                  <span className="sem-number-badge">Semester {semResult.semester}</span>
                  {semResult.isCurrentSemester ? (
                    <span className="badge badge-STUDENT">Active Current Semester</span>
                  ) : (
                    <span className="badge badge-secondary">Archived Historical Record</span>
                  )}
                </div>
                <span className="sem-year-text">
                  Academic Session: {semResult.academicYear} &bull; Total Credits: {semResult.totalCredits}
                </span>
              </div>

              <div className="sgpa-badge-box">
                <span className="sgpa-label">Semester SGPA</span>
                <span className="sgpa-value highlight">
                  {semResult.sgpa !== null ? semResult.sgpa.toFixed(2) : 'Pending Evaluation'}
                </span>
              </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              <table className="unicore-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Credits</th>
                    <th>Awarded Grade</th>
                    <th>Grade Points</th>
                    <th>Evaluation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {semResult.courses.map((course) => (
                    <tr key={course.courseCode}>
                      <td><strong className="code-badge">{course.courseCode}</strong></td>
                      <td>{course.courseName}</td>
                      <td>{course.credits} Credits</td>
                      <td>
                        {course.grade ? (
                          <span className="grade-badge">{course.grade}</span>
                        ) : (
                          <span className="badge badge-pending">Not Yet Graded</span>
                        )}
                      </td>
                      <td>{course.gradePoints !== null ? course.gradePoints.toFixed(1) : '—'}</td>
                      <td>
                        {course.grade ? (
                          <span className={`status-badge ${course.grade === 'F' ? 'status-danger' : 'status-good'}`}>
                            {course.grade === 'F' ? 'Fail' : 'Pass'}
                          </span>
                        ) : (
                          <span className="status-badge status-warning">In Evaluation</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <div className="card info-box">
        <h4>Official Grading &amp; Publishing Policy</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
          Grades are computed and published by authorized faculty course instructors and the Controller of Examinations. Before publication, course records indicate "Not Yet Graded" and "In Evaluation". Once published, verified letter grades and grade points become visible immediately.
        </p>
      </div>
    </div>
  );
}
