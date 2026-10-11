import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import AdminDepartments from '../pages/admin/AdminDepartments';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getAdminDepartments: vi.fn(),
    createDepartment: vi.fn(),
    updateDepartment: vi.fn(),
    toggleDepartmentStatus: vi.fn(),
  },
}));

const mockDepartments = [
  {
    id: 1,
    name: 'Bachelor of Computer Applications',
    shortCode: 'BCA',
    code: 'BCA',
    headOfDepartment: 'Dr. Alan Turing',
    description: 'Undergraduate computing department',
    active: true,
  },
  {
    id: 2,
    name: 'Bachelor of Science in Computer Science',
    shortCode: 'BSCS',
    code: 'BSCS',
    headOfDepartment: 'Dr. Grace Hopper',
    description: 'Foundations of computer systems',
    active: true,
  },
];

describe('Admin Portal — Department Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAdminDepartments.mockResolvedValue([...mockDepartments]);
  });

  it('renders department cards, badges, and metrics correctly', async () => {
    render(<AdminDepartments />);

    await waitFor(() => {
      expect(screen.getByText('Departments & Institutional Setup')).toBeInTheDocument();
      expect(screen.getByText('Bachelor of Computer Applications')).toBeInTheDocument();
      expect(screen.getByText('Bachelor of Science in Computer Science')).toBeInTheDocument();
    });

    expect(screen.getByText('BCA')).toBeInTheDocument();
    expect(screen.getByText('BSCS')).toBeInTheDocument();
    expect(screen.getByText('Dr. Alan Turing')).toBeInTheDocument();
  });

  it('opens creation modal via "+ New Department", validates required inputs, creates department and refreshes list', async () => {
    const newDept = {
      id: 3,
      name: 'Data Science & Artificial Intelligence',
      shortCode: 'DSAI',
      code: 'DSAI',
      headOfDepartment: 'Dr. Geoffrey Hinton',
      description: 'Department of modern AI systems',
      active: true,
    };
    api.createDepartment.mockResolvedValue(newDept);

    render(<AdminDepartments />);

    await waitFor(() => {
      expect(screen.getByText('Bachelor of Computer Applications')).toBeInTheDocument();
    });

    // Click "+ New Department"
    const newDeptBtn = screen.getByRole('button', { name: '+ New Department' });
    fireEvent.click(newDeptBtn);

    // Modal dialog opens
    expect(screen.getByText('Create New Department')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Department Name \*/);
    const codeInput = screen.getByLabelText(/Dept\. Code \*/);
    const hodInput = screen.getByLabelText(/Head of Department/);
    const descInput = screen.getByLabelText(/Description/);

    expect(nameInput.value).toBe('');
    expect(codeInput.value).toBe('');

    // Fill form
    fireEvent.change(nameInput, { target: { value: 'Data Science & Artificial Intelligence' } });
    fireEvent.change(codeInput, { target: { value: 'DSAI' } });
    fireEvent.change(hodInput, { target: { value: 'Dr. Geoffrey Hinton' } });
    fireEvent.change(descInput, { target: { value: 'Department of modern AI systems' } });

    // Mock refreshed list
    api.getAdminDepartments.mockResolvedValue([...mockDepartments, newDept]);

    const submitBtn = screen.getByRole('button', { name: 'Create Department' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createDepartment).toHaveBeenCalledWith({
        name: 'Data Science & Artificial Intelligence',
        shortCode: 'DSAI',
        code: 'DSAI',
        headOfDepartment: 'Dr. Geoffrey Hinton',
        description: 'Department of modern AI systems',
        active: true,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
      expect(api.getAdminDepartments).toHaveBeenCalledTimes(2);
    });
  });

  it('opens Edit modal pre-filled with selected department data, saves updates and refreshes list', async () => {
    const updatedDept = {
      ...mockDepartments[0],
      name: 'Department of Computing Applications (BCA)',
      headOfDepartment: 'Dr. Ada Lovelace',
    };
    api.updateDepartment.mockResolvedValue(updatedDept);

    render(<AdminDepartments />);

    await waitFor(() => {
      expect(screen.getByText('Bachelor of Computer Applications')).toBeInTheDocument();
    });

    // Click Edit button for BCA
    const editBtns = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editBtns[0]);

    // Modal dialog opens
    expect(screen.getByText('Edit Department')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Department Name \*/);
    const codeInput = screen.getByLabelText(/Dept\. Code \*/);
    const hodInput = screen.getByLabelText(/Head of Department/);

    // Verify existing data is pre-filled
    expect(nameInput.value).toBe('Bachelor of Computer Applications');
    expect(codeInput.value).toBe('BCA');
    expect(hodInput.value).toBe('Dr. Alan Turing');

    // Update fields
    fireEvent.change(nameInput, { target: { value: 'Department of Computing Applications (BCA)' } });
    fireEvent.change(hodInput, { target: { value: 'Dr. Ada Lovelace' } });

    api.getAdminDepartments.mockResolvedValue([updatedDept, mockDepartments[1]]);

    const saveBtn = screen.getByRole('button', { name: 'Update Department' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateDepartment).toHaveBeenCalledWith(1, {
        name: 'Department of Computing Applications (BCA)',
        shortCode: 'BCA',
        code: 'BCA',
        headOfDepartment: 'Dr. Ada Lovelace',
        description: 'Undergraduate computing department',
        active: true,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/updated successfully/i)).toBeInTheDocument();
      expect(api.getAdminDepartments).toHaveBeenCalledTimes(2);
    });
  });

  it('prevents duplicate department code and duplicate department name', async () => {
    render(<AdminDepartments />);

    await waitFor(() => {
      expect(screen.getByText('Bachelor of Computer Applications')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '+ New Department' }));

    const nameInput = screen.getByLabelText(/Department Name \*/);
    const codeInput = screen.getByLabelText(/Dept\. Code \*/);
    const submitBtn = screen.getByRole('button', { name: 'Create Department' });

    // Try duplicate code "BCA"
    fireEvent.change(nameInput, { target: { value: 'New Program' } });
    fireEvent.change(codeInput, { target: { value: 'BCA' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Department code "BCA" already exists/i)).toBeInTheDocument();
      expect(api.createDepartment).not.toHaveBeenCalled();
    });

    // Try duplicate name
    fireEvent.change(nameInput, { target: { value: 'Bachelor of Science in Computer Science' } });
    fireEvent.change(codeInput, { target: { value: 'NEWCODE' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Department name "Bachelor of Science in Computer Science" already exists/i)).toBeInTheDocument();
      expect(api.createDepartment).not.toHaveBeenCalled();
    });
  });
});
