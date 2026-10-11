package com.unicore.repository;

import com.unicore.entity.FacultyProfile;
import com.unicore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, Long> {
    Optional<FacultyProfile> findByFacultyId(String facultyId);
    Optional<FacultyProfile> findByUser(User user);
    Optional<FacultyProfile> findByUserId(Long userId);
    List<FacultyProfile> findByDepartment(String department);
    boolean existsByFacultyId(String facultyId);
}
