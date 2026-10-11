package com.unicore.repository;

import com.unicore.entity.StudentRiskPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRiskPredictionRepository extends JpaRepository<StudentRiskPrediction, Long> {
    List<StudentRiskPrediction> findByStudentId(Long studentId);
    Optional<StudentRiskPrediction> findTopByStudentIdOrderByPredictedAtDesc(Long studentId);
    Optional<StudentRiskPrediction> findTopByStudentIdAndCourseIdOrderByPredictedAtDesc(Long studentId, Long courseId);
    List<StudentRiskPrediction> findByCourseId(Long courseId);
    long countByRiskCategory(String riskCategory);
}
