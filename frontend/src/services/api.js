const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('unicore_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => null);
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        // Plain text or proxy HTML response
      }
    }
  }

  if (!response.ok) {
    let errorMsg = data?.message || data?.error;
    if (!errorMsg) {
      if (response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) {
        errorMsg = 'Backend server is currently unreachable or starting up. Please verify the Spring Boot service is running on port 8080.';
      } else {
        errorMsg = `Server returned status ${response.status}`;
      }
    }
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Authentication
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerStudent: (studentId, collegeEmail, password) =>
    request('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify({ studentId, collegeEmail, password }),
    }),

  registerFaculty: (facultyId, collegeEmail, password) =>
    request('/auth/register/faculty', {
      method: 'POST',
      body: JSON.stringify({ facultyId, collegeEmail, password }),
    }),

  getCurrentUser: () => request('/auth/me'),

  // Student Endpoints
  getMyStudentProfile: () => request('/student/me/profile'),
  getStudentProfileById: (userId) => request(`/student/profile/${userId}`),
  getStudentDashboard: () => request('/student/me/dashboard'),
  getStudentAttendance: () => request('/student/me/attendance'),
  getStudentAcademicPerformance: () => request('/student/me/academic-performance'),
  getStudentCourseAssessments: (courseId) => request(`/student/me/courses/${courseId}/assessments`),
  getStudentResults: (semester) => request(`/student/me/results${semester ? `?semester=${semester}` : ''}`),
  getStudentRiskStatus: () => request('/student/me/risk-status'),
  getStudentFees: () => request('/student/me/fees'),
  getStudentDocuments: () => request('/student/me/documents'),
  getStudentNotifications: () => request('/student/me/notifications'),

  // Faculty Endpoints
  getMyFacultyProfile: () => request('/faculty/me/profile'),
  getMyAssignedCourses: () => request('/faculty/me/courses'),
  getCourseRoster: (courseId) => request(`/faculty/courses/${courseId}/students`),
  getCourseAttendance: (courseId, date) =>
    request(`/faculty/courses/${courseId}/attendance?date=${date}`),
  submitCourseAttendance: (courseId, payload) =>
    request(`/faculty/courses/${courseId}/attendance`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getDepartmentStudents: (department) =>
    request(`/faculty/department-students?department=${encodeURIComponent(department)}`),

  // Departments
  getDepartments: () => request('/departments'),

  // Admin Endpoints
  getAdminUsers: () => request('/admin/users'),
  getAdminDepartments: () => request('/admin/departments'),
  createDepartment: (dept) =>
    request('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(dept),
    }),
  updateDepartment: (id, dept) =>
    request(`/admin/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dept),
    }),
  toggleDepartmentStatus: (id) =>
    request(`/admin/departments/${id}/status`, {
      method: 'PATCH',
    }),
  getApprovedStudents: () => request('/admin/approved-students'),
  addApprovedStudent: (student) =>
    request('/admin/approved-students', {
      method: 'POST',
      body: JSON.stringify(student),
    }),
  toggleApprovedStudentStatus: (id) =>
    request(`/admin/approved-students/${id}/status`, {
      method: 'PATCH',
    }),
  getApprovedFaculty: () => request('/admin/approved-faculty'),
  addApprovedFaculty: (faculty) =>
    request('/admin/approved-faculty', {
      method: 'POST',
      body: JSON.stringify(faculty),
    }),
  toggleApprovedFacultyStatus: (id) =>
    request(`/admin/approved-faculty/${id}/status`, {
      method: 'PATCH',
    }),

  // Faculty Assessment & Grading (Part 5.4)
  createAssessment: (courseId, payload) =>
    request(`/faculty/courses/${courseId}/assessments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCourseAssessments: (courseId) =>
    request(`/faculty/courses/${courseId}/assessments`),
  getAssessmentMarks: (courseId, assessmentId) =>
    request(`/faculty/courses/${courseId}/assessments/${assessmentId}/marks`),
  submitMarks: (courseId, assessmentId, payload) =>
    request(`/faculty/courses/${courseId}/assessments/${assessmentId}/marks`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  publishAssessment: (courseId, assessmentId, published = true) =>
    request(`/faculty/courses/${courseId}/assessments/${assessmentId}/publish?published=${published}`, {
      method: 'POST',
    }),
  calculateGrades: (courseId) =>
    request(`/faculty/courses/${courseId}/grades/calculate`, {
      method: 'POST',
    }),
  getCourseGradeSummary: (courseId) =>
    request(`/faculty/courses/${courseId}/grades/summary`),

  // Admin Portal (Part 6)
  getAdminDashboard: () => request('/admin/dashboard'),
  getAdminStudents: (search) =>
    request('/admin/students' + (search ? `?search=${encodeURIComponent(search)}` : '')),
  getAdminStudentById: (id) => request(`/admin/students/${id}`),
  createAdminStudent: (payload) =>
    request('/admin/students', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAdminStudent: (id, payload) =>
    request(`/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteAdminStudent: (id) =>
    request(`/admin/students/${id}`, {
      method: 'DELETE',
    }),
  getAdminFaculty: (search) =>
    request('/admin/faculty' + (search ? `?search=${encodeURIComponent(search)}` : '')),
  getAdminFacultyById: (id) => request(`/admin/faculty/${id}`),
  getAdminFacultyCourses: (id) => request(`/admin/faculty/${id}/courses`),
  createAdminFaculty: (payload) =>
    request('/admin/faculty', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAdminFaculty: (id, payload) =>
    request(`/admin/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteAdminFaculty: (id) =>
    request(`/admin/faculty/${id}`, {
      method: 'DELETE',
    }),
  getAdminCourses: (department, semester) => {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester);
    const qs = params.toString();
    return request('/admin/courses' + (qs ? `?${qs}` : ''));
  },
  getAdminCourseById: (id) => request(`/admin/courses/${id}`),
  createAdminCourse: (payload) =>
    request('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAdminCourse: (id, payload) =>
    request(`/admin/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteAdminCourse: (id) =>
    request(`/admin/courses/${id}`, {
      method: 'DELETE',
    }),
  assignFacultyToCourse: (courseId, facultyId) =>
    request(`/admin/courses/${courseId}/assign-faculty`, {
      method: 'POST',
      body: JSON.stringify({ facultyId }),
    }),
  unassignFacultyFromCourse: (courseId, facultyId) =>
    request(`/admin/courses/${courseId}/assign-faculty/${facultyId}`, {
      method: 'DELETE',
    }),
  getAdminEnrollments: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.courseId) searchParams.append('courseId', params.courseId);
    if (params.studentId) searchParams.append('studentId', params.studentId);
    if (params.semester) searchParams.append('semester', params.semester);
    const qs = searchParams.toString();
    return request('/admin/enrollments' + (qs ? `?${qs}` : ''));
  },
  getAdminAttendanceSummary: () => request('/admin/attendance/summary'),
  getAdminAssessmentsSummary: () => request('/admin/assessments/summary'),

  // ML Risk Prediction Engine (Part 7)
  getMyRisk: () => request('/ml/my-risk'),
  getStudentRisk: (studentId, courseId) =>
    request(`/ml/students/${studentId}/risk${courseId ? `?courseId=${courseId}` : ''}`),
  getCourseRisk: (courseId) => request(`/ml/courses/${courseId}/risk`),
  getFacultyRiskOverview: () => request('/ml/faculty/risk-overview'),
  getAdminRiskOverview: () => request('/ml/admin/risk-overview'),

  // AI Academic Advisor (Part 8)
  getAdvisorOverview: () => request('/advisor/me/overview'),
  getAdvisorRecommendations: () => request('/advisor/me/recommendations'),
  refreshAdvisor: () =>
    request('/advisor/me/refresh', {
      method: 'POST',
    }),
  askAdvisor: (question, conversationHistory = []) =>
    request('/advisor/me/ask', {
      method: 'POST',
      body: JSON.stringify({ question, conversationHistory }),
    }),
  getStudentAdvisorOverview: (studentId) => request(`/advisor/students/${studentId}/overview`),
  getAdminAdvisorOverview: () => request('/advisor/admin/overview'),
};


