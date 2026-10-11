package com.unicore.repository;

import com.unicore.entity.FeeRecord;
import com.unicore.entity.FeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeRecordRepository extends JpaRepository<FeeRecord, Long> {
    List<FeeRecord> findByStudentId(Long studentId);
    List<FeeRecord> findByStudentIdAndSemester(Long studentId, Integer semester);
    long countByStudentIdAndStatusNot(Long studentId, FeeStatus status);
}
