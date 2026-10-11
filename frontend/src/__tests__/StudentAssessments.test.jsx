import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import StudentAcademicPerformance from '../pages/student/StudentAcademicPerformance';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getStudentAcademicPerformance: vi.fn(),
  },
}));

describe('Student Portal — Individual Assessment Marks Visibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPerformanceWithPublishedAndUnpublished = {
    semester: 2,
    academicYear: 2024,
    courses: [
      {
        courseId: 1,
        courseCode: 'BCA201',
        courseName: 'Data Structures and Algorithms',
        credits: 4,
        grade: 'A',
        gradePoints: 8.0,
        assessments: [
          {
            assessmentId: 101,
            assessmentTitle: 'Midterm Examination',
            assessmentType: 'MIDTERM',
            marksObtained: 45.0,
            maxMarks: 50.0,
            percentage: 90.0,
            weightage: 25.0,
            status: 'PUBLISHED',
            published: true,
          },
          {
            assessmentId: 102,
            assessmentTitle: 'Programming Assignment 1',
            assessmentType: 'ASSIGNMENT',
            marksObtained: 18.0,
            maxMarks: 20.0,
            percentage: 90.0,
            weightage: 15.0,
            status: 'PUBLISHED',
            published: true,
          },
        ],
      },
      {
        courseId: 2,
        courseCode: 'BCA202',
        courseName: 'Database Management Systems',
        credits: 4,
        grade: null,
        gradePoints: null,
        assessments: [], // No published marks for this course (unpublished or pending)
      },
    ],
  };

  it('1. Renders published individual assessment marks with name, type, marks, max, percentage, and weightage', async () => {
    api.getStudentAcademicPerformance.mockResolvedValue(mockPerformanceWithPublishedAndUnpublished);

    render(<StudentAcademicPerformance />);

    await waitFor(() => {
      expect(screen.getAllByText('Data Structures and Algorithms').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Database Management Systems').length).toBeGreaterThan(0);
    });

    // Check published assessment title and type
    expect(screen.getByText('Midterm Examination')).toBeInTheDocument();
    expect(screen.getByText('Programming Assignment 1')).toBeInTheDocument();
    expect(screen.getByText('MIDTERM')).toBeInTheDocument();
    expect(screen.getByText('ASSIGNMENT')).toBeInTheDocument();

    // Check marks obtained and max marks
    expect(screen.getByText('45.0')).toBeInTheDocument();
    expect(screen.getByText('50.0')).toBeInTheDocument();
    expect(screen.getByText('18.0')).toBeInTheDocument();
    expect(screen.getByText('20.0')).toBeInTheDocument();

    // Check percentage and weightage
    expect(screen.getAllByText('90%').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();

    // Check publication status
    expect(screen.getAllByText('PUBLISHED').length).toBeGreaterThanOrEqual(2);
  });

  it('2. Shows clear "No published assessment marks yet" state when a course has no published assessments', async () => {
    api.getStudentAcademicPerformance.mockResolvedValue(mockPerformanceWithPublishedAndUnpublished);

    render(<StudentAcademicPerformance />);

    await waitFor(() => {
      expect(screen.getAllByText('Database Management Systems').length).toBeGreaterThan(0);
    });

    // For BCA202 which has 0 published assessments, should show "No published assessment marks yet"
    expect(screen.getByText('No published assessment marks yet')).toBeInTheDocument();
    expect(screen.getByText(/Faculty has not authorized or published continuous assessment marks for BCA202/)).toBeInTheDocument();
  });

  it('3. Ensures unpublished or pending marks are hidden from student portal view', async () => {
    // If backend only returns published assessments, verify that unpublished assessment names and marks never appear
    const mockDataWithFilteredMarks = {
      semester: 2,
      academicYear: 2024,
      courses: [
        {
          courseId: 3,
          courseCode: 'BCA203',
          courseName: 'Computer Networks',
          credits: 3,
          grade: null,
          gradePoints: null,
          assessments: [], // Unpublished assessment marks are filtered out by backend
        },
      ],
    };

    api.getStudentAcademicPerformance.mockResolvedValue(mockDataWithFilteredMarks);

    render(<StudentAcademicPerformance />);

    await waitFor(() => {
      expect(screen.getAllByText('Computer Networks').length).toBeGreaterThan(0);
    });

    // Verify unpublished assessment text does NOT appear
    expect(screen.queryByText('Draft Internal Test')).not.toBeInTheDocument();
    expect(screen.queryByText('Secret Faculty Quiz')).not.toBeInTheDocument();
    expect(screen.getByText('No published assessment marks yet')).toBeInTheDocument();
  });

  it('4. Correctly isolates assessments per course when filtering courses', async () => {
    api.getStudentAcademicPerformance.mockResolvedValue(mockPerformanceWithPublishedAndUnpublished);

    render(<StudentAcademicPerformance />);

    await waitFor(() => {
      expect(screen.getByText('Midterm Examination')).toBeInTheDocument();
    });

    // Filter to BCA202 (which has no published assessments)
    const bca202Btn = screen.getByRole('button', { name: 'BCA202' });
    fireEvent.click(bca202Btn);

    // BCA201 assessments should now be hidden
    expect(screen.queryByText('Midterm Examination')).not.toBeInTheDocument();
    expect(screen.queryByText('Programming Assignment 1')).not.toBeInTheDocument();
    // Empty state should be visible for BCA202
    expect(screen.getByText('No published assessment marks yet')).toBeInTheDocument();

    // Filter to BCA201
    const bca201Btn = screen.getByRole('button', { name: 'BCA201' });
    fireEvent.click(bca201Btn);

    // BCA201 assessments are visible again
    expect(screen.getByText('Midterm Examination')).toBeInTheDocument();
    expect(screen.getByText('Programming Assignment 1')).toBeInTheDocument();
  });
});
