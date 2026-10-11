package com.unicore.repository;

import com.unicore.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByCourseId(Long courseId);
    Optional<Assessment> findByCourseIdAndId(Long courseId, Long id);
}
