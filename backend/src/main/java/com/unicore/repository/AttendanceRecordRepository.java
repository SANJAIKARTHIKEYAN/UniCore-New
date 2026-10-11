package com.unicore.repository;

import com.unicore.entity.AttendanceRecord;
import com.unicore.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<AttendanceRecord> findByStudentId(Long studentId);
    long countByStudentIdAndCourseIdAndStatus(Long studentId, Long courseId, AttendanceStatus status);
    long countByStudentIdAndCourseId(Long studentId, Long courseId);
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);
    long countByStudentId(Long studentId);
    List<AttendanceRecord> findByCourseIdAndDate(Long courseId, LocalDate date);
    Optional<AttendanceRecord> findByStudentIdAndCourseIdAndDate(Long studentId, Long courseId, LocalDate date);
}
