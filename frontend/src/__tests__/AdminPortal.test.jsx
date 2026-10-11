import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminReports from '../pages/admin/AdminReports';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getAdminDashboard: vi.fn(),
    getAdminAttendanceSummary: vi.fn(),
    getAdminAssessmentsSummary: vi.fn(),
    getAdminRiskOverview: vi.fn(),
    getAdminAdvisorOverview: vi.fn(),
  },
}));

const mockAdminUser = {
  id: 99,
  name: 'System Administrator',
  email: 'admin@unicore.edu',
  role: 'ADMIN',
  department: 'Administration',
};

const mockAdminStats = {
  totalStudents: 25,
  totalFaculty: 10,
  totalCourses: 35,
  activeEnrollments: 45,
  averageAttendancePct: 84.5,
  highRiskStudentsCount: 3,
  recentActivity: ['Enrolled 5 students in BCA201', 'Midterm marks updated'],
};

const mockAttendanceSummary = {
  totalRecords: 120,
  totalPresent: 102,
  totalAbsent: 18,
  overallPercentage: 85.0,
  departmentSummaries: [
    { department: 'BCA', total: 40, present: 35, percentage: 87.5 },
  ],
};

const mockAssessmentSummary = {
  totalAssessments: 8,
  totalMarksRecorded: 32,
  typeCounts: { MIDTERM: 4, FINAL: 2, QUIZ: 2 },
  courseOverviews: [
    {
      courseId: 1,
      courseCode: 'BCA101',
      courseName: 'Programming in C',
      assessmentCount: 2,
      totalWeightage: 100.0,
    },
  ],
};

const mockRiskOverview = {
  totalAnalyzed: 25,
  highRiskCount: 2,
  mediumRiskCount: 5,
  lowRiskCount: 18,
  highRiskPercentage: 8.0,
  departmentBreakdown: { BCA: 1, BSCS: 1 },
};

const mockAdvisorOverview = {
  totalStudentsAnalyzed: 25,
  highPriorityCount: 3,
  mediumPriorityCount: 6,
  lowPriorityCount: 16,
  lowAttendanceStudentsCount: 2,
  lowMarksStudentsCount: 4,
  priorityDistributionByDepartment: { BCA: 2, BSCS: 1 },
};

describe('Admin Portal & Institutional Reports UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin sidebar with admin navigation tabs', () => {
    const onTabChange = vi.fn();
    render(
      <AdminSidebar
        activeTab="dashboard"
        onTabChange={onTabChange}
        currentUser={mockAdminUser}
      />
    );

    expect(screen.getByText('System Administrator')).toBeInTheDocument();
    expect(screen.getByText('SYSTEM ADMIN')).toBeInTheDocument();
    expect(screen.getByText('Analytics & Reports')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Analytics & Reports'));
    expect(onTabChange).toHaveBeenCalledWith('reports');
  });

  it('renders admin dashboard with system statistics and quick shortcuts', async () => {
    api.getAdminDashboard.mockResolvedValue(mockAdminStats);

    const onNavigate = vi.fn();
    render(<AdminDashboard onNavigate={onNavigate} currentUser={mockAdminUser} />);

    await waitFor(() => {
      expect(screen.getByText('University Administration Portal')).toBeInTheDocument();
    });

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('renders institutional reports with attendance, assessments, ML risk, and AI advisor metrics', async () => {
    api.getAdminAttendanceSummary.mockResolvedValue(mockAttendanceSummary);
    api.getAdminAssessmentsSummary.mockResolvedValue(mockAssessmentSummary);
    api.getAdminRiskOverview.mockResolvedValue(mockRiskOverview);
    api.getAdminAdvisorOverview.mockResolvedValue(mockAdvisorOverview);

    render(<AdminReports />);

    await waitFor(() => {
      expect(screen.getByText('Analytics & Institutional Reports')).toBeInTheDocument();
    });

    // Attendance
    expect(screen.getByText(/Institution-Wide Attendance/)).toBeInTheDocument();
    // Assessment
    expect(screen.getByText(/Academic Assessment Analytics/)).toBeInTheDocument();
    // ML Risk
    expect(screen.getByText(/ML Early-Warning Student Risk Analytics/)).toBeInTheDocument();
    // AI Advisor
    expect(screen.getByText(/AI Advisor Institutional Guidance Telemetry/)).toBeInTheDocument();
    expect(screen.getByText('High-Priority Advisor Interventions by Department')).toBeInTheDocument();
  });
});
