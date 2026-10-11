package com.unicore.controller;

import com.unicore.dto.response.*;
import com.unicore.security.UserPrincipal;
import com.unicore.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/me/profile")
    public ResponseEntity<StudentProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        StudentProfileResponse response = studentService.getMyProfile(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<StudentProfileResponse> getStudentProfileById(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        StudentProfileResponse response = studentService.getStudentProfileByUserId(userId, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        DashboardResponse response = studentService.getDashboard(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/attendance")
    public ResponseEntity<List<AttendanceSummaryResponse>> getAttendance(@AuthenticationPrincipal UserPrincipal principal) {
        List<AttendanceSummaryResponse> response = studentService.getAttendance(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/academic-performance")
    public ResponseEntity<AcademicPerformanceResponse> getAcademicPerformance(@AuthenticationPrincipal UserPrincipal principal) {
        AcademicPerformanceResponse response = studentService.getAcademicPerformance(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/courses/{courseId}/assessments")
    public ResponseEntity<List<StudentAssessmentMarkDTO>> getCourseAssessments(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<StudentAssessmentMarkDTO> response = studentService.getCourseAssessments(courseId, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/results")
    public ResponseEntity<?> getResults(
            @RequestParam(required = false) Integer semester,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (semester != null) {
            SemesterResultResponse response = studentService.getSemesterResult(principal, semester);
            return ResponseEntity.ok(response);
        }
        List<SemesterResultResponse> response = studentService.getAllSemesterResults(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/risk-status")
    public ResponseEntity<RiskStatusResponse> getRiskStatus(@AuthenticationPrincipal UserPrincipal principal) {
        RiskStatusResponse response = studentService.getRiskStatus(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/fees")
    public ResponseEntity<List<FeeRecordResponse>> getFees(@AuthenticationPrincipal UserPrincipal principal) {
        List<FeeRecordResponse> response = studentService.getFees(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/documents")
    public ResponseEntity<List<DocumentResponse>> getDocuments(@AuthenticationPrincipal UserPrincipal principal) {
        List<DocumentResponse> response = studentService.getDocuments(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        List<NotificationResponse> response = studentService.getNotifications(principal);
        return ResponseEntity.ok(response);
    }
}
