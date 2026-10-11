package com.unicore.repository;

import com.unicore.entity.StudentProfile;
import com.unicore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByStudentId(String studentId);
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(Long userId);
    List<StudentProfile> findByUserDepartment(String department);
    boolean existsByStudentId(String studentId);
}
