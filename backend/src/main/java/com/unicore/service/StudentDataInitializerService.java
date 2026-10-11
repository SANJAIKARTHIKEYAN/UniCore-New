package com.unicore.service;

import com.unicore.entity.*;
import com.unicore.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class StudentDataInitializerService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final DocumentRepository documentRepository;

    public StudentDataInitializerService(CourseRepository courseRepository,
                                         EnrollmentRepository enrollmentRepository,
                                         AttendanceRecordRepository attendanceRecordRepository,
                                         FeeRecordRepository feeRecordRepository,
                                         DocumentRepository documentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.feeRecordRepository = feeRecordRepository;
        this.documentRepository = documentRepository;
    }

    @Transactional
    public void initializeStudentData(User user, StudentProfile profile) {
        if (user == null || profile == null) {
            return;
        }

        Integer sem = profile.getCurrentSemester();
        String dept = user.getDepartment();

        // 1. Enroll in courses for current semester
        List<Course> semCourses = courseRepository.findByDepartmentAndSemester(dept, sem);
        for (Course c : semCourses) {
            if (!enrollmentRepository.existsByStudentIdAndCourseIdAndSemesterAndAcademicYear(
                    user.getId(), c.getId(), sem, profile.getAdmissionYear())) {
                Enrollment enrollment = new Enrollment(user, c, sem, profile.getAdmissionYear());
                enrollmentRepository.save(enrollment);

                // 2. Seed realistic attendance records (15 dates)
                long existingAttendance = attendanceRecordRepository.countByStudentIdAndCourseId(user.getId(), c.getId());
                if (existingAttendance == 0) {
                    List<AttendanceRecord> attendanceList = new ArrayList<>();
                    LocalDate startDate = LocalDate.now().minusWeeks(4);
                    for (int i = 0; i < 15; i++) {
                        LocalDate classDate = startDate.plusDays(i * 2L);
                        AttendanceStatus status = AttendanceStatus.PRESENT;
                        if (i % 7 == 0) {
                            status = AttendanceStatus.ABSENT;
                        } else if (i % 5 == 0) {
                            status = AttendanceStatus.LATE;
                        }
                        attendanceList.add(new AttendanceRecord(user, c, classDate, status));
                    }
                    attendanceRecordRepository.saveAll(attendanceList);
                }
            }
        }

        // 3. Fee records
        List<FeeRecord> existingFees = feeRecordRepository.findByStudentIdAndSemester(user.getId(), sem);
        if (existingFees.isEmpty()) {
            List<FeeRecord> fees = Arrays.asList(
                    new FeeRecord(user, sem, profile.getAdmissionYear(), "Tuition Fee", 35000.0, 35000.0,
                            LocalDate.now().plusMonths(2), FeeStatus.PAID),
                    new FeeRecord(user, sem, profile.getAdmissionYear(), "Laboratory & Computing Fee", 6000.0, 3000.0,
                            LocalDate.now().plusMonths(1), FeeStatus.PARTIALLY_PAID),
                    new FeeRecord(user, sem, profile.getAdmissionYear(), "Library & Resource Fee", 2500.0, 0.0,
                            LocalDate.now().plusDays(20), FeeStatus.UNPAID)
            );
            feeRecordRepository.saveAll(fees);
        }

        // 4. Documents
        List<Document> existingDocs = documentRepository.findByStudentId(user.getId());
        if (existingDocs.isEmpty()) {
            List<Document> docs = Arrays.asList(
                    new Document(user, "Identity Card", "Student Digital ID Card",
                            "Official digital identity card issued by College Administration.",
                            sem, LocalDate.now().minusMonths(3), DocumentStatus.AVAILABLE),
                    new Document(user, "Hall Ticket", "End-Semester Examination Hall Ticket",
                            "Provisional hall ticket for upcoming semester final exams.",
                            sem, LocalDate.now().minusDays(5), DocumentStatus.PENDING),
                    new Document(user, "Bonafide Certificate", "Bonafide Student Certificate",
                            "Official certificate certifying bona fide student status.",
                            sem, LocalDate.now().minusMonths(1), DocumentStatus.AVAILABLE)
            );
            documentRepository.saveAll(docs);
        }
    }
}
