import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const ASSESSMENT_TYPES = [
  { value: 'MIDTERM', label: 'Midterm Exam' },
  { value: 'FINAL', label: 'Final Exam' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'LAB', label: 'Lab Assessment' },
  { value: 'PROJECT', label: 'Project' },
];

export default function FacultyAssessments({ selectedCourseId, onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(selectedCourseId || null);
  const [subTab, setSubTab] = useState('assessments'); // 'assessments' | 'marks' | 'grades'
  
  // Assessments state
  const [assessments, setAssessments] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // New Assessment form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'MIDTERM',
    maxMarks: 100,
    weightage: 20,
  });
  const [creating, setCreating] = useState(false);

  // Mark Entry state
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [marksList, setMarksList] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);

  // Grade Summary state
  const [summaryData, setSummaryData] = useState(null);
  const [calculatingGrades, setCalculatingGrades] = useState(false);

  // Global feedback
  const [feedback, setFeedback] = useState(null);

  // 1. Load faculty courses
  useEffect(() => {
    loadAssignedCourses();
  }, []);

  // 2. Load assessments when course changes
  useEffect(() => {
    if (activeCourseId) {
      loadAssessments(activeCourseId);
    }
  }, [activeCourseId]);

  // Sync prop changes
  useEffect(() => {
    if (selectedCourseId && selectedCourseId !== activeCourseId) {
      setActiveCourseId(selectedCourseId);
    }
  }, [selectedCourseId]);

  // 3. Load marks when assessment changes in mark entry tab
  useEffect(() => {
    if (activeCourseId && selectedAssessmentId && subTab === 'marks') {
      loadMarks(activeCourseId, selectedAssessmentId);
    }
  }, [activeCourseId, selectedAssessmentId, subTab]);

  // 4. Load grade summary when viewing grades tab
  useEffect(() => {
    if (activeCourseId && subTab === 'grades') {
      loadGradeSummary(activeCourseId);
    }
  }, [activeCourseId, subTab]);

  const loadGradeSummary = async (courseId) => {
    try {
      const res = await api.getCourseGradeSummary(courseId);
      if (res) {
        setSummaryData(res);
      }
    } catch {
      // Non-fatal if grades not yet calculated/published
    }
  };

  const loadAssignedCourses = async () => {
    try {
      setLoadingCourses(true);
      setFeedback(null);
      const res = await api.getMyAssignedCourses();
      const list = res || [];
      setCourses(list);
      if (!activeCourseId && list.length > 0) {
        const initialId = selectedCourseId || list[0].id;
        setActiveCourseId(initialId);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load assigned courses' });
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAssessments = async (courseId) => {
    try {
      setLoadingAssessments(true);
      setFeedback(null);
      const res = await api.getCourseAssessments(courseId);
      const list = res || [];
      setAssessments(list);
      if (list.length > 0) {
        setSelectedAssessmentId((prev) => {
          // Keep current if valid, else pick first
          const exists = list.some((a) => a.id === prev);
          return exists ? prev : list[0].id;
        });
      } else {
        setSelectedAssessmentId(null);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load assessments' });
    } finally {
      setLoadingAssessments(false);
    }
  };

  const loadMarks = async (courseId, assessmentId, preserveFeedback = false) => {
    try {
      setLoadingMarks(true);
      if (!preserveFeedback) {
        setFeedback(null);
      }
      const res = await api.getAssessmentMarks(courseId, assessmentId);
      const marks = res || [];
      setMarksList(marks);

      // Populate local edit map
      const initialMap = {};
      marks.forEach((m) => {
        const val = m.marksObtained !== null && m.marksObtained !== undefined ? m.marksObtained : '';
        if (m.studentId !== undefined && m.studentId !== null) {
          initialMap[m.studentId] = val;
        }
        if (m.studentUserId !== undefined && m.studentUserId !== null) {
          initialMap[m.studentUserId] = val;
        }
      });
      setMarksMap(initialMap);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load student marks' });
    } finally {
      setLoadingMarks(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = Number(e.target.value);
    setActiveCourseId(courseId);
    setSummaryData(null);
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
  };

  // Create assessment handler
  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Assessment title is required.' });
      return;
    }
    if (formData.maxMarks <= 0) {
      setFeedback({ type: 'error', message: 'Maximum marks must be greater than 0.' });
      return;
    }
    if (formData.weightage < 0 || formData.weightage > 100) {
      setFeedback({ type: 'error', message: 'Weightage must be between 0% and 100%.' });
      return;
    }

    try {
      setCreating(true);
      setFeedback(null);
      const created = await api.createAssessment(activeCourseId, {
        title: formData.title.trim(),
        type: formData.type,
        maxMarks: Number(formData.maxMarks),
        weightage: Number(formData.weightage),
      });

      setAssessments((prev) => [...prev, created]);
      setSelectedAssessmentId(created.id);
      setShowCreateModal(false);
      setFormData({
        title: '',
        type: 'MIDTERM',
        maxMarks: 100,
        weightage: 20,
      });
      setFeedback({ type: 'success', message: `Assessment "${created.title}" created successfully!` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create assessment' });
    } finally {
      setCreating(false);
    }
  };

  // Mark entry change handler
  const handleMarkChange = (studentKey, value, altKey) => {
    setMarksMap((prev) => {
      const next = { ...prev, [studentKey]: value };
      if (altKey !== undefined && altKey !== null) {
        next[altKey] = value;
      }
      return next;
    });
  };

  // Quick action: Autofill all with max marks
  const handleFillMaxMarks = () => {
    const activeAss = assessments.find((a) => a.id === selectedAssessmentId);
    if (!activeAss) return;
    const updated = {};
    marksList.forEach((m) => {
      const max = activeAss.maxMarks;
      if (m.studentId !== undefined && m.studentId !== null) updated[m.studentId] = max;
      if (m.studentUserId !== undefined && m.studentUserId !== null) updated[m.studentUserId] = max;
    });
    setMarksMap(updated);
  };

  // Quick action: Clear all
  const handleClearAllMarks = () => {
    const updated = {};
    marksList.forEach((m) => {
      if (m.studentId !== undefined && m.studentId !== null) updated[m.studentId] = '';
      if (m.studentUserId !== undefined && m.studentUserId !== null) updated[m.studentUserId] = '';
    });
    setMarksMap(updated);
  };

  // Save student marks
  const handleSaveMarks = async () => {
    const activeAss = assessments.find((a) => a.id === selectedAssessmentId);
    if (!activeAss) return;

    // Validate marks
    const markEntries = [];
    for (const item of marksList) {
      const val = marksMap[item.studentId] !== undefined ? marksMap[item.studentId] : marksMap[item.studentUserId];
      const targetId = item.studentUserId || item.studentId;
      if (val === '' || val === null || val === undefined) {
        markEntries.push({ studentId: targetId, studentUserId: item.studentUserId, marksObtained: null });
      } else {
        const num = Number(val);
        if (isNaN(num) || num < 0) {
          setFeedback({ type: 'error', message: `Invalid mark for ${item.studentName}: marks cannot be negative.` });
          return;
        }
        if (num > activeAss.maxMarks) {
          setFeedback({
            type: 'error',
            message: `Mark for ${item.studentName} (${num}) exceeds maximum allowed marks (${activeAss.maxMarks}).`,
          });
          return;
        }
        markEntries.push({ studentId: targetId, studentUserId: item.studentUserId, marksObtained: num });
      }
    }

    try {
      setSavingMarks(true);
      setFeedback(null);
      await api.submitMarks(activeCourseId, selectedAssessmentId, {
        entries: markEntries,
        marks: markEntries,
      });
      // Reload marks sheet to refresh percentages and evaluation status
      await loadMarks(activeCourseId, selectedAssessmentId, true);
      setFeedback({ type: 'success', message: 'Student marks successfully saved!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save marks' });
    } finally {
      setSavingMarks(false);
    }
  };

  // Grade calculation & publishing
  const handleCalculateGrades = async () => {
    try {
      setCalculatingGrades(true);
      setFeedback(null);
      const res = await api.calculateGrades(activeCourseId);
      setSummaryData(res);
      const studentList = res?.studentSummaries || res?.students || [];
      const total = res?.totalStudents ?? studentList.length;
      const graded = res?.gradedStudents ?? studentList.filter((s) => s.finalGrade || s.computedGrade).length;
      setFeedback({
        type: 'success',
        message: `Grades successfully calculated and published for ${graded} out of ${total} students!`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to calculate grades' });
    } finally {
      setCalculatingGrades(false);
    }
  };

  const activeCourse = courses.find((c) => c.id === activeCourseId);
  const activeAssessment = assessments.find((a) => a.id === selectedAssessmentId);
  const totalWeightage = assessments.reduce((sum, a) => sum + (a.weightage || 0), 0);

  const getBadgeClassForType = (type) => {
    switch (type) {
      case 'MIDTERM':
        return 'assessment-badge-midterm';
      case 'FINAL':
        return 'assessment-badge-final';
      case 'ASSIGNMENT':
        return 'assessment-badge-assignment';
      case 'QUIZ':
        return 'assessment-badge-quiz';
      case 'LAB':
        return 'assessment-badge-lab';
      case 'PROJECT':
        return 'assessment-badge-project';
      default:
        return 'badge-secondary';
    }
  };

  const cleanAssessmentTitle = (title) => {
    if (!title || /^b+$/i.test(title.trim())) {
      return 'Mid-Term Examination';
    }
    return title;
  };

  const getGradePillClass = (grade) => {
    switch (grade) {
      case 'O':
        return 'grade-pill-O';
      case 'A+':
        return 'grade-pill-Aplus';
      case 'A':
        return 'grade-pill-A';
      case 'B+':
        return 'grade-pill-Bplus';
      case 'B':
        return 'grade-pill-B';
      case 'C':
        return 'grade-pill-C';
      case 'F':
        return 'grade-pill-F';
      default:
        return 'grade-pill-default';
    }
  };

  return (
    <div className="student-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Assessment & Grading Engine</h1>
          <p className="student-page-subtitle">
            Configure assessments, record student marks, calculate weighted totals, and publish official grades.
          </p>
        </div>
        {activeCourse && (
          <div className="attendance-session-badge">
            <span>Course:</span>
            <strong>{activeCourse.courseCode}</strong>
          </div>
        )}
      </div>

      {/* Global Feedback Alert */}
      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible`} role="alert">
          <span>{feedback.message}</span>
          <button
            type="button"
            className="alert-close-btn"
            onClick={() => setFeedback(null)}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      )}

      {/* Course Selector Card */}
      <div className="card attendance-filter-card">
        <div className="attendance-filter-grid">
          <div className="filter-group">
            <label className="form-label" htmlFor="assessment-course-select">
              Select Assigned Course:
            </label>
            <select
              id="assessment-course-select"
              className="form-control"
              value={activeCourseId || ''}
              onChange={handleCourseChange}
              disabled={loadingCourses}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} &ndash; {c.courseName} (Sem {c.semester})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group course-weightage-indicator">
            <label className="form-label">Total Weightage Configured:</label>
            <div className="weightage-bar-wrapper">
              <div
                className={`weightage-progress-fill ${
                  totalWeightage === 100 ? 'complete' : totalWeightage > 100 ? 'over' : 'under'
                }`}
                style={{ width: `${Math.min(totalWeightage, 100)}%` }}
              ></div>
              <span className="weightage-progress-text">
                {totalWeightage.toFixed(1)}% / 100%
              </span>
            </div>
          </div>
        </div>

        {/* Course Info Strip */}
        {activeCourse && (
          <div className="course-active-info-strip">
            <div className="course-active-title">
              <span className="code-badge">{activeCourse.courseCode}</span>
              <strong>{activeCourse.courseName}</strong>
            </div>
            <div className="course-active-badges">
              <span className="badge badge-secondary">{activeCourse.department}</span>
              <span className="badge badge-secondary">Semester {activeCourse.semester}</span>
              <span className="badge badge-secondary">{activeCourse.credits} Credits</span>
              <span className="badge badge-STUDENT">{assessments.length} Assessments</span>
            </div>
          </div>
        )}
      </div>

      {/* Sub Tab Navigation */}
      <div className="assessment-nav-tabs">
        <button
          className={`assessment-tab-btn ${subTab === 'assessments' ? 'active' : ''}`}
          onClick={() => setSubTab('assessments')}
        >
          📋 Assessments ({assessments.length})
        </button>
        <button
          className={`assessment-tab-btn ${subTab === 'marks' ? 'active' : ''}`}
          onClick={() => setSubTab('marks')}
          disabled={assessments.length === 0}
        >
          ✏️ Enter Marks
        </button>
        <button
          className={`assessment-tab-btn ${subTab === 'grades' ? 'active' : ''}`}
          onClick={() => setSubTab('grades')}
          disabled={assessments.length === 0}
        >
          🎓 Grade Summary & Publish
        </button>
      </div>

      {/* TAB 1: ASSESSMENTS LIST & CREATION */}
      {subTab === 'assessments' && (
        <div className="assessments-tab-content">
          <div className="section-action-header">
            <div>
              <h2 className="section-subheading">Configured Assessments</h2>
              <p className="section-subtext">
                Define evaluation items such as midterms, assignments, and projects with respective weightages.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Assessment
            </button>
          </div>

          {/* Create Modal / Inline Drawer */}
          {showCreateModal && (
            <div className="card assessment-modal-card">
              <div className="modal-header">
                <h3>Create New Assessment</h3>
                <button
                  type="button"
                  className="alert-close-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleCreateAssessment} className="assessment-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="ass-title">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="ass-title"
                      className="form-control"
                      placeholder="e.g. Midterm Examination"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="ass-type">
                      Assessment Type *
                    </label>
                    <select
                      id="ass-type"
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {ASSESSMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="ass-maxMarks">
                      Maximum Marks *
                    </label>
                    <input
                      type="number"
                      id="ass-maxMarks"
                      className="form-control"
                      min="1"
                      step="1"
                      value={formData.maxMarks}
                      onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="ass-weightage">
                      Weightage (%) *
                    </label>
                    <input
                      type="number"
                      id="ass-weightage"
                      className="form-control"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.weightage}
                      onChange={(e) => setFormData({ ...formData, weightage: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions-row">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Creating...' : 'Save Assessment'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Assessment Cards Grid */}
          {loadingAssessments ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading assessments...</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="empty-state-card">
              <span className="empty-icon">📝</span>
              <h3>No Assessments Configured</h3>
              <p>Create your first assessment to begin recording marks and calculating grades.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateModal(true)}
              >
                + Create Assessment
              </button>
            </div>
          ) : (
            <div className="assessment-card-grid">
              {assessments.map((ass) => (
                <div key={ass.id} className="card assessment-box-card">
                  <div className="assessment-box-top">
                    <span className={`badge ${getBadgeClassForType(ass.type)}`}>
                      {ass.type}
                    </span>
                    <span className="assessment-weightage-badge">
                      {ass.weightage}% Weight
                    </span>
                  </div>
                  <h3 className="assessment-box-title">{cleanAssessmentTitle(ass.title)}</h3>
                  <div className="assessment-box-meta">
                    <div className="meta-item">
                      <span className="meta-label">Max Marks:</span>
                      <strong className="meta-value">{ass.maxMarks}</strong>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Created:</span>
                      <span className="meta-value">
                        {ass.createdAt ? new Date(ass.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="assessment-box-actions">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setSelectedAssessmentId(ass.id);
                        setSubTab('marks');
                      }}
                    >
                      ✏️ Enter Marks &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MARK ENTRY */}
      {subTab === 'marks' && (
        <div className="mark-entry-tab-content">
          <div className="card mark-entry-control-bar">
            <div className="filter-group">
              <label className="form-label" htmlFor="select-assessment-input">
                Select Assessment to Grade:
              </label>
              <select
                id="select-assessment-input"
                className="form-control"
                value={selectedAssessmentId || ''}
                onChange={(e) => setSelectedAssessmentId(Number(e.target.value))}
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {cleanAssessmentTitle(a.title)} ({a.type} &bull; Max {a.maxMarks} &bull; {a.weightage}%)
                  </option>
                ))}
              </select>
            </div>

            {activeAssessment && (
              <div className="mark-entry-quick-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleFillMaxMarks}
                  title="Assign full marks to all enrolled students"
                >
                  Fill Max ({activeAssessment.maxMarks})
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleClearAllMarks}
                  title="Clear all entered marks"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {loadingMarks ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading student marks...</p>
            </div>
          ) : marksList.length === 0 ? (
            <div className="empty-state-card">
              <span className="empty-icon">👥</span>
              <h3>No Students Enrolled</h3>
              <p>There are currently no active students enrolled in this course to grade.</p>
            </div>
          ) : (
            <div className="card table-card">
              <div className="table-responsive">
                <table className="unicore-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Reg Number</th>
                      <th>Student Name</th>
                      <th style={{ width: '180px' }}>
                        Marks Obtained (Max {activeAssessment?.maxMarks || 100})
                      </th>
                      <th>Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksList.map((m, index) => {
                      const curVal = marksMap[m.studentId] !== undefined ? marksMap[m.studentId] : marksMap[m.studentUserId];
                      const numVal = curVal !== '' && curVal !== null && curVal !== undefined ? Number(curVal) : null;
                      const max = activeAssessment?.maxMarks || 100;
                      const calculatedPct = numVal !== null ? ((numVal / max) * 100).toFixed(1) : null;

                      return (
                        <tr key={m.studentId || m.studentUserId || index}>
                          <td className="text-secondary">{index + 1}</td>
                          <td>
                            <span className="reg-number-pill">
                              {m.studentRegistrationNumber || m.studentId}
                            </span>
                          </td>
                          <td className="student-name-cell">
                            <strong>{m.studentName}</strong>
                          </td>
                          <td>
                            <div className="mark-input-wrapper">
                              <input
                                type="number"
                                className={`form-control mark-input ${
                                  numVal !== null && (numVal < 0 || numVal > max) ? 'input-error' : ''
                                }`}
                                min="0"
                                max={max}
                                step="0.5"
                                placeholder="&mdash;"
                                value={curVal !== undefined && curVal !== null ? curVal : ''}
                                onChange={(e) => handleMarkChange(m.studentId, e.target.value, m.studentUserId)}
                              />
                              <span className="mark-max-label">/ {max}</span>
                            </div>
                          </td>
                          <td>
                            {calculatedPct !== null ? (
                              <span
                                className={`badge ${
                                  Number(calculatedPct) >= 50
                                    ? 'badge-attendance-present'
                                    : 'badge-attendance-absent'
                                }`}
                              >
                                {calculatedPct}%
                              </span>
                            ) : (
                              <span className="text-secondary">&mdash;</span>
                            )}
                          </td>
                          <td>
                            {numVal !== null ? (
                              <span className="badge badge-faculty-verified">Graded</span>
                            ) : (
                              <span className="badge badge-secondary">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Save Footer */}
              <div className="attendance-submit-footer">
                <div className="footer-status-text">
                  Total Students: <strong>{marksList.length}</strong> &bull; Graded:{' '}
                  <strong>
                    {
                      marksList.filter((m) => {
                        const v = marksMap[m.studentId] !== undefined ? marksMap[m.studentId] : marksMap[m.studentUserId];
                        return v !== '' && v !== null && v !== undefined;
                      }).length
                    }
                  </strong>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-save-attendance"
                  onClick={handleSaveMarks}
                  disabled={savingMarks}
                >
                  {savingMarks ? 'Saving Marks...' : '💾 Save Marks'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GRADE SUMMARY & PUBLISH */}
      {subTab === 'grades' && (
        <div className="grade-summary-tab-content">
          <div className="card grade-action-banner">
            <div className="grade-action-info">
              <h2>Official Weighted Grade Calculation</h2>
              <p>
                Calculates weighted aggregate scores from all configured assessments and assigns letter grades (O, A+, A, B+, B, C, F) directly to student enrollments.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-calculate-grades"
              onClick={handleCalculateGrades}
              disabled={calculatingGrades}
            >
              {calculatingGrades ? 'Calculating...' : '⚡ Calculate & Publish Grades'}
            </button>
          </div>

          {summaryData && (
            <div className="grade-summary-results">
              {/* Summary Stats Row */}
              <div className="metric-cards-grid">
                <div className="card metric-card">
                  <span className="metric-label">Enrolled Students</span>
                  <strong className="metric-value">
                    {summaryData.totalStudents ?? (summaryData.students ? summaryData.students.length : 0)}
                  </strong>
                </div>
                <div className="card metric-card">
                  <span className="metric-label">Graded Students</span>
                  <strong className="metric-value">
                    {summaryData.gradedStudents ?? (summaryData.students ? summaryData.students.filter((s) => s.finalGrade || s.computedGrade).length : 0)}
                  </strong>
                </div>
                <div className="card metric-card">
                  <span className="metric-label">Class Average</span>
                  <strong className="metric-value">
                    {(() => {
                      const list = summaryData.studentSummaries || summaryData.students || [];
                      if (list.length === 0) return '0.0%';
                      const sum = list.reduce(
                        (acc, s) => acc + (s.finalPercentage ?? s.weightedPercentage ?? 0),
                        0
                      );
                      return (sum / list.length).toFixed(1) + '%';
                    })()}
                  </strong>
                </div>
                <div className="card metric-card">
                  <span className="metric-label">Course Code</span>
                  <strong className="metric-value">{summaryData.courseCode}</strong>
                </div>
              </div>

              {/* Detailed Grade Sheet */}
              <div className="card table-card">
                <div className="table-header-strip">
                  <h3>Published Grade Sheet &mdash; {summaryData.courseName}</h3>
                </div>
                <div className="table-responsive">
                  <table className="unicore-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Reg Number</th>
                        <th>Student Name</th>
                        <th>Assessment Breakdown</th>
                        <th>Final Percentage</th>
                        <th>Final Grade</th>
                        <th>Grade Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(summaryData.studentSummaries || summaryData.students || []).map((student, idx) => {
                        const regNo = student.studentRegistrationNumber || student.studentId || '—';
                        const pct = student.finalPercentage !== null && student.finalPercentage !== undefined
                          ? student.finalPercentage
                          : student.weightedPercentage !== null && student.weightedPercentage !== undefined
                          ? student.weightedPercentage
                          : null;
                        const grade = student.finalGrade || student.computedGrade || '—';
                        const pts = student.gradePoints !== null && student.gradePoints !== undefined
                          ? student.gradePoints
                          : student.computedGradePoints !== null && student.computedGradePoints !== undefined
                          ? student.computedGradePoints
                          : null;

                        return (
                          <tr key={student.studentId || idx}>
                            <td className="text-secondary">{idx + 1}</td>
                            <td>
                              <span className="reg-number-pill">
                                {regNo}
                              </span>
                            </td>
                            <td>
                              <strong>{student.studentName}</strong>
                            </td>
                            <td>
                              <div className="breakdown-chips">
                                {student.assessmentScores?.map((score) => (
                                  <span
                                    key={score.assessmentId}
                                    className="breakdown-chip"
                                    title={`${cleanAssessmentTitle(score.assessmentTitle)}: ${score.marksObtained ?? 0} / ${score.maxMarks} (Weight: ${score.weightage}%)`}
                                  >
                                    {cleanAssessmentTitle(score.assessmentTitle)}:{' '}
                                    <strong>{score.marksObtained !== null ? score.marksObtained : '—'}</strong>
                                    /{score.maxMarks}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <strong className="final-percentage-text">
                                {pct !== null ? `${pct}%` : '0.0%'}
                              </strong>
                            </td>
                            <td>
                              <span
                                className={`grade-pill ${getGradePillClass(grade)}`}
                              >
                                {grade}
                              </span>
                            </td>
                            <td>
                              <span className="grade-points-value">
                                {pts !== null ? pts.toFixed(1) : '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
