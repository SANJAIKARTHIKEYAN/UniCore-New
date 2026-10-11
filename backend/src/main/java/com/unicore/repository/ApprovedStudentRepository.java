package com.unicore.repository;

import com.unicore.entity.ApprovedStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApprovedStudentRepository extends JpaRepository<ApprovedStudent, Long> {
    Optional<ApprovedStudent> findByStudentId(String studentId);
    Optional<ApprovedStudent> findByCollegeEmail(String collegeEmail);
    boolean existsByStudentId(String studentId);
}
