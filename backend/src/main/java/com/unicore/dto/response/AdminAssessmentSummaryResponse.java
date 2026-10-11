package com.unicore.dto.response;

import java.util.List;
import java.util.Map;

public class AdminAssessmentSummaryResponse {

    private long totalAssessments;
    private long totalMarksRecorded;
    private Map<String, Long> typeCounts;
    private List<CourseAssessmentOverview> courseOverviews;

    public AdminAssessmentSummaryResponse() {
    }

    public AdminAssessmentSummaryResponse(long totalAssessments, long totalMarksRecorded,
                                          Map<String, Long> typeCounts,
                                          List<CourseAssessmentOverview> courseOverviews) {
        this.totalAssessments = totalAssessments;
        this.totalMarksRecorded = totalMarksRecorded;
        this.typeCounts = typeCounts;
        this.courseOverviews = courseOverviews;
    }

    public long getTotalAssessments() {
        return totalAssessments;
    }

    public void setTotalAssessments(long totalAssessments) {
        this.totalAssessments = totalAssessments;
    }

    public long getTotalMarksRecorded() {
        return totalMarksRecorded;
    }

    public void setTotalMarksRecorded(long totalMarksRecorded) {
        this.totalMarksRecorded = totalMarksRecorded;
    }

    public Map<String, Long> getTypeCounts() {
        return typeCounts;
    }

    public void setTypeCounts(Map<String, Long> typeCounts) {
        this.typeCounts = typeCounts;
    }

    public List<CourseAssessmentOverview> getCourseOverviews() {
        return courseOverviews;
    }

    public void setCourseOverviews(List<CourseAssessmentOverview> courseOverviews) {
        this.courseOverviews = courseOverviews;
    }

    public static class CourseAssessmentOverview {
        private Long courseId;
        private String courseCode;
        private String courseName;
        private int assessmentCount;
        private double totalWeightage;

        public CourseAssessmentOverview() {
        }

        public CourseAssessmentOverview(Long courseId, String courseCode, String courseName,
                                        int assessmentCount, double totalWeightage) {
            this.courseId = courseId;
            this.courseCode = courseCode;
            this.courseName = courseName;
            this.assessmentCount = assessmentCount;
            this.totalWeightage = totalWeightage;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public String getCourseCode() {
            return courseCode;
        }

        public void setCourseCode(String courseCode) {
            this.courseCode = courseCode;
        }

        public String getCourseName() {
            return courseName;
        }

        public void setCourseName(String courseName) {
            this.courseName = courseName;
        }

        public int getAssessmentCount() {
            return assessmentCount;
        }

        public void setAssessmentCount(int assessmentCount) {
            this.assessmentCount = assessmentCount;
        }

        public double getTotalWeightage() {
            return totalWeightage;
        }

        public void setTotalWeightage(double totalWeightage) {
            this.totalWeightage = totalWeightage;
        }
    }
}
