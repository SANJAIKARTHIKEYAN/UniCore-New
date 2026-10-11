package com.unicore.service;

import com.unicore.entity.Department;
import com.unicore.exception.BadRequestException;
import com.unicore.exception.ResourceNotFoundException;
import com.unicore.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Department> getActiveDepartments() {
        return departmentRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Department getDepartmentByCodeOrName(String identifier) {
        String trimmed = identifier.trim();
        return departmentRepository.findByShortCodeIgnoreCase(trimmed)
                .or(() -> departmentRepository.findByNameIgnoreCase(trimmed))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with code or name: " + identifier));
    }

    @Transactional(readOnly = true)
    public Department getDepartmentByShortCode(String shortCode) {
        return getDepartmentByCodeOrName(shortCode);
    }

    @Transactional
    public Department createDepartment(Department department) {
        String code = department.getShortCode();
        if (code == null || code.trim().isEmpty()) {
            code = department.getCode();
        }
        if (code == null || code.trim().isEmpty()) {
            throw new BadRequestException("Department short code is required");
        }
        if (department.getName() == null || department.getName().trim().isEmpty()) {
            throw new BadRequestException("Department name is required");
        }
        String shortCode = code.trim().toUpperCase();
        if (departmentRepository.existsByShortCodeIgnoreCase(shortCode)) {
            throw new BadRequestException("Department already exists with code: " + shortCode);
        }
        String name = department.getName().trim();
        if (departmentRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Department already exists with name: " + name);
        }
        department.setShortCode(shortCode);
        department.setName(name);
        if (department.getHeadOfDepartment() != null) {
            department.setHeadOfDepartment(department.getHeadOfDepartment().trim());
        }
        if (department.getDescription() != null) {
            department.setDescription(department.getDescription().trim());
        }
        return departmentRepository.save(department);
    }

    @Transactional
    public Department updateDepartment(Long id, Department updated) {
        Department existing = getDepartmentById(id);

        if (updated.getName() != null && !updated.getName().trim().isEmpty()) {
            String newName = updated.getName().trim();
            if (!newName.equalsIgnoreCase(existing.getName()) && departmentRepository.existsByNameIgnoreCase(newName)) {
                throw new BadRequestException("Department already exists with name: " + newName);
            }
            existing.setName(newName);
        }
        String code = updated.getShortCode();
        if (code == null || code.trim().isEmpty()) {
            code = updated.getCode();
        }
        if (code != null && !code.trim().isEmpty()) {
            String newCode = code.trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(existing.getShortCode()) && departmentRepository.existsByShortCodeIgnoreCase(newCode)) {
                throw new BadRequestException("Department code already in use: " + newCode);
            }
            existing.setShortCode(newCode);
        }
        if (updated.getHeadOfDepartment() != null) {
            existing.setHeadOfDepartment(updated.getHeadOfDepartment().trim());
        }
        if (updated.getDescription() != null) {
            existing.setDescription(updated.getDescription().trim());
        }
        existing.setActive(updated.isActive());
        return departmentRepository.save(existing);
    }

    @Transactional
    public Department toggleDepartmentStatus(Long id) {
        Department existing = getDepartmentById(id);
        existing.setActive(!existing.isActive());
        return departmentRepository.save(existing);
    }
}
