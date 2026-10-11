import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import AdminStudents from '../pages/admin/AdminStudents';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getAdminStudents: vi.fn(),
    createAdminStudent: vi.fn(),
    updateAdminStudent: vi.fn(),
    deleteAdminStudent: vi.fn(),
  },
}));

const mockStudentsList = [
  {
    id: 101,
    studentId: 'BCA-STU-001',
    name: 'Alice Smith',
    email: 'alice@unicore.edu',
    department: 'BCA',
    status: 'ACTIVE',
    admissionYear: 2024,
    currentSemester: 1,
    derivedYear: '1st Year',
  },
  {
    id: 102,
    studentId: 'BSCS-STU-002',
    name: 'Bob Jones',
    email: 'bob@unicore.edu',
    department: 'BSCS',
    status: 'ACTIVE',
    admissionYear: 2024,
    currentSemester: 1,
    derivedYear: '1st Year',
  },
];

describe('Admin Portal — Student Creation & Automatic Enrollment Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAdminStudents.mockResolvedValue([...mockStudentsList]);
  });

  it('renders student list table and registration action', async () => {
    render(<AdminStudents />);

    await waitFor(() => {
      expect(screen.getByText('Student Account Management')).toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '+ Add New Student' })).toBeInTheDocument();
  });

  it('creates student and displays automatic course enrollment message', async () => {
    const createdStudent = {
      id: 103,
      studentId: 'BCA-STU-050',
      name: 'Charlie Brown',
      email: 'charlie@unicore.edu',
      department: 'BCA',
      status: 'ACTIVE',
      admissionYear: 2024,
      currentSemester: 1,
      derivedYear: '1st Year',
      enrolledCoursesCount: 4,
      enrollmentMessage: 'Automatically enrolled into 4 course(s) for BCA Semester 1.',
    };

    api.createAdminStudent.mockResolvedValue(createdStudent);

    render(<AdminStudents />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '+ Add New Student' }));

    expect(screen.getByText('Register New Student Account')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Full Name \*/), { target: { value: 'Charlie Brown' } });
    fireEvent.change(screen.getByLabelText(/University Email \*/), { target: { value: 'charlie@unicore.edu' } });
    fireEvent.change(screen.getByLabelText(/Student ID \/ Roll No \*/), { target: { value: 'BCA-STU-050' } });
    fireEvent.change(screen.getByLabelText(/Current Semester \*/), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Student' }));

    await waitFor(() => {
      expect(api.createAdminStudent).toHaveBeenCalledWith({
        name: 'Charlie Brown',
        email: 'charlie@unicore.edu',
        password: '',
        department: 'BCA',
        studentId: 'BCA-STU-050',
        admissionYear: expect.any(Number),
        currentSemester: 1,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Student "Charlie Brown" successfully created with ID BCA-STU-050/)).toBeInTheDocument();
      expect(screen.getByText(/Automatically enrolled into 4 course\(s\) for BCA Semester 1\./)).toBeInTheDocument();
    });
  });

  it('handles case where no matching semester courses exist with informative message', async () => {
    const studentWithNoCourses = {
      id: 104,
      studentId: 'BCA-STU-099',
      name: 'David Miller',
      email: 'david@unicore.edu',
      department: 'BCA',
      status: 'ACTIVE',
      admissionYear: 2024,
      currentSemester: 8,
      derivedYear: '4th Year',
      enrolledCoursesCount: 0,
      enrollmentMessage: "No matching semester courses were found in department 'BCA' for semester 8. Automatic enrollment skipped.",
    };

    api.createAdminStudent.mockResolvedValue(studentWithNoCourses);

    render(<AdminStudents />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '+ Add New Student' }));

    fireEvent.change(screen.getByLabelText(/Full Name \*/), { target: { value: 'David Miller' } });
    fireEvent.change(screen.getByLabelText(/University Email \*/), { target: { value: 'david@unicore.edu' } });
    fireEvent.change(screen.getByLabelText(/Student ID \/ Roll No \*/), { target: { value: 'BCA-STU-099' } });
    fireEvent.change(screen.getByLabelText(/Current Semester \*/), { target: { value: '8' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Student' }));

    await waitFor(() => {
      expect(screen.getByText(/No matching semester courses were found in department 'BCA' for semester 8/)).toBeInTheDocument();
    });
  });

  it('opens edit modal pre-filled with student information', async () => {
    render(<AdminStudents />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const editBtns = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Edit Student — Alice Smith/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Alice Smith')).toBeInTheDocument();
    });
  });
});
