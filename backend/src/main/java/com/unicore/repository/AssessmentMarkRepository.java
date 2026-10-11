package com.unicore.repository;

import com.unicore.entity.AssessmentMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentMarkRepository extends JpaRepository<AssessmentMark, Long> {
    List<AssessmentMark> findByAssessmentId(Long assessmentId);
    Optional<AssessmentMark> findByAssessmentIdAndStudentId(Long assessmentId, Long studentId);
    List<AssessmentMark> findByAssessment_CourseIdAndStudentId(Long courseId, Long studentId);
}
