import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import FacultySidebar from '../components/faculty/FacultySidebar';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import FacultyCourses from '../pages/faculty/FacultyCourses';
import FacultyCourseRoster from '../pages/faculty/FacultyCourseRoster';
import FacultyProfile from '../pages/faculty/FacultyProfile';
import FacultyAttendance from '../pages/faculty/FacultyAttendance';
import FacultyAssessments from '../pages/faculty/FacultyAssessments';
import FacultyRiskOverview from '../pages/faculty/FacultyRiskOverview';
import FacultyLayout from '../components/faculty/FacultyLayout';
import { api } from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    getMyAssignedCourses: vi.fn(),
    getFacultyCourses: vi.fn(),
    getCourseRoster: vi.fn(),
    getMyFacultyProfile: vi.fn(),
    getCourseAttendance: vi.fn(),
    submitCourseAttendance: vi.fn(),
    createAssessment: vi.fn(),
    getCourseAssessments: vi.fn(),
    getAssessmentMarks: vi.fn(),
    submitMarks: vi.fn(),
    calculateGrades: vi.fn(),
    getCourseGradeSummary: vi.fn(),
    getFacultyRiskOverview: vi.fn(),
    getCourseRisk: vi.fn(),
  },
}));

const mockFacultyUser = {
  id: 2,
  name: 'Dr. K. Sharma',
  email: 'bca.fac001@unicore.edu',
  role: 'FACULTY',
  department: 'BCA',
  facultyProfile: {
    facultyId: 'BCA-FAC-001',
    department: 'BCA',
  },
};

const mockAssignedCourses = [
  {
    id: 1,
    courseCode: 'BCA101',
    courseName: '[DEMO] Programming in C',
    department: 'BCA',
    semester: 1,
    credits: 4,
    enrolledStudentsCount: 3,
  },
  {
    id: 4,
    courseCode: 'BCA201',
    courseName: '[DEMO] Object Oriented Programming in Java',
    department: 'BCA',
    semester: 2,
    credits: 4,
    enrolledStudentsCount: 2,
  },
];

const mockRoster = {
  courseId: 4,
  courseCode: 'BCA201',
  courseName: '[DEMO] Object Oriented Programming in Java',
  department: 'BCA',
  semester: 2,
  credits: 4,
  totalEnrolled: 1,
  students: [
    {
      enrollmentId: 10,
      studentId: 'BCA-STU-001',
      studentName: 'Sanjai Karthikeyan',
      collegeEmail: 'bca.stu001@unicore.edu',
      department: 'BCA',
      semester: 2,
      academicYear: 2024,
      grade: null,
      gradePoints: null,
      attendancePercentage: 86.7,
    },
  ],
};

const mockAttendanceEntries = [
  {
    studentUserId: 10,
    studentId: 'BCA-STU-001',
    studentName: 'Sanjai Karthikeyan',
    status: null,
  },
  {
    studentUserId: 11,
    studentId: 'BCA-STU-002',
    studentName: 'Aravind Mohan',
    status: 'PRESENT',
  },
];

describe('Faculty Portal Components & Shell (Parts 5.2 & 5.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. FacultySidebar renders navigation items and user badge', () => {
    const handleTabChange = vi.fn();
    render(
      <FacultySidebar
        activeTab="dashboard"
        onTabChange={handleTabChange}
        currentUser={mockFacultyUser}
      />
    );

    expect(screen.getByText('Dr. K. Sharma')).toBeInTheDocument();
    expect(screen.getByText('BCA-FAC-001')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Courses')).toBeInTheDocument();
    expect(screen.getByText('Student Roster')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Faculty Profile')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Attendance'));
    expect(handleTabChange).toHaveBeenCalledWith('attendance');
  });

  it('2. FacultyDashboard renders metrics and course overview', async () => {
    api.getMyAssignedCourses.mockResolvedValueOnce(mockAssignedCourses);

    render(
      <FacultyDashboard
        onNavigate={vi.fn()}
        onSelectCourse={vi.fn()}
        currentUser={mockFacultyUser}
      />
    );

    expect(screen.getByText(/Loading faculty dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Dr. K. Sharma!')).toBeInTheDocument();
    });

    // 2 assigned courses, 3 + 2 = 5 total enrolled students
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('BCA101')).toBeInTheDocument();
    expect(screen.getByText('BCA201')).toBeInTheDocument();
  });

  it('3. FacultyCourses renders course cards and handles roster navigation', async () => {
    api.getMyAssignedCourses.mockResolvedValueOnce(mockAssignedCourses);
    const handleNavigate = vi.fn();
    const handleSelectCourse = vi.fn();

    render(
      <FacultyCourses
        onNavigate={handleNavigate}
        onSelectCourse={handleSelectCourse}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('[DEMO] Programming in C')).toBeInTheDocument();
    });

    expect(screen.getByText('[DEMO] Object Oriented Programming in Java')).toBeInTheDocument();

    const rosterButtons = screen.getAllByText(/View Enrolled Roster/i);
    expect(rosterButtons.length).toBe(2);

    fireEvent.click(rosterButtons[0]);
    expect(handleSelectCourse).toHaveBeenCalledWith(1);
    expect(handleNavigate).toHaveBeenCalledWith('roster');

    // Clicking BCA201 roster button passes course ID 4
    fireEvent.click(rosterButtons[1]);
    expect(handleSelectCourse).toHaveBeenCalledWith(4);
    expect(handleNavigate).toHaveBeenCalledWith('roster');
  });

  it('4. FacultyCourseRoster renders student roster line items and attendance rate', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseRoster.mockResolvedValueOnce(mockRoster);

    render(
      <FacultyCourseRoster
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    });

    expect(screen.getByText('BCA-STU-001')).toBeInTheDocument();
    expect(screen.getByText('bca.stu001@unicore.edu')).toBeInTheDocument();
    expect(screen.getByText('86.7%')).toBeInTheDocument();
    expect(screen.getByText('Not Yet Graded')).toBeInTheDocument();
  });

  it('4b. FacultyCourseRoster automatically selects BCA201 when selectedCourseId is provided and does not default to BCA101', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseRoster.mockResolvedValue(mockRoster);
    const handleSelectCourse = vi.fn();

    render(
      <FacultyCourseRoster
        selectedCourseId={4}
        onSelectCourse={handleSelectCourse}
      />
    );

    await waitFor(() => {
      expect(api.getCourseRoster).toHaveBeenCalledWith(4);
    });

    // Ensure the select dropdown value is 4 (BCA201)
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('4');
    expect(screen.getByText(/BCA201 — \[DEMO\] Object Oriented Programming in Java/i)).toBeInTheDocument();
  });

  it('4c. FacultyCourseRoster preserves direct access by defaulting to first course when no course is specified', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseRoster.mockResolvedValue(mockRoster);
    const handleSelectCourse = vi.fn();

    render(
      <FacultyCourseRoster
        selectedCourseId={null}
        onSelectCourse={handleSelectCourse}
      />
    );

    await waitFor(() => {
      expect(api.getCourseRoster).toHaveBeenCalledWith(1);
    });

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('1');
    expect(handleSelectCourse).toHaveBeenCalledWith(1);
  });

  it('5. FacultyProfile renders faculty metadata and credentials', async () => {
    api.getMyFacultyProfile.mockResolvedValueOnce({
      facultyId: 'BCA-FAC-001',
      department: 'BCA',
    });

    render(<FacultyProfile currentUser={mockFacultyUser} />);

    await waitFor(() => {
      expect(screen.getByText('Faculty Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('BCA-FAC-001')).toBeInTheDocument();
    expect(screen.getByText('Course Instructor & Evaluator')).toBeInTheDocument();
    expect(screen.getByText(/Verified Faculty/i)).toBeInTheDocument();
  });

  it('6. FacultyAttendance renders course selection, date picker, and enrolled student roster for attendance marking', async () => {
    api.getMyAssignedCourses.mockResolvedValueOnce(mockAssignedCourses);
    api.getCourseAttendance.mockResolvedValueOnce(mockAttendanceEntries);

    render(
      <FacultyAttendance
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Mark Student Attendance')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Select Course:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Attendance Date:/i)).toBeInTheDocument();
    expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    expect(screen.getByText('BCA-STU-001')).toBeInTheDocument();
    expect(screen.getByText('Aravind Mohan')).toBeInTheDocument();
    expect(screen.getByText('BCA-STU-002')).toBeInTheDocument();
    expect(screen.getByText('Unmarked')).toBeInTheDocument();
    expect(screen.getByText('✓ Recorded')).toBeInTheDocument();
  });

  it('7. FacultyAttendance allows marking individual students and calls submitCourseAttendance', async () => {
    api.getMyAssignedCourses.mockResolvedValueOnce(mockAssignedCourses);
    api.getCourseAttendance.mockResolvedValueOnce(mockAttendanceEntries);
    api.submitCourseAttendance.mockResolvedValueOnce({
      message: 'Attendance saved successfully for 2 student(s) on 2026-09-15.',
    });
    // For the refresh call after submit
    api.getCourseAttendance.mockResolvedValueOnce([
      { studentUserId: 10, studentId: 'BCA-STU-001', studentName: 'Sanjai Karthikeyan', status: 'PRESENT' },
      { studentUserId: 11, studentId: 'BCA-STU-002', studentName: 'Aravind Mohan', status: 'PRESENT' },
    ]);

    render(
      <FacultyAttendance
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    });

    // Mark all as Present using "✓ All Present"
    const markAllPresentBtn = screen.getByText('✓ All Present');
    fireEvent.click(markAllPresentBtn);

    // Click Save Attendance
    const saveBtn = screen.getByText(/Save Attendance/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.submitCourseAttendance).toHaveBeenCalledWith(
        4,
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({ studentId: 10, status: 'PRESENT' }),
            expect.objectContaining({ studentId: 11, status: 'PRESENT' }),
          ]),
        })
      );
    });

    expect(await screen.findByText(/Attendance saved successfully/i)).toBeInTheDocument();
  });

  it('8. FacultyAttendance loads existing attendance when selected date changes', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseAttendance.mockResolvedValueOnce(mockAttendanceEntries);

    render(
      <FacultyAttendance
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    });

    // Date change
    api.getCourseAttendance.mockResolvedValueOnce([
      { studentUserId: 10, studentId: 'BCA-STU-001', studentName: 'Sanjai Karthikeyan', status: 'ABSENT' },
      { studentUserId: 11, studentId: 'BCA-STU-002', studentName: 'Aravind Mohan', status: 'ABSENT' },
    ]);

    const dateInput = screen.getByLabelText(/Attendance Date:/i);
    fireEvent.change(dateInput, { target: { value: '2026-09-14' } });

    await waitFor(() => {
      expect(api.getCourseAttendance).toHaveBeenCalledWith(4, '2026-09-14');
    });
  });

  it('9. FacultyAssessments renders configured assessments and navigation tabs', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseAssessments.mockResolvedValue([
      { id: 101, title: 'Midterm Exam 1', type: 'MIDTERM', maxMarks: 50, weightage: 30 },
      { id: 102, title: 'End Term Project', type: 'PROJECT', maxMarks: 100, weightage: 70 },
    ]);

    render(
      <FacultyAssessments
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Assessment & Grading Engine')).toBeInTheDocument();
      expect(screen.getByText('Midterm Exam 1')).toBeInTheDocument();
      expect(screen.getByText('End Term Project')).toBeInTheDocument();
      expect(screen.getByText(/30% Weight/i)).toBeInTheDocument();
      expect(screen.getByText(/70% Weight/i)).toBeInTheDocument();
    });
  });

  it('10. FacultyAssessments calculates and publishes final student grades', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseAssessments.mockResolvedValue([
      { id: 101, title: 'Midterm Exam', type: 'MIDTERM', maxMarks: 50, weightage: 50 },
    ]);
    api.calculateGrades.mockResolvedValue({
      courseId: 4,
      courseCode: 'BCA201',
      courseName: 'Java Programming',
      totalStudents: 2,
      gradedStudents: 2,
      studentSummaries: [
        {
          studentId: 10,
          studentRegistrationNumber: 'BCA-STU-001',
          studentName: 'Sanjai Karthikeyan',
          finalPercentage: 92.0,
          finalGrade: 'O',
          gradePoints: 10.0,
          assessmentScores: [],
        },
      ],
    });

    render(
      <FacultyAssessments
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Assessment & Grading Engine')).toBeInTheDocument();
    });

    // Switch to Grade Summary tab
    const gradeTabBtn = screen.getByText(/Grade Summary & Publish/i);
    fireEvent.click(gradeTabBtn);

    // Click Calculate & Publish Grades
    const calcBtn = screen.getByText(/Calculate & Publish Grades/i);
    fireEvent.click(calcBtn);

    await waitFor(() => {
      expect(api.calculateGrades).toHaveBeenCalledWith(4);
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('O')).toBeInTheDocument();
      expect(screen.getByText(/Grades successfully calculated and published for 2 out of 2 students!/i)).toBeInTheDocument();
    });
  });

  it('11. Faculty enters marks and saves with both entries and marks payloads without validation errors', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseAssessments.mockResolvedValue([
      { id: 101, title: 'Midterm Exam 1', type: 'MIDTERM', maxMarks: 100, weightage: 20 },
    ]);
    api.getAssessmentMarks.mockResolvedValue([
      {
        studentUserId: 10,
        studentId: 'BCA-STU-001',
        studentRegistrationNumber: 'BCA-STU-001',
        studentName: 'Sanjai Karthikeyan',
        marksObtained: null,
      },
    ]);
    api.submitMarks.mockResolvedValue({
      message: 'Student marks successfully saved!',
    });

    render(
      <FacultyAssessments
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Assessment & Grading Engine')).toBeInTheDocument();
    });

    const enterMarksBtn = screen.getByText(/Enter Marks →/i);
    fireEvent.click(enterMarksBtn);

    await waitFor(() => {
      expect(api.getAssessmentMarks).toHaveBeenCalled();
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    });

    const fillMaxBtn = screen.getByText(/Fill Max/i);
    fireEvent.click(fillMaxBtn);

    const saveBtn = screen.getByText(/Save Marks/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.submitMarks).toHaveBeenCalledWith(
        4,
        101,
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({ marksObtained: 100 }),
          ]),
          marks: expect.arrayContaining([
            expect.objectContaining({ marksObtained: 100 }),
          ]),
        })
      );
      expect(screen.getByText(/Student marks successfully saved!/i)).toBeInTheDocument();
    });
  });

  it('12. FacultyRiskOverview renders student attendance matching authoritative attendance', async () => {
    api.getFacultyCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyRiskOverview.mockResolvedValue({
      totalAnalyzed: 1,
      highRiskCount: 0,
      mediumRiskCount: 1,
      lowRiskCount: 0,
      highRiskPercentage: 0,
      studentPredictions: [
        {
          studentId: 2,
          studentName: 'Sanjai Karthikeyan',
          studentRoll: 'BCA-STU-001',
          department: 'BCA',
          courseId: 4,
          courseCode: 'BCA201',
          riskCategory: 'Medium Risk',
          confidence: 0.59,
          attendance: 80.4,
          features: {
            'Attendance (%)': 80.4,
            'Midterm_Score': 75.0,
            'Assignments_Avg': 78.0,
            'Quizzes_Avg': 80.0,
          },
        },
      ],
      modelStatus: 'Online',
    });

    render(<FacultyRiskOverview selectedCourseId={null} onSelectCourse={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Risk Advisor/i })).toBeInTheDocument();
      expect(screen.getAllByText('Sanjai Karthikeyan').length).toBeGreaterThanOrEqual(1);
    });

    // Check attendance in table and review panel
    const attendanceMatches = screen.getAllByText(/80\.4%/);
    expect(attendanceMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('13. FacultyRiskOverview clears stale student and displays empty state when 0 students match filter', async () => {
    api.getFacultyCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyRiskOverview.mockResolvedValue({
      totalAnalyzed: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      highRiskPercentage: 0,
      studentPredictions: [],
      modelStatus: 'Online',
    });

    render(<FacultyRiskOverview selectedCourseId={null} onSelectCourse={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Risk Advisor/i })).toBeInTheDocument();
    });

    // Roster shows 0 filtered
    expect(screen.getByText('0 Filtered')).toBeInTheDocument();
    expect(screen.getAllByText('No students match current filter criteria.').length).toBeGreaterThanOrEqual(1);

    // Faculty Risk Review shows "No Student Selected", NOT a stale student or hardcoded prediction
    expect(screen.getByText('No Student Selected')).toBeInTheDocument();
    expect(screen.queryByText('Selected Student')).not.toBeInTheDocument();
    expect(screen.queryByText('ML PREDICTION HIGH RISK')).not.toBeInTheDocument();
    expect(screen.queryByText('68%')).not.toBeInTheDocument();

    // Metrics summary grid shows 0, not 120
    const totalStudentsLabel = screen.getByText('Total Students');
    const totalStudentsCard = totalStudentsLabel.closest('.hud-hex-card');
    expect(totalStudentsCard).toHaveTextContent('0');
    expect(totalStudentsCard).not.toHaveTextContent('120');
  });

  it('14. FacultyRiskOverview allows selecting a student and clears review when excluded by risk filter', async () => {
    api.getFacultyCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyRiskOverview.mockResolvedValue({
      totalAnalyzed: 2,
      highRiskCount: 1,
      mediumRiskCount: 1,
      lowRiskCount: 0,
      highRiskPercentage: 50,
      studentPredictions: [
        {
          studentId: 2,
          studentName: 'Sanjai Karthikeyan',
          studentRoll: 'BCA-STU-001',
          department: 'BCA',
          courseId: 4,
          courseCode: 'BCA201',
          riskCategory: 'Medium Risk',
          confidence: 0.59,
          attendance: 80.4,
          features: {
            'Attendance (%)': 80.4,
            'Midterm_Score': 75.0,
            'Assignments_Avg': 78.0,
            'Quizzes_Avg': 80.0,
          },
        },
        {
          studentId: 3,
          studentName: 'Aravind Mohan',
          studentRoll: 'BCA-STU-002',
          department: 'BCA',
          courseId: 4,
          courseCode: 'BCA201',
          riskCategory: 'High Risk',
          confidence: 0.88,
          attendance: 62.5,
          features: {
            'Attendance (%)': 62.5,
            'Midterm_Score': 45.0,
            'Assignments_Avg': 50.0,
            'Quizzes_Avg': 40.0,
          },
        },
      ],
      modelStatus: 'Online',
    });

    render(<FacultyRiskOverview selectedCourseId={null} onSelectCourse={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
      expect(screen.getByText('Aravind Mohan')).toBeInTheDocument();
    });

    // Initially no student is selected
    expect(screen.getByText('No Student Selected')).toBeInTheDocument();

    // Click on Sanjai Karthikeyan's row
    fireEvent.click(screen.getByText('Sanjai Karthikeyan'));

    // Now Sanjai's review details are shown
    expect(screen.queryByText('No Student Selected')).not.toBeInTheDocument();
    const sanjaiMatches = screen.getAllByText('Sanjai Karthikeyan');
    expect(sanjaiMatches.length).toBeGreaterThanOrEqual(2); // In table and in review panel
    expect(screen.getAllByText('Medium Risk').length).toBeGreaterThanOrEqual(2); // In metric card and in review panel

    // Change Risk filter to "High Risk Only" (which excludes Sanjai)
    const riskSelect = screen.getByLabelText(/Risk Level Filter/i);
    fireEvent.change(riskSelect, { target: { value: 'High Risk' } });

    // Sanjai is now excluded from the filtered roster
    expect(screen.queryByText('Sanjai Karthikeyan')).not.toBeInTheDocument();
    expect(screen.getByText('Aravind Mohan')).toBeInTheDocument();

    // Review panel must clear stale Sanjai student info
    expect(screen.getByText('No Student Selected')).toBeInTheDocument();

    // Click on Aravind Mohan
    fireEvent.click(screen.getByText('Aravind Mohan'));
    expect(screen.queryByText('No Student Selected')).not.toBeInTheDocument();
    expect(screen.getAllByText('Aravind Mohan').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/62\.5%/).length).toBeGreaterThanOrEqual(2);
  });

  it('17. FacultyRiskOverview renders "← Back" button and invokes onBack when clicked', async () => {
    api.getFacultyCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyRiskOverview.mockResolvedValue({
      totalAnalyzed: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      highRiskPercentage: 0,
      studentPredictions: [],
      modelStatus: 'Online',
    });

    const handleBack = vi.fn();
    render(
      <FacultyRiskOverview
        selectedCourseId={null}
        onSelectCourse={vi.fn()}
        onBack={handleBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Risk Advisor/i })).toBeInTheDocument();
    });

    const backBtn = screen.getByRole('button', { name: /← Back/i });
    expect(backBtn).toBeInTheDocument();
    expect(backBtn).toHaveClass('faculty-back-btn');

    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('18. FacultyRiskOverview invokes onNavigate with previousTab or defaults to dashboard', async () => {
    api.getFacultyCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyRiskOverview.mockResolvedValue({
      totalAnalyzed: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      highRiskPercentage: 0,
      studentPredictions: [],
      modelStatus: 'Online',
    });

    const handleNavigate = vi.fn();
    const { unmount } = render(
      <FacultyRiskOverview
        selectedCourseId={null}
        onSelectCourse={vi.fn()}
        onNavigate={handleNavigate}
        previousTab="courses"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Risk Advisor/i })).toBeInTheDocument();
    });

    const backBtn = screen.getByRole('button', { name: /← Back/i });
    fireEvent.click(backBtn);
    expect(handleNavigate).toHaveBeenCalledWith('courses');

    unmount();

    // Without previousTab (direct access fallback)
    render(
      <FacultyRiskOverview
        selectedCourseId={null}
        onSelectCourse={vi.fn()}
        onNavigate={handleNavigate}
        previousTab={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Risk Advisor/i })).toBeInTheDocument();
    });

    const backBtn2 = screen.getByRole('button', { name: /← Back/i });
    fireEvent.click(backBtn2);
    expect(handleNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('19. FacultyLayout navigates from Dashboard to Risk Advisor and returns to Dashboard via ← Back button', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyRiskOverview.mockResolvedValue({
      totalAnalyzed: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      highRiskPercentage: 0,
      studentPredictions: [],
      modelStatus: 'Online',
    });

    render(<FacultyLayout currentUser={mockFacultyUser} onLogout={vi.fn()} />);

    // Initially on Dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Dr. K. Sharma!')).toBeInTheDocument();
    });

    // Navigate to Risk Advisor via sidebar nav item
    const riskNav = screen.getByTitle('Risk Advisor (ML)');
    fireEvent.click(riskNav);

    // Now on Student Risk Advisor
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Risk Advisor/i })).toBeInTheDocument();
    });

    // Click "← Back" button
    const backBtn = screen.getByRole('button', { name: /← Back/i });
    fireEvent.click(backBtn);

    // Returned to Dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Dr. K. Sharma!')).toBeInTheDocument();
    });
  });

  it('20. FacultyLayout navigates from Courses to Risk Advisor and returns to Courses via ← Back button', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyRiskOverview.mockResolvedValue({
      totalAnalyzed: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      highRiskPercentage: 0,
      studentPredictions: [],
      modelStatus: 'Online',
    });

    render(<FacultyLayout currentUser={mockFacultyUser} onLogout={vi.fn()} />);

    // Switch to My Courses
    const coursesNav = screen.getByTitle('My Courses');
    fireEvent.click(coursesNav);

    await waitFor(() => {
      expect(screen.getByText('My Teaching Courses')).toBeInTheDocument();
    });

    // Switch to Risk Advisor
    const riskNav = screen.getByTitle('Risk Advisor (ML)');
    fireEvent.click(riskNav);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Risk Advisor/i })).toBeInTheDocument();
    });

    // Click "← Back"
    const backBtn = screen.getByRole('button', { name: /← Back/i });
    fireEvent.click(backBtn);

    // Returned to My Courses!
    await waitFor(() => {
      expect(screen.getByText('My Teaching Courses')).toBeInTheDocument();
    });
  });

  it('21. FacultyLayout falls back to Dashboard when Risk Advisor is accessed directly with no prior route', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyCourses.mockResolvedValue(mockAssignedCourses);
    api.getFacultyRiskOverview.mockResolvedValue({
      totalAnalyzed: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      highRiskPercentage: 0,
      studentPredictions: [],
      modelStatus: 'Online',
    });

    // Directly access Risk Advisor
    render(<FacultyLayout currentUser={mockFacultyUser} onLogout={vi.fn()} initialTab="risk" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Risk Advisor/i })).toBeInTheDocument();
    });

    // Click "← Back"
    const backBtn = screen.getByRole('button', { name: /← Back/i });
    fireEvent.click(backBtn);

    // Falls back to Faculty Dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Dr. K. Sharma!')).toBeInTheDocument();
    });
  });
});

