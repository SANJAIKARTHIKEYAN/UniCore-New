import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import AdminCourses from '../pages/admin/AdminCourses';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getAdminCourses: vi.fn(),
    getAdminFaculty: vi.fn(),
    getDepartments: vi.fn(),
    createAdminCourse: vi.fn(),
    updateAdminCourse: vi.fn(),
    assignFacultyToCourse: vi.fn(),
    unassignFacultyFromCourse: vi.fn(),
    deleteAdminCourse: vi.fn(),
  },
}));

const mockCourses = [
  {
    id: 1,
    courseCode: 'BCA101',
    courseName: 'Programming Fundamentals in C',
    department: 'BCA',
    semester: 1,
    credits: 4,
    instructorId: 10,
    instructorName: 'Dr. Alan Turing',
    enrolledCount: 30,
  },
  {
    id: 2,
    courseCode: 'BCA102',
    courseName: 'Digital Logic and Computer Design',
    department: 'BCA',
    semester: 1,
    credits: 3,
    instructorId: null,
    instructorName: null,
    enrolledCount: 25,
  },
];

const mockFaculty = [
  {
    id: 10,
    facultyId: 'FAC001',
    name: 'Dr. Alan Turing',
    department: 'BCA',
    status: 'ACTIVE',
  },
  {
    id: 11,
    facultyId: 'FAC002',
    name: 'Dr. Grace Hopper',
    department: 'BCA',
    status: 'ACTIVE',
  },
];

const mockDepartments = [
  { id: 1, name: 'Bachelor of Computer Applications', shortCode: 'BCA' },
  { id: 2, name: 'Bachelor of Science in Computer Science', shortCode: 'BSCS' },
];

describe('Admin Portal — Course Catalog Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAdminCourses.mockResolvedValue([...mockCourses]);
    api.getAdminFaculty.mockResolvedValue([...mockFaculty]);
    api.getDepartments.mockResolvedValue([...mockDepartments]);
  });

  it('renders courses table and catalog statistics correctly', async () => {
    render(<AdminCourses />);

    await waitFor(() => {
      expect(screen.getByText('University Course Catalog')).toBeInTheDocument();
      expect(screen.getByText('BCA101')).toBeInTheDocument();
      expect(screen.getByText('BCA102')).toBeInTheDocument();
    });

    expect(screen.getByText(/Dr\. Alan Turing/)).toBeInTheDocument();
    expect(screen.getByText('+ Assign Faculty')).toBeInTheDocument();
  });

  it('opens Create Course modal, validates input, creates course and refreshes catalog', async () => {
    const newCourse = {
      id: 3,
      courseCode: 'BCA201',
      courseName: 'Data Structures and Algorithms',
      department: 'BCA',
      semester: 2,
      credits: 4,
      instructorId: 11,
      instructorName: 'Dr. Grace Hopper',
      enrolledCount: 0,
    };

    api.createAdminCourse.mockResolvedValue(newCourse);

    render(<AdminCourses />);

    await waitFor(() => {
      expect(screen.getByText('BCA101')).toBeInTheDocument();
    });

    // Click "+ Create New Course" button
    const createBtn = screen.getByText('+ Create New Course');
    fireEvent.click(createBtn);

    // Modal dialog should now be visible
    expect(screen.getByText('Add New University Course')).toBeInTheDocument();

    // Fill form fields
    const codeInput = screen.getByLabelText(/^Course Code/);
    const titleInput = screen.getByLabelText(/^Course Title/);
    const semInput = screen.getByLabelText(/^Semester \*/);
    const creditsInput = screen.getByLabelText(/^Credits \*/);

    fireEvent.change(codeInput, { target: { value: 'BCA201' } });
    fireEvent.change(titleInput, { target: { value: 'Data Structures and Algorithms' } });
    fireEvent.change(semInput, { target: { value: '2' } });
    fireEvent.change(creditsInput, { target: { value: '4' } });

    // When created, API should refresh list with new course included
    api.getAdminCourses.mockResolvedValue([...mockCourses, newCourse]);

    const submitBtn = screen.getByRole('button', { name: 'Create Course' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createAdminCourse).toHaveBeenCalledWith({
        courseCode: 'BCA201',
        courseName: 'Data Structures and Algorithms',
        department: 'BCA',
        semester: 2,
        credits: 4,
        instructorId: null,
      });
    });

    // Should display success message and refresh
    await waitFor(() => {
      expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
      expect(api.getAdminCourses).toHaveBeenCalledTimes(2);
    });
  });

  it('validates duplicate course code before creating', async () => {
    render(<AdminCourses />);

    await waitFor(() => {
      expect(screen.getByText('BCA101')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Create New Course'));

    const codeInput = screen.getByLabelText(/Course Code/);
    const titleInput = screen.getByLabelText(/Course Title/);

    // Enter existing code BCA101
    fireEvent.change(codeInput, { target: { value: 'BCA101' } });
    fireEvent.change(titleInput, { target: { value: 'Duplicate Course Test' } });

    const submitBtn = screen.getByRole('button', { name: 'Create Course' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/already exists in the course catalog/i)).toBeInTheDocument();
      expect(api.createAdminCourse).not.toHaveBeenCalled();
    });
  });

  it('opens Edit Course modal with pre-filled data, submits updates and refreshes', async () => {
    const updatedCourse = {
      ...mockCourses[0],
      courseName: 'Advanced Programming in C and C++',
      credits: 5,
    };
    api.updateAdminCourse.mockResolvedValue(updatedCourse);

    render(<AdminCourses />);

    await waitFor(() => {
      expect(screen.getByText('BCA101')).toBeInTheDocument();
    });

    // Click Edit button for BCA101
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editButtons[0]);

    // Modal dialog should open with courseCode in header
    expect(screen.getByText(/Edit Course — BCA101/)).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Course Title \*/);
    expect(titleInput.value).toBe('Programming Fundamentals in C');

    // Update title
    fireEvent.change(titleInput, { target: { value: 'Advanced Programming in C and C++' } });

    const saveBtn = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateAdminCourse).toHaveBeenCalledWith(1, {
        courseName: 'Advanced Programming in C and C++',
        department: 'BCA',
        semester: 1,
        credits: 4,
        instructorId: 10,
      });
      expect(screen.getByText(/updated successfully/i)).toBeInTheDocument();
      expect(api.getAdminCourses).toHaveBeenCalledTimes(2);
    });
  });

  it('opens Assign Faculty modal, selects instructor, submits assignment and refreshes', async () => {
    api.assignFacultyToCourse.mockResolvedValue({
      ...mockCourses[1],
      instructorId: 11,
      instructorName: 'Dr. Grace Hopper',
    });

    render(<AdminCourses />);

    await waitFor(() => {
      expect(screen.getByText('BCA102')).toBeInTheDocument();
    });

    // Click Assign Faculty button for BCA102
    const assignButtons = screen.getAllByRole('button', { name: /Assign Faculty/i });
    fireEvent.click(assignButtons[0]);

    // Assign modal should open
    expect(screen.getByText(/Assign Faculty to BCA102/)).toBeInTheDocument();
    expect(screen.getByText('None (Unassigned)')).toBeInTheDocument();

    // Select Dr. Grace Hopper
    const facultySelect = screen.getByLabelText(/Select Teaching Faculty Member:/);
    fireEvent.change(facultySelect, { target: { value: '11' } });

    const confirmBtn = screen.getByRole('button', { name: 'Confirm Assignment' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.assignFacultyToCourse).toHaveBeenCalledWith(2, 11);
      expect(screen.getByText(/Faculty assignment updated for BCA102/i)).toBeInTheDocument();
      expect(api.getAdminCourses).toHaveBeenCalledTimes(2);
    });
  });
});
