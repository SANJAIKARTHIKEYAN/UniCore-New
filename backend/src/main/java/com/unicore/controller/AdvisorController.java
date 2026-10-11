package com.unicore.controller;

import com.unicore.dto.request.AdvisorQuestionRequest;
import com.unicore.dto.response.*;
import com.unicore.entity.Role;
import com.unicore.entity.User;
import com.unicore.repository.CourseRepository;
import com.unicore.repository.EnrollmentRepository;
import com.unicore.repository.UserRepository;
import com.unicore.service.AdvisorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/advisor")
public class AdvisorController {

    private final AdvisorService advisorService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public AdvisorController(AdvisorService advisorService,
                             UserRepository userRepository,
                             CourseRepository courseRepository,
                             EnrollmentRepository enrollmentRepository) {
        this.advisorService = advisorService;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    /**
     * 1. Student self-overview.
     */
    @GetMapping("/me/overview")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AdvisorOverviewDTO> getMyAdvisorOverview(
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = resolveCurrentUser(userDetails);
        return ResponseEntity.ok(advisorService.generateStudentOverview(currentUser.getId()));
    }

    /**
     * 2. Student recommendations list.
     */
    @GetMapping("/me/recommendations")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<AdvisorRecommendationDTO>> getMyRecommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = resolveCurrentUser(userDetails);
        AdvisorOverviewDTO overview = advisorService.generateStudentOverview(currentUser.getId());
        return ResponseEntity.ok(overview.getRecommendations());
    }

    /**
     * 3. Refresh and recalculate recommendations.
     */
    @PostMapping("/me/refresh")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AdvisorOverviewDTO> refreshMyRecommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = resolveCurrentUser(userDetails);
        return ResponseEntity.ok(advisorService.generateStudentOverview(currentUser.getId(), true));
    }

    /**
     * 4. Interactive Q&A for student queries.
     */
    @PostMapping("/me/ask")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AdvisorQuestionResponse> askAdvisor(
            @Valid @RequestBody AdvisorQuestionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = resolveCurrentUser(userDetails);
        return ResponseEntity.ok(advisorService.answerStudentQuestion(currentUser.getId(), request.getQuestion(), request.getConversationHistory()));
    }

    /**
     * 5. Faculty or Admin view of a student's advisor overview.
     */
    @GetMapping("/students/{studentId}/overview")
    public ResponseEntity<AdvisorOverviewDTO> getStudentAdvisorOverview(
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = resolveCurrentUser(userDetails);

        if (currentUser.getRole() == Role.STUDENT) {
            if (!currentUser.getId().equals(studentId)) {
                throw new AccessDeniedException("Students may only view their own advisor overview.");
            }
        } else if (currentUser.getRole() == Role.FACULTY) {
            boolean teachesStudent = courseRepository.findByInstructorId(currentUser.getId()).stream()
                    .anyMatch(c -> enrollmentRepository.findByCourseId(c.getId()).stream()
                            .anyMatch(e -> e.getStudent().getId().equals(studentId)));
            if (!teachesStudent) {
                throw new AccessDeniedException("Faculty member is not assigned to teach this student.");
            }
        }

        return ResponseEntity.ok(advisorService.generateStudentOverview(studentId));
    }

    /**
     * 6. Admin system-wide advisor analytics.
     */
    @GetMapping("/admin/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminAdvisorOverviewDTO> getAdminAdvisorOverview() {
        return ResponseEntity.ok(advisorService.generateAdminOverview());
    }

    private User resolveCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("User is not authenticated.");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new AccessDeniedException("User record not found."));
    }
}
