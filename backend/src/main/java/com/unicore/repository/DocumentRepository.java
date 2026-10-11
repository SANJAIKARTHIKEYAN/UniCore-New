package com.unicore.repository;

import com.unicore.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByStudentId(Long studentId);
    List<Document> findByStudentIdAndSemester(Long studentId, Integer semester);
}
