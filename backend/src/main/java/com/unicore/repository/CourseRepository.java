package com.unicore.repository;

import com.unicore.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByDepartmentAndSemester(String department, Integer semester);
    List<Course> findByDepartment(String department);
    List<Course> findByInstructorId(Long instructorId);
    Optional<Course> findByIdAndInstructorId(Long id, Long instructorId);
    List<Course> findByDepartmentAndInstructorIsNull(String department);
    Optional<Course> findByCourseCode(String courseCode);
    boolean existsByCourseCode(String courseCode);
}
