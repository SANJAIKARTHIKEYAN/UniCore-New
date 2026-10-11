package com.unicore.controller;

import com.unicore.dto.request.*;
import com.unicore.dto.response.*;
import com.unicore.entity.ApprovedFaculty;
import com.unicore.entity.ApprovedStudent;
import com.unicore.entity.Department;
import com.unicore.service.AdminService;
import com.unicore.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final DepartmentService departmentService;

    public AdminController(AdminService adminService, DepartmentService departmentService) {
        this.adminService = adminService;
        this.departmentService = departmentService;
    }

    // ==========================================
    // Dashboard
    // ==========================================
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==========================================
    // Student Management
    // ==========================================
    @GetMapping("/students")
    public ResponseEntity<List<AdminStudentResponse>> getStudents(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getStudents(search));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<AdminStudentResponse> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getStudentById(id));
    }

    @PostMapping("/students")
    public ResponseEntity<AdminStudentResponse> createStudent(@Valid @RequestBody CreateStudentAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createStudent(request));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<AdminStudentResponse> updateStudent(@PathVariable Long id,
                                                              @RequestBody UpdateStudentAdminRequest request) {
        return ResponseEntity.ok(adminService.updateStudent(id, request));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<MessageResponse> deleteStudent(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteStudent(id));
    }

    // ==========================================
    // Faculty Management
    // ==========================================
    @GetMapping("/faculty")
    public ResponseEntity<List<AdminFacultyResponse>> getFaculty(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getFaculty(search));
    }

    @GetMapping("/faculty/{id}")
    public ResponseEntity<AdminFacultyResponse> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getFacultyById(id));
    }

    @GetMapping("/faculty/{id}/courses")
    public ResponseEntity<List<AdminCourseResponse>> getFacultyAssignedCourses(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getFacultyAssignedCourses(id));
    }

    @PostMapping("/faculty")
    public ResponseEntity<AdminFacultyResponse> createFaculty(@Valid @RequestBody CreateFacultyAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createFaculty(request));
    }

    @PutMapping("/faculty/{id}")
    public ResponseEntity<AdminFacultyResponse> updateFaculty(@PathVariable Long id,
                                                              @RequestBody UpdateFacultyAdminRequest request) {
        return ResponseEntity.ok(adminService.updateFaculty(id, request));
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<MessageResponse> deleteFaculty(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteFaculty(id));
    }

    // ==========================================
    // Course Management
    // ==========================================
    @GetMapping("/courses")
    public ResponseEntity<List<AdminCourseResponse>> getCourses(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(adminService.getCourses(department, semester));
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<AdminCourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getCourseById(id));
    }

    @PostMapping("/courses")
    public ResponseEntity<AdminCourseResponse> createCourse(@Valid @RequestBody CreateCourseAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createCourse(request));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<AdminCourseResponse> updateCourse(@PathVariable Long id,
                                                            @RequestBody UpdateCourseAdminRequest request) {
        return ResponseEntity.ok(adminService.updateCourse(id, request));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<MessageResponse> deleteCourse(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteCourse(id));
    }

    @PostMapping("/courses/{courseId}/assign-faculty")
    public ResponseEntity<AdminCourseResponse> assignFacultyToCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody AssignFacultyRequest request) {
        return ResponseEntity.ok(adminService.assignFacultyToCourse(courseId, request.getFacultyId()));
    }

    @DeleteMapping("/courses/{courseId}/assign-faculty/{facultyId}")
    public ResponseEntity<AdminCourseResponse> unassignFacultyFromCourse(
            @PathVariable Long courseId,
            @PathVariable Long facultyId) {
        return ResponseEntity.ok(adminService.unassignFacultyFromCourse(courseId, facultyId));
    }

    // ==========================================
    // Enrollments Overview
    // ==========================================
    @GetMapping("/enrollments")
    public ResponseEntity<List<AdminEnrollmentResponse>> getEnrollments(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(adminService.getEnrollments(courseId, studentId, semester));
    }

    // ==========================================
    // Summaries
    // ==========================================
    @GetMapping("/attendance/summary")
    public ResponseEntity<AdminAttendanceSummaryResponse> getAttendanceSummary() {
        return ResponseEntity.ok(adminService.getAttendanceSummary());
    }

    @GetMapping("/assessments/summary")
    public ResponseEntity<AdminAssessmentSummaryResponse> getAssessmentsSummary() {
        return ResponseEntity.ok(adminService.getAssessmentsSummary());
    }

    // ==========================================
    // Existing Endpoints Preserved
    // ==========================================
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(department));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department department) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, department));
    }

    @PatchMapping("/departments/{id}/status")
    public ResponseEntity<Department> toggleDepartmentStatus(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.toggleDepartmentStatus(id));
    }

    @GetMapping("/approved-students")
    public ResponseEntity<List<ApprovedStudent>> getApprovedStudentsRoster() {
        return ResponseEntity.ok(adminService.getApprovedStudentsRoster());
    }

    @PostMapping("/approved-students")
    public ResponseEntity<ApprovedStudent> addApprovedStudent(@RequestBody ApprovedStudent student) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addApprovedStudent(student));
    }

    @PatchMapping("/approved-students/{id}/status")
    public ResponseEntity<ApprovedStudent> toggleApprovedStudentStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleApprovedStudentStatus(id));
    }

    @GetMapping("/approved-faculty")
    public ResponseEntity<List<ApprovedFaculty>> getApprovedFacultyRoster() {
        return ResponseEntity.ok(adminService.getApprovedFacultyRoster());
    }

    @PostMapping("/approved-faculty")
    public ResponseEntity<ApprovedFaculty> addApprovedFaculty(@RequestBody ApprovedFaculty faculty) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addApprovedFaculty(faculty));
    }

    @PatchMapping("/approved-faculty/{id}/status")
    public ResponseEntity<ApprovedFaculty> toggleApprovedFacultyStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleApprovedFacultyStatus(id));
    }
}
