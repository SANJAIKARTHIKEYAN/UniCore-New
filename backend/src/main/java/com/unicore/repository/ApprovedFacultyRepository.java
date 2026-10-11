package com.unicore.repository;

import com.unicore.entity.ApprovedFaculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApprovedFacultyRepository extends JpaRepository<ApprovedFaculty, Long> {
    Optional<ApprovedFaculty> findByFacultyId(String facultyId);
    Optional<ApprovedFaculty> findByCollegeEmail(String collegeEmail);
    boolean existsByFacultyId(String facultyId);
}
