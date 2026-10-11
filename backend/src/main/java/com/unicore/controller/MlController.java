package com.unicore.controller;

import com.unicore.dto.response.RiskOverviewResponse;
import com.unicore.dto.response.StudentRiskPredictionResponse;
import com.unicore.entity.Role;
import com.unicore.entity.User;
import com.unicore.repository.CourseRepository;
import com.unicore.repository.EnrollmentRepository;
import com.unicore.repository.UserRepository;
import com.unicore.service.MlPredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ml")
public class MlController {

    private final MlPredictionService mlPredictionService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public MlController(MlPredictionService mlPredictionService,
                        UserRepository userRepository,
                        CourseRepository courseRepository,
                        EnrollmentRepository enrollmentRepository) {
        this.mlPredictionService = mlPredictionService;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    /**
     * 1. Get risk prediction for a single student.
     * Authorization:
     * - Student can view only their own risk.
     * - Faculty can view students enrolled in their courses.
     * - Admin can view any student.
     */
    @GetMapping("/students/{studentId}/risk")
    public ResponseEntity<StudentRiskPredictionResponse> getStudentRisk(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = resolveCurrentUser(userDetails);

        if (currentUser.getRole() == Role.STUDENT) {
            if (!currentUser.getId().equals(studentId)) {
                throw new AccessDeniedException("Students are only permitted to access their own risk prediction.");
            }
        } else if (currentUser.getRole() == Role.FACULTY) {
            boolean teachesStudent = courseRepository.findByInstructorId(currentUser.getId()).stream()
                    .anyMatch(course -> enrollmentRepository.findByCourseId(course.getId()).stream()
                            .anyMatch(e -> e.getStudent().getId().equals(studentId)));
            if (!teachesStudent) {
                throw new AccessDeniedException("Faculty member is not assigned to teach this student.");
            }
        }

        return ResponseEntity.ok(mlPredictionService.predictStudentRisk(studentId, courseId));
    }

    /**
     * Convenience endpoint for currently logged-in student.
     */
    @GetMapping("/my-risk")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentRiskPredictionResponse> getMyRisk(
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = resolveCurrentUser(userDetails);
        return ResponseEntity.ok(mlPredictionService.predictStudentRisk(currentUser.getId(), null));
    }

    /**
     * 2. Get risk predictions for all students in a course.
     * Authorization:
     * - Assigned faculty or Admin.
     */
    @GetMapping("/courses/{courseId}/risk")
    public ResponseEntity<List<StudentRiskPredictionResponse>> getCourseRisk(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = resolveCurrentUser(userDetails);
        Long facultyId = currentUser.getRole() == Role.FACULTY ? currentUser.getId() : null;

        return ResponseEntity.ok(mlPredictionService.getCourseRiskPredictions(courseId, facultyId));
    }

    /**
     * 3. Get risk overview for authorized faculty across their courses.
     */
    @GetMapping("/faculty/risk-overview")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<RiskOverviewResponse> getFacultyRiskOverview(
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = resolveCurrentUser(userDetails);
        return ResponseEntity.ok(mlPredictionService.getFacultyRiskOverview(currentUser.getId()));
    }

    /**
     * 4. Get system-wide risk overview for authorized administrators.
     */
    @GetMapping("/admin/risk-overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RiskOverviewResponse> getAdminRiskOverview() {
        return ResponseEntity.ok(mlPredictionService.getAdminRiskOverview());
    }

    private User resolveCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("User is not authenticated.");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found."));
    }
}
