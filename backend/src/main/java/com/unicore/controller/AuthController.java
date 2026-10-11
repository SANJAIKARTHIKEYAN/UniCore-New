package com.unicore.controller;

import com.unicore.dto.request.FacultyRegisterRequest;
import com.unicore.dto.request.LoginRequest;
import com.unicore.dto.request.StudentRegisterRequest;
import com.unicore.dto.response.AuthResponse;
import com.unicore.dto.response.UserResponse;
import com.unicore.security.UserPrincipal;
import com.unicore.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/student")
    public ResponseEntity<AuthResponse> registerStudent(@Valid @RequestBody StudentRegisterRequest request) {
        AuthResponse response = authService.registerStudent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/register/faculty")
    public ResponseEntity<AuthResponse> registerFaculty(@Valid @RequestBody FacultyRegisterRequest request) {
        AuthResponse response = authService.registerFaculty(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponse response = authService.getCurrentUser(principal);
        return ResponseEntity.ok(response);
    }
}
