package com.unicore.repository;

import com.unicore.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.isActive = true " +
           "AND (n.targetDepartment IS NULL OR n.targetDepartment = :department) " +
           "AND (n.targetSemester IS NULL OR n.targetSemester = :semester) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findActiveByDepartmentAndSemester(@Param("department") String department, @Param("semester") Integer semester);

    @Query("SELECT n FROM Notification n WHERE " +
           "(n.targetDepartment IS NULL OR n.targetDepartment = :department) " +
           "AND (n.targetSemester IS NULL OR n.targetSemester = :semester) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findAllByDepartmentAndSemester(@Param("department") String department, @Param("semester") Integer semester);

    @Query("SELECT n FROM Notification n WHERE n.isActive = true " +
           "AND n.targetDepartment IS NULL AND n.targetSemester IS NULL " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findActiveGeneral();

    long countByIsActiveTrue();
}
