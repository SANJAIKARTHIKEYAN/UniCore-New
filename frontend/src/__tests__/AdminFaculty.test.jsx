import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import AdminFaculty from '../pages/admin/AdminFaculty';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getAdminFaculty: vi.fn(),
    getAdminFacultyCourses: vi.fn(),
    createAdminFaculty: vi.fn(),
    updateAdminFaculty: vi.fn(),
    deleteAdminFaculty: vi.fn(),
  },
}));

const mockFacultyList = [
  {
    id: 10,
    facultyId: 'BCA-FAC-001',
    name: 'Dr. Alan Turing',
    email: 'bca.fac001@unicore.edu',
    department: 'BCA',
    status: 'ACTIVE',
    assignedCoursesCount: 2,
    assignedCourses: [
      {
        id: 1,
        courseCode: 'BCA101',
        courseName: 'Programming Fundamentals in C',
        semester: 1,
        credits: 4,
        department: 'BCA',
      },
      {
        id: 2,
        courseCode: 'BCA102',
        courseName: 'Digital Logic & Computer Design',
        semester: 1,
        credits: 3,
        department: 'BCA',
      },
    ],
  },
  {
    id: 11,
    facultyId: 'BCA-FAC-002',
    name: 'Dr. Grace Hopper',
    email: 'bca.fac002@unicore.edu',
    department: 'BCA',
    status: 'ACTIVE',
    assignedCoursesCount: 0,
    assignedCourses: [],
  },
];

describe('Admin Portal — Faculty Assigned Courses View Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAdminFaculty.mockResolvedValue([...mockFacultyList]);
  });

  it('renders faculty table with clickable assigned courses counts', async () => {
    render(<AdminFaculty />);

    await waitFor(() => {
      expect(screen.getByText('Faculty Member Management')).toBeInTheDocument();
      expect(screen.getByText('Dr. Alan Turing')).toBeInTheDocument();
      expect(screen.getByText('Dr. Grace Hopper')).toBeInTheDocument();
    });

    const coursesBtn = screen.getByRole('button', { name: /View courses assigned to Dr\. Alan Turing/i });
    expect(coursesBtn).toBeInTheDocument();
    expect(coursesBtn).toHaveTextContent(/2 Courses/);
  });

  it('clicking assigned courses count opens modal with courses and details', async () => {
    api.getAdminFacultyCourses.mockResolvedValue(mockFacultyList[0].assignedCourses);

    render(<AdminFaculty />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Alan Turing')).toBeInTheDocument();
    });

    const coursesBtn = screen.getByRole('button', { name: /View courses assigned to Dr\. Alan Turing/i });
    fireEvent.click(coursesBtn);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText(/Assigned Courses — Dr\. Alan Turing/i)).toBeInTheDocument();
      expect(screen.getByText('BCA101')).toBeInTheDocument();
      expect(screen.getByText('Programming Fundamentals in C')).toBeInTheDocument();
      expect(screen.getByText('BCA102')).toBeInTheDocument();
      expect(screen.getByText('Digital Logic & Computer Design')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Sem 1')).toHaveLength(2);
    expect(screen.getByText('4 cr')).toBeInTheDocument();
    expect(screen.getByText('3 cr')).toBeInTheDocument();
    expect(screen.getByText(/Total Assigned:/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Assigned Courses — Dr\. Alan Turing/i)).not.toBeInTheDocument();
    });
  });

  it('shows clear "No courses assigned" empty state when faculty has zero courses', async () => {
    api.getAdminFacultyCourses.mockResolvedValue([]);

    render(<AdminFaculty />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Grace Hopper')).toBeInTheDocument();
    });

    const coursesBtn = screen.getByRole('button', { name: /View courses assigned to Dr\. Grace Hopper/i });
    fireEvent.click(coursesBtn);

    await waitFor(() => {
      expect(screen.getByText(/Assigned Courses — Dr\. Grace Hopper/i)).toBeInTheDocument();
      expect(screen.getByText('No courses assigned')).toBeInTheDocument();
      expect(screen.getByText(/currently has no teaching course assignments/i)).toBeInTheDocument();
    });
  });
});
