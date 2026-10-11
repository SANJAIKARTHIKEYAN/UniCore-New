package com.unicore.service;

import com.unicore.dto.request.FacultyRegisterRequest;
import com.unicore.dto.request.LoginRequest;
import com.unicore.dto.request.StudentRegisterRequest;
import com.unicore.dto.response.AuthResponse;
import com.unicore.dto.response.FacultyProfileResponse;
import com.unicore.dto.response.StudentProfileResponse;
import com.unicore.dto.response.UserResponse;
import com.unicore.entity.*;
import com.unicore.exception.BadRequestException;
import com.unicore.exception.ResourceNotFoundException;
import com.unicore.exception.UnauthorizedException;
import com.unicore.repository.ApprovedFacultyRepository;
import com.unicore.repository.ApprovedStudentRepository;
import com.unicore.repository.DepartmentRepository;
import com.unicore.repository.FacultyProfileRepository;
import com.unicore.repository.StudentProfileRepository;
import com.unicore.repository.UserRepository;
import com.unicore.security.JwtTokenProvider;
import com.unicore.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ApprovedStudentRepository approvedStudentRepository;
    private final ApprovedFacultyRepository approvedFacultyRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final StudentDataInitializerService studentDataInitializerService;
    private final FacultyDataInitializerService facultyDataInitializerService;

    public AuthService(UserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       ApprovedStudentRepository approvedStudentRepository,
                       ApprovedFacultyRepository approvedFacultyRepository,
                       DepartmentRepository departmentRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       StudentDataInitializerService studentDataInitializerService,
                       FacultyDataInitializerService facultyDataInitializerService) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.approvedStudentRepository = approvedStudentRepository;
        this.approvedFacultyRepository = approvedFacultyRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.studentDataInitializerService = studentDataInitializerService;
        this.facultyDataInitializerService = facultyDataInitializerService;
    }

    @Transactional
    public AuthResponse registerStudent(StudentRegisterRequest request) {
        String cleanStudentId = request.getStudentId() != null ? request.getStudentId().trim() : "";
        String cleanEmail = request.getCollegeEmail() != null ? request.getCollegeEmail().trim() : "";

        // 1. Verify Student ID exists in approved records
        ApprovedStudent approvedStudent = approvedStudentRepository.findByStudentId(cleanStudentId)
                .orElseThrow(() -> new BadRequestException("Invalid Student ID: Record not found in university approved admission roster."));

        // 2. Check if active/approved
        if (!approvedStudent.isActive()) {
            throw new BadRequestException("Student account record is inactive or unapproved for registration.");
        }

        // 3. Check if already registered
        if (approvedStudent.isRegistered()) {
            throw new BadRequestException("Student account with ID '" + cleanStudentId + "' has already been registered.");
        }

        // 4. Verify college email matches approved record
        if (!approvedStudent.getCollegeEmail().equalsIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email mismatch: Provided email does not match official record for Student ID '" + cleanStudentId + "'.");
        }

        // 5. Ensure email is not already bound to a User
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("An active account is already registered with email: " + cleanEmail);
        }

        // 6. Verify student's department is valid and active in configurable departments
        Department dept = departmentRepository.findByShortCodeIgnoreCase(approvedStudent.getDepartment())
                .or(() -> departmentRepository.findByNameIgnoreCase(approvedStudent.getDepartment()))
                .orElse(null);
        if (dept != null && !dept.isActive()) {
            throw new BadRequestException("Department '" + approvedStudent.getDepartment() + "' is currently inactive. Registration suspended.");
        }

        // 7. Create user with automatically populated values
        User user = new User();
        user.setName(approvedStudent.getName());
        user.setEmail(approvedStudent.getCollegeEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT); // Automatic role assignment
        user.setDepartment(approvedStudent.getDepartment()); // Automatic department assignment
        user.setStatus(UserStatus.ACTIVE);

        // 8. Create Student Profile with semester and admission year
        StudentProfile studentProfile = new StudentProfile();
        studentProfile.setUser(user);
        studentProfile.setStudentId(approvedStudent.getStudentId());
        studentProfile.setAdmissionYear(approvedStudent.getAdmissionYear()); // Automatic year assignment
        studentProfile.setCurrentSemester(approvedStudent.getCurrentSemester()); // Automatic semester
        user.setStudentProfile(studentProfile);

        User savedUser = userRepository.save(user);

        // 9. Mark approved record as registered
        approvedStudent.setRegistered(true);
        approvedStudentRepository.save(approvedStudent);

        // 10. Initialize course enrollments, attendance, fees, and documents
        studentDataInitializerService.initializeStudentData(savedUser, savedUser.getStudentProfile());

        // 11. Generate JWT token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, request.getPassword())
        );
        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token, mapToUserResponse(savedUser));
    }

    @Transactional
    public AuthResponse registerFaculty(FacultyRegisterRequest request) {
        String cleanFacultyId = request.getFacultyId() != null ? request.getFacultyId().trim() : "";
        String cleanEmail = request.getCollegeEmail() != null ? request.getCollegeEmail().trim() : "";

        // 1. Verify Faculty ID exists in approved records
        ApprovedFaculty approvedFaculty = approvedFacultyRepository.findByFacultyId(cleanFacultyId)
                .orElseThrow(() -> new BadRequestException("Invalid Faculty ID: Record not found in university approved faculty roster."));

        // 2. Check if active/approved
        if (!approvedFaculty.isActive()) {
            throw new BadRequestException("Faculty account record is inactive or unapproved for registration.");
        }

        // 3. Check if already registered
        if (approvedFaculty.isRegistered()) {
            throw new BadRequestException("Faculty account with ID '" + cleanFacultyId + "' has already been registered.");
        }

        // 4. Verify college email matches approved record
        if (!approvedFaculty.getCollegeEmail().equalsIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email mismatch: Provided email does not match official record for Faculty ID '" + cleanFacultyId + "'.");
        }

        // 5. Ensure email is not already bound to a User
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("An active account is already registered with email: " + cleanEmail);
        }

        // 6. Verify faculty's department is valid and active in configurable departments
        Department dept = departmentRepository.findByShortCodeIgnoreCase(approvedFaculty.getDepartment())
                .or(() -> departmentRepository.findByNameIgnoreCase(approvedFaculty.getDepartment()))
                .orElse(null);
        if (dept != null && !dept.isActive()) {
            throw new BadRequestException("Department '" + approvedFaculty.getDepartment() + "' is currently inactive. Registration suspended.");
        }

        // 7. Create user with automatically populated values
        User user = new User();
        user.setName(approvedFaculty.getName());
        user.setEmail(approvedFaculty.getCollegeEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.FACULTY); // Automatic role assignment
        user.setDepartment(approvedFaculty.getDepartment()); // Automatic department assignment
        user.setStatus(UserStatus.ACTIVE);

        // 8. Create Faculty Profile
        FacultyProfile facultyProfile = new FacultyProfile();
        facultyProfile.setUser(user);
        facultyProfile.setFacultyId(approvedFaculty.getFacultyId());
        facultyProfile.setDepartment(approvedFaculty.getDepartment());
        user.setFacultyProfile(facultyProfile);

        User savedUser = userRepository.save(user);

        // 9. Assign initial teaching courses to registered faculty
        facultyDataInitializerService.assignInitialCourses(savedUser, facultyProfile);

        // 10. Mark approved record as registered
        approvedFaculty.setRegistered(true);
        approvedFacultyRepository.save(approvedFaculty);

        // 11. Generate JWT token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, request.getPassword())
        );
        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token, mapToUserResponse(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String inputEmail = request.getEmail() != null ? request.getEmail().trim() : "";
        String lowerEmail = inputEmail.toLowerCase();
        User user = userRepository.findByEmail(lowerEmail)
                .or(() -> userRepository.findByEmail(inputEmail))
                .orElseThrow(() -> new UnauthorizedException("Incorrect login credentials: User does not exist."));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Account is currently inactive. Please contact administration.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(inputEmail, request.getPassword())
            );
            String token = tokenProvider.generateToken(authentication);
            return new AuthResponse(token, mapToUserResponse(user));
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Incorrect login credentials: Email or password mismatch.");
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));
        return mapToUserResponse(user);
    }

    public UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getStatus()
        );

        if (user.getStudentProfile() != null) {
            StudentProfile sp = user.getStudentProfile();
            response.setStudentProfile(new StudentProfileResponse(
                    sp.getStudentId(),
                    sp.getAdmissionYear(),
                    sp.getCurrentSemester(),
                    sp.getDerivedYear()
            ));
        }

        if (user.getFacultyProfile() != null) {
            FacultyProfile fp = user.getFacultyProfile();
            response.setFacultyProfile(new FacultyProfileResponse(
                    fp.getFacultyId(),
                    fp.getDepartment()
            ));
        }

        return response;
    }
}
