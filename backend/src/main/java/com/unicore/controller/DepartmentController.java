package com.unicore.controller;

import com.unicore.entity.Department;
import com.unicore.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<List<Department>> getAllActiveDepartments() {
        return ResponseEntity.ok(departmentService.getActiveDepartments());
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Department> getDepartmentByShortCode(@PathVariable String shortCode) {
        return ResponseEntity.ok(departmentService.getDepartmentByShortCode(shortCode));
    }
}
