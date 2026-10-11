import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import StudentSidebar from '../components/student/StudentSidebar';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAdvisor from '../pages/student/StudentAdvisor';
import StudentNotifications, { isNotificationExpired } from '../pages/student/StudentNotifications';
import StudentFees from '../pages/student/StudentFees';
import StudentDocuments from '../pages/student/StudentDocuments';
import StudentResults from '../pages/student/StudentResults';
import { api } from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    getStudentDashboard: vi.fn(),
    getMyRisk: vi.fn(),
    getAdvisorOverview: vi.fn(),
    refreshAdvisor: vi.fn(),
    askAdvisor: vi.fn(),
    getStudentNotifications: vi.fn(),
    getStudentFees: vi.fn(),
    getStudentDocuments: vi.fn(),
    getStudentResults: vi.fn(),
    getStudentAcademicPerformance: vi.fn(),
  },
}));

const mockStudentUser = {
  id: 1,
  name: 'Sanjai Karthikeyan',
  email: 'bca.stu001@unicore.edu',
  role: 'STUDENT',
  department: 'BCA',
  studentProfile: {
    studentId: 'BCA-STU-001',
    admissionYear: 2024,
    currentSemester: 2,
  },
};

const mockDashboardData = {
  studentName: 'Sanjai Karthikeyan',
  studentId: 'BCA-STU-001',
  department: 'BCA',
  semester: 2,
  derivedYear: '1st Year',
  enrolledCoursesCount: 4,
  overallAttendancePercent: 88.5,
  pendingFeesCount: 0,
  unreadNotificationsCount: 2,
};

const mockRiskData = {
  riskCategory: 'Low Risk',
  confidence: 0.92,
  recommendation: 'Student is demonstrating healthy academic progress. Continue standard course engagement.',
  features: {
    'Attendance (%)': 88.5,
    'Midterm_Score': 82.0,
    'Assignments_Avg': 85.0,
    'Quizzes_Avg': 80.0,
  },
};

const mockAdvisorOverview = {
  summaryHeadline: 'Academic health is strong with 88.5% attendance and active grade standing.',
  riskCategory: 'Low Risk',
  riskConfidence: 0.92,
  overallAttendancePercent: 88.5,
  averageMarksPercent: 82.3,
  courseCount: 4,
  recommendations: [
    {
      category: 'ACADEMIC',
      priority: 'MEDIUM',
      title: 'Target Distinction in Java',
      explanation: 'Scores are consistently above 80%. Review advanced concurrency topics.',
      suggestedAction: 'Complete extra credit assignments.',
      supportingMetric: 'Java: 82.0%',
      relatedCourse: 'BCA201',
    },
    {
      category: 'ATTENDANCE',
      priority: 'LOW',
      title: 'Maintain Attendance Pacing',
      explanation: 'Attendance is above safe buffer.',
      suggestedAction: 'Keep regular class attendance.',
      supportingMetric: 'Attendance: 88.5%',
      relatedCourse: 'General Standing',
    },
  ],
  generatedAt: '2026-09-15T12:00:00',
};

const mockNotifications = [
  {
    id: 1,
    title: 'Midterm Examination Schedule',
    message: 'Midterm exams begin next Monday. Check room allocations.',
    type: 'EXAM',
    createdAt: '2026-09-18T10:00:00',
    expiresAt: '2026-10-18T23:59:59',
    isExpired: false,
    isActive: true,
  },
  {
    id: 2,
    title: 'Library Orientation Archive',
    message: 'Orientation session for library digital catalog.',
    type: 'GENERAL',
    createdAt: '2026-09-01T10:00:00',
    expiresAt: '2026-09-20T00:00:00', // Expired
    isExpired: true,
    isActive: false,
  },
];

const mockFees = [
  {
    id: 101,
    feeType: 'Semester Tuition Fee',
    semester: 2,
    academicYear: 2024,
    amount: 35000,
    paidAmount: 35000,
    dueDate: '2026-10-15',
    status: 'PAID',
  },
  {
    id: 102,
    feeType: 'Laboratory & Tech Infrastructure',
    semester: 2,
    academicYear: 2024,
    amount: 8000,
    paidAmount: 0,
    dueDate: '2026-10-30',
    status: 'UNPAID',
  },
];

const mockDocuments = [
  {
    id: 1,
    documentType: 'Identity Card',
    title: 'Student Institutional ID Card',
    description: 'Digital ID credential for campus access and library services.',
    semester: null,
    issuedDate: '2024-08-01',
    status: 'AVAILABLE',
  },
  {
    id: 2,
    documentType: 'Bonafide Certificate',
    title: 'Bonafide Student Certificate',
    description: 'Certificate of continuous enrollment for passport and visa verification.',
    semester: 2,
    issuedDate: null,
    status: 'PENDING',
  },
];

const mockResults = [
  {
    semester: 2,
    academicYear: 2024,
    isCurrentSemester: true,
    totalCredits: 12,
    sgpa: null,
    courses: [
      {
        courseCode: 'BCA201',
        courseName: 'Java Programming',
        credits: 4,
        grade: null,
        gradePoints: null,
      },
      {
        courseCode: 'BCA202',
        courseName: 'Database Management Systems',
        credits: 4,
        grade: null,
        gradePoints: null,
      },
    ],
  },
];

describe('Student Portal & AI Advisor UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders student sidebar with student details and navigation links', () => {
    const onTabChange = vi.fn();
    render(
      <StudentSidebar
        activeTab="dashboard"
        onTabChange={onTabChange}
        currentUser={mockStudentUser}
      />
    );

    expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    expect(screen.getByText('BCA-STU-001')).toBeInTheDocument();
    expect(screen.getByText('AI Advisor')).toBeInTheDocument();

    const advisorBtn = screen.getByText('AI Advisor');
    fireEvent.click(advisorBtn);
    expect(onTabChange).toHaveBeenCalledWith('advisor');
  });

  it('renders student dashboard with academic metrics and ML early warning card', async () => {
    api.getStudentDashboard.mockResolvedValue(mockDashboardData);
    api.getMyRisk.mockResolvedValue(mockRiskData);

    const onNavigate = vi.fn();
    render(<StudentDashboard onNavigate={onNavigate} currentUser={mockStudentUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Sanjai Karthikeyan!/)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/88\.5%/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Low Risk \(92% Confidence\)/)).toBeInTheDocument();
    expect(screen.getByText('🤖 Consult AI Advisor →')).toBeInTheDocument();

    // Click quick link to AI Advisor
    fireEvent.click(screen.getByText('🤖 Consult AI Advisor →'));
    expect(onNavigate).toHaveBeenCalledWith('advisor');
  });

  it('renders AI Advisor overview with health metrics, recommendation cards, and quick chips', async () => {
    api.getAdvisorOverview.mockResolvedValue(mockAdvisorOverview);

    render(<StudentAdvisor />);

    await waitFor(() => {
      expect(screen.getByText(/AI Academic Advisor/)).toBeInTheDocument();
    });

    expect(screen.getByText('Low Risk')).toBeInTheDocument();
    expect(screen.getByText('Target Distinction in Java')).toBeInTheDocument();
    expect(screen.getByText('Maintain Attendance Pacing')).toBeInTheDocument();
    expect(screen.getByText('How is my attendance standing?')).toBeInTheDocument();
  });

  it('handles asking a question to the AI Advisor and displaying the grounded response', async () => {
    api.getAdvisorOverview.mockResolvedValue(mockAdvisorOverview);
    api.askAdvisor.mockResolvedValue({
      intent: 'ATTENDANCE_INQUIRY',
      answer: 'Your overall attendance is currently at 88.5% across 4 courses. This comfortably exceeds the mandatory 75% cutoff.',
      source: 'UNICORE_ACADEMIC_RULE_ENGINE',
      suggestedQuestions: ['Which course should I focus on?'],
    });

    render(<StudentAdvisor />);

    await waitFor(() => {
      expect(screen.getByText(/AI Academic Advisor/)).toBeInTheDocument();
    });

    // Click a quick prompt chip
    const promptChip = screen.getByText('How is my attendance standing?');
    fireEvent.click(promptChip);

    await waitFor(() => {
      expect(screen.getByText(/Your overall attendance is currently at 88.5%/)).toBeInTheDocument();
    });
  });

  it('supports typing in composer, sending message, and clearing conversation thread', async () => {
    api.getAdvisorOverview.mockResolvedValue(mockAdvisorOverview);
    api.askAdvisor.mockResolvedValue({
      intent: 'COURSE_INQUIRY',
      answer: 'Focus on Data Structures midterm preparations.',
      source: 'GEMINI_1_5_FLASH',
      suggestedQuestions: [],
    });

    render(<StudentAdvisor />);

    await waitFor(() => {
      expect(screen.getByText(/AI Academic Advisor/)).toBeInTheDocument();
    });

    // Verify composer placeholder
    const textarea = screen.getByPlaceholderText(/Ask your AI Advisor anything\.\.\./);
    expect(textarea).toBeInTheDocument();

    // Type a custom inquiry
    fireEvent.change(textarea, { target: { value: 'What should I study for upcoming exams?' } });
    expect(textarea.value).toBe('What should I study for upcoming exams?');

    // Click Send button
    const sendBtn = screen.getByRole('button', { name: /Send/i });
    expect(sendBtn).not.toBeDisabled();
    fireEvent.click(sendBtn);

    // Verify user message appears in thread
    await waitFor(() => {
      expect(screen.getByText('What should I study for upcoming exams?')).toBeInTheDocument();
      expect(screen.getByText('Focus on Data Structures midterm preparations.')).toBeInTheDocument();
      expect(screen.getByText(/Gemini AI Advisor/)).toBeInTheDocument();
    });

    // Verify Clear Chat button appears and clears the thread
    const clearBtn = screen.getByRole('button', { name: /Clear Chat/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.queryByText('Focus on Data Structures midterm preparations.')).not.toBeInTheDocument();
    });
  });

  // --- New Tests for Student Portal Corrections ---

  it('verifies notification expiry helper logic avoids off-by-one errors', () => {
    // Expired past date
    expect(isNotificationExpired({ expiresAt: '2026-09-20T00:00:00', isExpired: true })).toBe(true);
    // Active future date
    expect(isNotificationExpired({ expiresAt: '2026-10-30T23:59:59', isExpired: false })).toBe(false);
    // Null expiry
    expect(isNotificationExpired(null)).toBe(false);
  });

  it('renders notifications page with active and expired tags and status filtering', async () => {
    api.getStudentNotifications.mockResolvedValue(mockNotifications);

    render(<StudentNotifications />);

    await waitFor(() => {
      expect(screen.getByText('Midterm Examination Schedule')).toBeInTheDocument();
      expect(screen.getByText('Library Orientation Archive')).toBeInTheDocument();
    });

    // Verify EXPIRED tag is shown on expired notification
    expect(screen.getByText('EXPIRED')).toBeInTheDocument();
    expect(screen.getAllByText(/Active/).length).toBeGreaterThan(0);

    // Click Expired Archive filter
    const expiredTab = screen.getByRole('button', { name: /Expired Archive/i });
    fireEvent.click(expiredTab);

    // Only expired notification should now be displayed
    expect(screen.getByText('Library Orientation Archive')).toBeInTheDocument();
    expect(screen.queryByText('Midterm Examination Schedule')).not.toBeInTheDocument();
  });

  it('renders fee records and opens payment portal guidance and QR code modal', async () => {
    api.getStudentFees.mockResolvedValue(mockFees);

    render(<StudentFees />);

    await waitFor(() => {
      expect(screen.getByText('Semester Tuition Fee')).toBeInTheDocument();
      expect(screen.getByText('Laboratory & Tech Infrastructure')).toBeInTheDocument();
    });

    // Outstanding balance is ₹8,000 (43000 - 35000)
    expect(screen.getByText('Outstanding Balance')).toBeInTheDocument();
    expect(screen.getAllByText(/8,000/).length).toBeGreaterThan(0);

    // Click "Pay Fees Online" button -> opens configuration notice modal if not configured
    const payOnlineBtn = screen.getByText('💳 Pay Fees Online');
    fireEvent.click(payOnlineBtn);

    expect(screen.getAllByText(/Official University Payment Portal/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Gateway Configuration Notice/i)).toBeInTheDocument();

    // Close portal modal
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);

    // Click "Pay via QR Code" -> opens QR payment modal
    const qrBtn = screen.getByText('📱 Pay via QR Code');
    fireEvent.click(qrBtn);

    expect(screen.getByText('📱 Official Fee Payment QR')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment QR Code')).toBeInTheDocument();
    expect(screen.getByText(/UniCore University Bursar/i)).toBeInTheDocument();
  });

  it('renders digital documents and opens document record modal without browser alert', async () => {
    api.getStudentDocuments.mockResolvedValue(mockDocuments);

    render(<StudentDocuments />);

    await waitFor(() => {
      expect(screen.getByText('Student Institutional ID Card')).toBeInTheDocument();
      expect(screen.getByText('Bonafide Student Certificate')).toBeInTheDocument();
    });

    // Check status tags
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();

    // Click "View Document Record" on Available document
    const viewBtn = screen.getByText('View Document Record');
    fireEvent.click(viewBtn);

    // Modal displays metadata without alert
    expect(screen.getByText('Document Name:')).toBeInTheDocument();
    expect(screen.getByText('#DOC-00001')).toBeInTheDocument();
    expect(screen.getByText(/Office of Academic Affairs & Registrar/i)).toBeInTheDocument();
    expect(screen.getByText('Close Record')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Close Record'));
    expect(screen.queryByText('#DOC-00001')).not.toBeInTheDocument();
  });

  it('renders student results with "Not Yet Graded" and "In Evaluation" before publication', async () => {
    api.getStudentResults.mockResolvedValue(mockResults);

    render(<StudentResults />);

    await waitFor(() => {
      expect(screen.getByText('Java Programming')).toBeInTheDocument();
      expect(screen.getByText('Database Management Systems')).toBeInTheDocument();
    });

    // Displays Not Yet Graded and In Evaluation
    expect(screen.getAllByText('Not Yet Graded').length).toBe(2);
    expect(screen.getAllByText('In Evaluation').length).toBeGreaterThan(0);
    expect(screen.getByText('Pending Evaluation')).toBeInTheDocument();
  });
});
