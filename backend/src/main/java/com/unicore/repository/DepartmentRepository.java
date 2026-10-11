package com.unicore.repository;

import com.unicore.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByShortCode(String shortCode);
    Optional<Department> findByShortCodeIgnoreCase(String shortCode);
    Optional<Department> findByName(String name);
    Optional<Department> findByNameIgnoreCase(String name);
    List<Department> findByActiveTrue();
    boolean existsByShortCode(String shortCode);
    boolean existsByShortCodeIgnoreCase(String shortCode);
    boolean existsByNameIgnoreCase(String name);
}
