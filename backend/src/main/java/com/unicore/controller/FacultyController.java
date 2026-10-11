package com.unicore.controller;

import com.unicore.dto.request.AttendanceSubmitRequest;
import com.unicore.dto.request.CreateAssessmentRequest;
import com.unicore.dto.request.MarkEntryRequest;
import com.unicore.dto.response.AssessmentMarkResponse;
import com.unicore.dto.response.AssessmentResponse;
import com.unicore.dto.response.AttendanceEntryResponse;
import com.unicore.dto.response.CourseSummaryResponse;
import com.unicore.dto.response.FacultyCourseResponse;
import com.unicore.dto.response.FacultyCourseRosterResponse;
import com.unicore.dto.response.FacultyProfileResponse;
import com.unicore.dto.response.MessageResponse;
import com.unicore.dto.response.StudentProfileResponse;
import com.unicore.security.UserPrincipal;
import com.unicore.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping("/me/profile")
    public ResponseEntity<FacultyProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        FacultyProfileResponse response = facultyService.getMyProfile(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/courses")
    public ResponseEntity<List<FacultyCourseResponse>> getMyCourses(@AuthenticationPrincipal UserPrincipal principal) {
        List<FacultyCourseResponse> response = facultyService.getMyAssignedCourses(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses/{id}/students")
    public ResponseEntity<FacultyCourseRosterResponse> getCourseRoster(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        FacultyCourseRosterResponse response = facultyService.getCourseRoster(id, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Fetch the attendance grid for a course on a given date.
     * Returns one entry per enrolled student with their attendance status (null if unmarked).
     */
    @GetMapping("/courses/{id}/attendance")
    public ResponseEntity<List<AttendanceEntryResponse>> getCourseAttendance(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AttendanceEntryResponse> response = facultyService.getAttendanceForDate(id, date, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Submit or update attendance for a batch of students on a given date.
     * Uses upsert logic — existing records are updated, new ones are created.
     */
    @PutMapping("/courses/{id}/attendance")
    public ResponseEntity<MessageResponse> submitCourseAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceSubmitRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MessageResponse response = facultyService.submitAttendance(id, request, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint accessible only by faculty/admin.
     * Enforces that a faculty user cannot access students of another department.
     */
    @GetMapping("/department-students")
    public ResponseEntity<List<StudentProfileResponse>> getDepartmentStudents(
            @RequestParam String department,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<StudentProfileResponse> response = facultyService.getStudentsByDepartment(department, principal);
        return ResponseEntity.ok(response);
    }

    // ================================================================
    //  Part 5.4 — Assessment & Grading Engine Endpoints
    // ================================================================

    /**
     * Create a new assessment for a specific course.
     * Returns 201 Created with the persisted assessment details.
     */
    @PostMapping("/courses/{id}/assessments")
    public ResponseEntity<AssessmentResponse> createAssessment(
            @PathVariable Long id,
            @Valid @RequestBody CreateAssessmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        AssessmentResponse response = facultyService.createAssessment(id, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * List all assessments for a course.
     */
    @GetMapping("/courses/{id}/assessments")
    public ResponseEntity<List<AssessmentResponse>> getCourseAssessments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AssessmentResponse> response = facultyService.getCourseAssessments(id, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieve the mark sheet for a specific assessment.
     * Returns one entry per enrolled student; marksObtained is null if not yet graded.
     */
    @GetMapping("/courses/{id}/assessments/{aid}/marks")
    public ResponseEntity<List<AssessmentMarkResponse>> getAssessmentMarks(
            @PathVariable Long id,
            @PathVariable Long aid,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AssessmentMarkResponse> response = facultyService.getAssessmentMarks(id, aid, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Submit or update marks for a batch of students on a specific assessment.
     * Uses upsert logic — existing marks are updated, new entries are created.
     */
    @PutMapping("/courses/{id}/assessments/{aid}/marks")
    public ResponseEntity<MessageResponse> submitMarks(
            @PathVariable Long id,
            @PathVariable Long aid,
            @Valid @RequestBody MarkEntryRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MessageResponse response = facultyService.submitMarks(id, aid, request, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Publishes an assessment so enrolled students can view their evaluated marks.
     */
    @PostMapping("/courses/{id}/assessments/{aid}/publish")
    public ResponseEntity<AssessmentResponse> publishAssessment(
            @PathVariable Long id,
            @PathVariable Long aid,
            @RequestParam(required = false, defaultValue = "true") Boolean published,
            @AuthenticationPrincipal UserPrincipal principal) {
        AssessmentResponse response = facultyService.publishAssessment(id, aid, published, principal);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/courses/{id}/assessments/{aid}/publish")
    public ResponseEntity<AssessmentResponse> publishAssessmentPut(
            @PathVariable Long id,
            @PathVariable Long aid,
            @RequestParam(required = false, defaultValue = "true") Boolean published,
            @AuthenticationPrincipal UserPrincipal principal) {
        AssessmentResponse response = facultyService.publishAssessment(id, aid, published, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Calculate weighted grades for all enrolled students and publish to enrollments.
     * Returns a full CourseSummaryResponse with per-student grade breakdown.
     */
    @PostMapping("/courses/{id}/grades/calculate")
    public ResponseEntity<CourseSummaryResponse> calculateGrades(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        CourseSummaryResponse response = facultyService.calculateAndPublishGrades(id, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Get published grade summary for a course.
     */
    @GetMapping("/courses/{id}/grades/summary")
    public ResponseEntity<CourseSummaryResponse> getCourseGradeSummary(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        CourseSummaryResponse response = facultyService.getCourseGradeSummary(id, principal);
        return ResponseEntity.ok(response);
    }
}

