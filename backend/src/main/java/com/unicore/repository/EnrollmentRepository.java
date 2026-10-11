package com.unicore.repository;

import com.unicore.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findByStudentIdAndSemester(Long studentId, Integer semester);
    List<Enrollment> findByCourseId(Long courseId);
    long countByCourseId(Long courseId);
    java.util.Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    boolean existsByStudentIdAndCourseIdAndSemesterAndAcademicYear(Long studentId, Long courseId, Integer semester, Integer academicYear);
}
