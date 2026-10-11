package com.unicore.service;

import com.unicore.entity.Course;
import com.unicore.entity.FacultyProfile;
import com.unicore.entity.User;
import com.unicore.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class FacultyDataInitializerService {

    private final CourseRepository courseRepository;

    public FacultyDataInitializerService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Transactional
    public void assignInitialCourses(User facultyUser, FacultyProfile profile) {
        if (facultyUser == null || profile == null) {
            return;
        }

        String facultyId = profile.getFacultyId();
        String dept = facultyUser.getDepartment();

        // 1. Map standard demo faculty IDs to specific course codes
        Map<String, List<String>> presetAssignments = new HashMap<>();
        presetAssignments.put("BCA-FAC-001", Arrays.asList("BCA101", "BCA102", "BCA201", "BCA202"));
        presetAssignments.put("BCA-FAC-002", Arrays.asList("BCA203", "BCA301", "BCA302", "BCA303"));
        presetAssignments.put("BSCS-FAC-001", Arrays.asList("BSCS101", "BSCS201", "BSCS202"));
        presetAssignments.put("BSCS-FAC-002", Arrays.asList("BSCS301", "BSCS401"));
        presetAssignments.put("BCOM-FAC-001", Arrays.asList("BCOM101", "BCOM201", "BCOM202"));
        presetAssignments.put("BCOM-FAC-002", Arrays.asList("BCOM301", "BCOM401"));
        presetAssignments.put("BBA-FAC-001", Arrays.asList("BBA101", "BBA201", "BBA202"));
        presetAssignments.put("BBA-FAC-002", Arrays.asList("BBA301", "BBA401"));
        presetAssignments.put("BSM-FAC-001", Arrays.asList("BSM101", "BSM201", "BSM202"));
        presetAssignments.put("BSM-FAC-002", Arrays.asList("BSM301", "BSM401"));

        if (presetAssignments.containsKey(facultyId)) {
            List<String> codes = presetAssignments.get(facultyId);
            for (String code : codes) {
                courseRepository.findByCourseCode(code).ifPresent(course -> {
                    course.setInstructor(facultyUser);
                    courseRepository.save(course);
                });
            }
        } else {
            // Fallback for custom registered faculty: pick up to 3 unassigned courses in their department
            List<Course> unassigned = courseRepository.findByDepartmentAndInstructorIsNull(dept);
            int count = 0;
            for (Course course : unassigned) {
                if (count >= 3) break;
                course.setInstructor(facultyUser);
                courseRepository.save(course);
                count++;
            }
        }
    }
}
