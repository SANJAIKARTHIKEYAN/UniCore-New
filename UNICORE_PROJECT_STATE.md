# UniCore Project State & Inventory

This document maintains the official, up-to-date state tracking of the UniCore platform, artifact registries, constraints, and development milestones.

---

## 📅 Current Status Summary

- **Last Updated**: 2026-10-11
- **Current Milestone**: All Parts (1 to 9) & Futuristic Sci-Fi Cyber HUD Complete & Fully Integrated
- **Active Workspace**: `UniCore/`
- **Quality Status**: 91 Backend Integration Tests Passing, 54 Frontend Unit Tests Passing, Production Builds Verified

---

## 🔒 Immutable ML Artifact Registry

The machine learning implementation has been fully completed, verified, and locked. The files listed below are strictly read-only and **must not** be modified, retrained, renamed, or deleted.

| File Path | Type | Approximate Size | Role & Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| [`ML/models/random_forest_model.pkl`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/models/random_forest_model.pkl) | Binary Model | ~13.2 MB | Standard 7-feature Random Forest Classifier for end-of-term / holistic risk prediction | 🔒 **LOCKED / READ-ONLY** |
| [`ML/models/early_random_forest_model.pkl`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/models/early_random_forest_model.pkl) | Binary Model | ~22.8 MB | Early-warning 6-feature Random Forest Classifier (pre-final exam scoring) | 🔒 **LOCKED / READ-ONLY** |
| [`ML/data/train.csv`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/data/train.csv) | Dataset | ~1.02 MB | Primary baseline training dataset | 🔒 **LOCKED / READ-ONLY** |
| [`ML/data/test.csv`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/data/test.csv) | Dataset | ~262 KB | Model validation dataset | 🔒 **LOCKED / READ-ONLY** |
| [`ML/data/student_data.csv`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/data/student_data.csv) | Dataset | ~1.28 MB | Consolidated raw student academic records | 🔒 **LOCKED / READ-ONLY** |
| [`ML/data/unicore_student_risk.csv`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/data/unicore_student_risk.csv) | Dataset | ~1.27 MB | Processed dataset with engineered risk scores and categorizations | 🔒 **LOCKED / READ-ONLY** |
| [`ML/create_dataset.py`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/create_dataset.py) | Python Script | 950 B | Feature engineering logic for UniCore Risk Score and levels | 🔒 **LOCKED / READ-ONLY** |
| [`ML/train_model.py`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/train_model.py) | Python Script | 3.55 KB | Training script for standard & early random forest models | 🔒 **LOCKED / READ-ONLY** |
| [`ML/predict.py`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/predict.py) | Python Script | 1.39 KB | Interactive CLI inference harness | 🔒 **LOCKED / READ-ONLY** |
| [`ML/check_dataset.py`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/check_dataset.py) | Python Script | 355 B | Dataset verification and health check script | 🔒 **LOCKED / READ-ONLY** |
| [`ML/notebooks/`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/notebooks) | Directory | 0 B | Reserved for exploratory analysis | 🔒 **PRESERVED** |

---

## 🛠️ Step 4 Implementation Record: Student Module (Read-Only Student Portal)

### 1. Verification of Step 4 Requirements
| # | Requirement | Status | Verification Detail |
| :--- | :--- | :--- | :--- |
| 1 | Course catalog entity and seeding (~35 courses across 5 departments, all semesters) | ✅ Complete | `Course` entity with `courseCode`, `courseName`, `department`, `semester`, `credits`. Seeded via `DataSeederService.seedCourses()`. All courses clearly labelled `[DEMO]`. |
| 2 | Enrollment entity linking students to courses per semester | ✅ Complete | `Enrollment` entity with composite unique constraint `(studentId, courseId, semester, academicYear)`. Grades start as `null` (Not Yet Graded). |
| 3 | Day-level attendance records per student per course | ✅ Complete | `AttendanceRecord` entity with `PRESENT/ABSENT/LATE` enum. 15 demo records per enrollment with realistic mix. |
| 4 | Semester-wise fee tracking | ✅ Complete | `FeeRecord` entity with `PAID/PARTIALLY_PAID/UNPAID/OVERDUE` status. 3 fee types per student. |
| 5 | Student-accessible document metadata | ✅ Complete | `Document` entity with `AVAILABLE/PENDING/EXPIRED` status. ID Card, Hall Ticket, Bonafide Certificate. |
| 6 | System/department-scoped notifications | ✅ Complete | `Notification` entity with `GENERAL/ACADEMIC/FEE/EXAM/DEPARTMENT` types. Department and semester targeting. |
| 7 | Student Dashboard API with aggregated metrics | ✅ Complete | `/api/student/me/dashboard` returns name, studentId, department, semester, courses count, overall attendance %, GPA (nullable), pending fees, notifications, risk placeholder. |
| 8 | Per-course attendance summary API | ✅ Complete | `/api/student/me/attendance` returns per-course totals (present, absent, late, percentage). |
| 9 | Academic performance API (current semester) | ✅ Complete | `/api/student/me/academic-performance` returns courses with grade status (null = "Not Yet Graded"). |
| 10 | Semester results API (single + all semesters) | ✅ Complete | `/api/student/me/results` and `/api/student/me/results?semester=N`. Includes SGPA computation when grades exist. |
| 11 | Risk status placeholder API | ✅ Complete | `/api/student/me/risk-status` returns data structure with `riskLevel=null`, `assessmentDataAvailable=false`, and descriptive message about future ML integration. |
| 12 | Fees API | ✅ Complete | `/api/student/me/fees` returns semester-wise fee records with amounts, due dates, and payment status. |
| 13 | Documents API | ✅ Complete | `/api/student/me/documents` returns document metadata list. |
| 14 | Notifications API | ✅ Complete | `/api/student/me/notifications` returns active notifications scoped to student's department and semester. |
| 15 | No registration bypass — roster-only auth | ✅ Complete | Data seeding only populates enrollments/attendance/fees/docs for students who have actually registered through the Auth flow. |
| 16 | No fabricated grades | ✅ Complete | All `grade` and `gradePoints` fields remain `null` until a valid grade is awarded (future Faculty Module). |
| 17 | Frontend Student Portal with sidebar navigation and 9 pages | ✅ Complete | `StudentLayout`, `StudentSidebar`, and 9 pages: Dashboard, Profile, Attendance, Academic Performance, Results, Risk Status, Fees, Documents, Notifications. |
| 18 | Frontend API service wired to all 8 new endpoints | ✅ Complete | `api.js` updated with all student endpoint methods. |
| 19 | Student-specific routing in App.jsx | ✅ Complete | `STUDENT` role routes to `StudentLayout`; other roles render `DashboardPreview`. |
| 20 | ML folder & trained models untouched | ✅ Complete | Zero mutations inside `ML/`. |
| 21 | Integration tests (tests 22–32) | ✅ Complete | 11 new integration tests verifying all student endpoints, RBAC enforcement, and edge cases. |

### 2. Step 4 Database Tables (Added)
```text
Table: courses
  ├── id (BIGINT, PK, AUTO_INCREMENT)
  ├── course_code (VARCHAR(20), UNIQUE)
  ├── course_name (VARCHAR(255))
  ├── department (VARCHAR(255))
  ├── semester (INT)
  ├── credits (INT, DEFAULT 3)
  └── INDEX idx_course_dept_sem (department, semester)

Table: enrollments
  ├── id (BIGINT, PK, AUTO_INCREMENT)
  ├── student_id (BIGINT, FK → users.id)
  ├── course_id (BIGINT, FK → courses.id)
  ├── semester (INT)
  ├── academic_year (INT)
  ├── grade (VARCHAR(5), NULLABLE)
  ├── grade_points (DOUBLE, NULLABLE)
  └── UNIQUE KEY uk_enrollment (student_id, course_id, semester, academic_year)

Table: attendance_records
  ├── id (BIGINT, PK, AUTO_INCREMENT)
  ├── student_id (BIGINT, FK → users.id)
  ├── course_id (BIGINT, FK → courses.id)
  ├── date (DATE)
  ├── status (ENUM: 'PRESENT', 'ABSENT', 'LATE')
  └── INDEX idx_attendance_student_course (student_id, course_id)

Table: fee_records
  ├── id (BIGINT, PK, AUTO_INCREMENT)
  ├── student_id (BIGINT, FK → users.id)
  ├── semester (INT)
  ├── academic_year (INT)
  ├── fee_type (VARCHAR(100))
  ├── amount (DOUBLE)
  ├── paid_amount (DOUBLE, DEFAULT 0)
  ├── due_date (DATE)
  └── status (ENUM: 'PAID', 'PARTIALLY_PAID', 'UNPAID', 'OVERDUE')

Table: documents
  ├── id (BIGINT, PK, AUTO_INCREMENT)
  ├── student_id (BIGINT, FK → users.id)
  ├── document_type (VARCHAR(100))
  ├── title (VARCHAR(255))
  ├── description (TEXT, NULLABLE)
  ├── semester (INT, NULLABLE)
  ├── issued_date (DATE)
  └── status (ENUM: 'AVAILABLE', 'PENDING', 'EXPIRED')

Table: notifications
  ├── id (BIGINT, PK, AUTO_INCREMENT)
  ├── title (VARCHAR(255))
  ├── message (TEXT)
  ├── type (ENUM: 'GENERAL', 'ACADEMIC', 'FEE', 'EXAM', 'DEPARTMENT')
  ├── target_department (VARCHAR(255), NULLABLE)
  ├── target_semester (INT, NULLABLE)
  ├── is_active (BOOLEAN, DEFAULT TRUE)
  ├── created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
  └── expires_at (TIMESTAMP, NULLABLE)
```

### 3. Step 4 New Files Inventory

| Layer | Files |
| :--- | :--- |
| Enums | `AttendanceStatus.java`, `FeeStatus.java`, `DocumentStatus.java`, `NotificationType.java` |
| Entities | `Course.java`, `Enrollment.java`, `AttendanceRecord.java`, `FeeRecord.java`, `Document.java`, `Notification.java` |
| Repositories | `CourseRepository.java`, `EnrollmentRepository.java`, `AttendanceRecordRepository.java`, `FeeRecordRepository.java`, `DocumentRepository.java`, `NotificationRepository.java` |
| DTOs | `DashboardResponse.java`, `AttendanceSummaryResponse.java`, `AcademicPerformanceResponse.java`, `CourseAcademicDetail.java`, `SemesterResultResponse.java`, `RiskStatusResponse.java`, `FeeRecordResponse.java`, `DocumentResponse.java`, `NotificationResponse.java` |
| Services | `StudentDataInitializerService.java` (new), `StudentService.java` (extended +8 methods), `DataSeederService.java` (extended +6 seed methods) |
| Controllers | `StudentController.java` (extended +8 endpoints) |
| Frontend | `StudentLayout.jsx`, `StudentSidebar.jsx`, `StudentDashboard.jsx`, `StudentProfile.jsx`, `StudentAttendance.jsx`, `StudentAcademicPerformance.jsx`, `StudentResults.jsx`, `StudentRiskStatus.jsx`, `StudentFees.jsx`, `StudentDocuments.jsx`, `StudentNotifications.jsx` |
| Modified | `App.jsx`, `api.js`, `index.css`, `schema.sql` |

### 4. Step 4 Automated Test Suite Record
Tests 22–32 added to [`UniCoreApplicationTests.java`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/backend/src/test/java/com/unicore/UniCoreApplicationTests.java). Combined suite: **32 tests total**.

22. `test22_CourseSeeding_VerifiesCoursesExist`: Confirms ≥20 courses seeded across departments.
23. `test23_StudentDashboard_ReturnsValidStructure`: Confirms dashboard returns aggregated data for registered student.
24. `test24_StudentAttendance_ReturnsPerCourseSummary`: Confirms per-course attendance summaries with counts and percentages.
25. `test25_StudentAcademicPerformance_CurrentSemester`: Confirms current semester courses with `grade=null`.
26. `test26_StudentResults_AllSemesters`: Confirms all-semesters and single-semester query responses.
27. `test27_StudentRiskStatus_PlaceholderStructure`: Confirms placeholder with `riskLevel=null` and descriptive message.
28. `test28_StudentFees_ReturnsFeeRecords`: Confirms fee records with type, amount, status.
29. `test29_StudentDocuments_ReturnsDocumentList`: Confirms document metadata list.
30. `test30_StudentNotifications_ReturnsActiveNotifications`: Confirms active notifications scoped to department.
31. `test31_NonStudentRole_CannotAccessStudentEndpoints`: Confirms FACULTY receives 403 on student endpoints.
32. `test32_UnauthenticatedAccess_Returns401`: Confirms no-token requests receive 401.

### 5. Build Verification
- **Backend**: `mvnw.cmd compile` → **BUILD SUCCESS** (exit code 0)
- **Frontend**: `npm run build` → **built in 1.19s** (42 modules, exit code 0)

### 6. Remaining Issues
- None. Step 4 is fully implemented, compiled, and tested.

---

## 🛠️ Step 3 Implementation Record: Department Setup & Approved Account System

### 1. Verification of Step 3 Requirements
| # | Requirement | Status | Verification Detail |
| :--- | :--- | :--- | :--- |
| 1 | Five configurable departments (BCA, B.Sc Computer Science, B.Com, BBA, B.Sc Mathematics) | ✅ Complete | Persisted in `departments` table (`BCA`, `BSCS`, `BCOM`, `BBA`, `BSM`). Admin endpoints enabled for creation, update, and active toggling. |
| 2 | Approved student records containing ID, Name, College Email, Department, Admission Year, Current Semester, Active status | ✅ Complete | Documented in `ApprovedStudent` JPA entity and schema table `approved_students`. |
| 3 | At least 5 demo students per department (25 total) | ✅ Complete | Seeded via `DataSeederService` and verified by automated tests. |
| 4 | Approved faculty records containing Faculty ID, Name, College Email, Department, Active status | ✅ Complete | Documented in `ApprovedFaculty` JPA entity and schema table `approved_faculties`. |
| 5 | At least 2 demo faculty per department (10 total) | ✅ Complete | Seeded via `DataSeederService` and verified by automated tests. |
| 6 | Student self-registration (Student ID, College Email, Password) with backend record verification | ✅ Complete | Verified against pre-approved roster. Role, Department, Admission Year, Semester automatically assigned by backend. |
| 7 | Faculty self-registration (Faculty ID, College Email, Password) with backend record verification | ✅ Complete | Verified against pre-approved roster. Role and Department automatically assigned by backend. |
| 8 | Semester → Year derivation (1-2: 1st Year, 3-4: 2nd Year, 5-6: 3rd Year) | ✅ Complete | Transient business computation in `StudentProfile.getDerivedYear()`. |
| 9 | Passwords securely hashed | ✅ Complete | `BCryptPasswordEncoder` enforced. Raw passwords never stored or returned. |
| 10 | Existing authentication & authorization working | ✅ Complete | Stateless JWT bearer tokens with RBAC (`ADMIN`, `FACULTY`, `STUDENT`). |
| 11 | Backend prevents overriding role or department | ✅ Complete | Registration DTOs ignore tampered client fields; assigned exclusively from DB. |
| 12 | ML folder & trained models untouched | ✅ Complete | Zero mutations inside `ML/`. |
| 13 | Tests for Step 3 functionality | ✅ Complete | 21/21 automated integration tests passing in `UniCoreApplicationTests.java`. |

### 2. Step 3 Automated Test Suite Record
Tests 1–21 in [`UniCoreApplicationTests.java`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/backend/src/test/java/com/unicore/UniCoreApplicationTests.java): **21/21 passing (0 failures, 0 errors, 0 skipped)**.

---

## 🛠️ Step 5.1 Implementation Record: Faculty Course Assignment & Roster Backend

### 1. Verification of Step 5.1 Requirements
| # | Requirement | Status | Verification Detail |
| :--- | :--- | :--- | :--- |
| 1 | Link `Course` to Faculty (`instructor_id`) | ✅ Complete | Updated `Course.java` with `@ManyToOne User instructor`, matching `ARCHITECTURE.md` line 92. |
| 2 | Database schema update | ✅ Complete | Updated `database/schema.sql` `courses` table with `instructor_id BIGINT NULL`, index, and FK constraint. |
| 3 | Repository queries | ✅ Complete | Added `findByInstructorId`, `findByIdAndInstructorId`, and `findByDepartmentAndInstructorIsNull` to `CourseRepository`. Added `findByCourseId` and `countByCourseId` to `EnrollmentRepository`. |
| 4 | Faculty Course & Roster DTOs | ✅ Complete | Added `FacultyCourseResponse.java`, `EnrolledStudentResponse.java`, and `FacultyCourseRosterResponse.java`. |
| 5 | Course assignment service | ✅ Complete | Created `FacultyDataInitializerService.java` for deterministic course assignment upon faculty registration. |
| 6 | Faculty Courses API | ✅ Complete | `GET /api/faculty/me/courses` returns assigned courses with enrollment counts. |
| 7 | Faculty Course Roster API | ✅ Complete | `GET /api/faculty/courses/{id}/students` returns enrolled student roster with attendance percentages. |
| 8 | Ownership & RBAC authorization | ✅ Complete | Enforces that faculty can only query their own assigned courses (403 Forbidden on cross-faculty access). |
| 9 | Automated tests (Tests 33–35) | ✅ Complete | 3 new integration tests in `UniCoreApplicationTests.java`. Combined suite: **35/35 passing (0 failures, 0 errors, 0 skipped)**. |
| 10 | Zero ML mutations & Zero frontend changes | ✅ Complete | `ML/` and `frontend/` untouched. |

---

## 🛠️ Step 5.2 Implementation Record: Faculty Portal Shell & Dashboard UI

### 1. Verification of Step 5.2 Requirements
| # | Requirement | Status | Verification Detail |
| :--- | :--- | :--- | :--- |
| 1 | Client API Service methods | ✅ Complete | Added `getMyAssignedCourses()` and `getCourseRoster(courseId)` to `api.js`. |
| 2 | Role-based routing in `App.jsx` | ✅ Complete | Updated `App.jsx` to route `FACULTY` role to `FacultyLayout`, `STUDENT` to `StudentLayout`, others to `DashboardPreview`. |
| 3 | Faculty Portal Shell (`FacultyLayout.jsx`) | ✅ Complete | Stateful container managing active tab (`dashboard`, `courses`, `roster`, `profile`) and selected course ID. |
| 4 | Faculty Sidebar (`FacultySidebar.jsx`) | ✅ Complete | Purple-accented navigation with user card, avatar badge, faculty ID, and department badge. |
| 5 | Faculty Dashboard (`FacultyDashboard.jsx`) | ✅ Complete | Displays 4 metric cards (Assigned Courses, Enrolled Students, Department, Evaluation status) and assigned courses table. |
| 6 | Assigned Courses view (`FacultyCourses.jsx`) | ✅ Complete | Responsive cards grid with course details, credits, semester, enrolled student badges, and "View Enrolled Roster" action. |
| 7 | Enrolled Student Roster view (`FacultyCourseRoster.jsx`) | ✅ Complete | Course selector dropdown, course summary header, and enrolled students table with attendance rates and grading status. |
| 8 | Faculty Profile view (`FacultyProfile.jsx`) | ✅ Complete | Displays verified faculty credentials, ID, department, and academic isolation policy notice. |
| 9 | Loading, empty, and error handling | ✅ Complete | All views implement loading states, empty placeholders, and defensive error alerts with retry buttons. |
| 10 | Aesthetics & Design tokens | ✅ Complete | Styled in `index.css` using `--accent-faculty`, glassmorphism cards, and responsive `@media (max-width: 900px)`. |
| 11 | Automated frontend tests | ✅ Complete | 5 component tests passing via Vitest in `FacultyPortal.test.jsx`. |
| 12 | Production bundle build | ✅ Complete | `npm run build` succeeds in 1.24s (48 modules transformed). |
| 13 | Backend & ML Safeguards | ✅ Complete | Backend 35/35 tests passing; zero mutations inside `ML/`. |

---

## 🛠️ Step 5.3 Implementation Record: Faculty Attendance Marking

### 1. Verification of Step 5.3 Requirements
| # | Requirement | Status | Verification Detail |
| :--- | :--- | :--- | :--- |
| 1 | Attendance retrieval endpoint | ✅ Complete | `GET /api/faculty/courses/{id}/attendance?date=YYYY-MM-DD` returns enrolled students with current status (or null if unmarked). |
| 2 | Attendance submission & update endpoint | ✅ Complete | `PUT /api/faculty/courses/{id}/attendance` upserts attendance records for enrolled students on the specified date. |
| 3 | Faculty ownership & authentication | ✅ Complete | Strict check: faculty can only view and mark attendance for assigned courses; cross-faculty requests return `403 Forbidden`. |
| 4 | Enrollment validation & duplicate prevention | ✅ Complete | Validates student enrollment (`400 Bad Request` if unenrolled); database unique constraint `(student_id, course_id, date)` ensures upsert with zero duplicates. |
| 5 | Interactive Frontend Attendance Page | ✅ Complete | `FacultyAttendance.jsx` created with course dropdown, date picker, status chips, quick actions ("All Present", "All Absent"), and segmented toggles. |
| 6 | Navigation & Layout Integration | ✅ Complete | Integrated into `FacultySidebar.jsx` and `FacultyLayout.jsx` with active tab routing; quick links added from `FacultyCourses.jsx` and `FacultyDashboard.jsx`. |
| 7 | Aesthetics & Micro-interactions | ✅ Complete | Styled with glassmorphism, `--accent-faculty`, emerald for Present, crimson for Absent, amber for Late, responsive layout (`index.css`). |
| 8 | Automated Backend Tests (Tests 36–38) | ✅ Complete | Tests 36 (Submit & Retrieve), 37 (Cross-Faculty & 401 Rejection), 38 (Upsert & Validation). Suite: **38/38 passing (0 failures, 0 errors)**. |
| 9 | Automated Frontend Tests | ✅ Complete | 8/8 Vitest tests passing in `FacultyPortal.test.jsx`. |
| 10 | Production Build Verification | ✅ Complete | `npm run build` succeeds (49 modules transformed, exit code 0). |
| 11 | Absolute ML Safeguards | ✅ Complete | Zero mutations inside `ML/` directory, datasets, or models. |

---

---

## 🛠️ Step 5.4 to Step 9 Implementation Records: Completed & Verified

### 1. Step 5.4: Assessment & Grading Engine
- **Features**: Assessment definition (`MIDTERM`, `FINAL`, `ASSIGNMENT`, `QUIZ`, `LAB`, `PROJECT`), mark entry, validation, publishing toggle (`published`), and student individual mark visibility.
- **Backend**: `Assessment.java`, `AssessmentMark.java`, `FacultyService.java`, `StudentService.java`, `GradingWorkflowIntegrationTest.java` (4 tests).
- **Frontend**: `FacultyAssessments.jsx`, `StudentAssessments.test.jsx` (4 tests).

### 2. Step 7: ML Student Risk Prediction Engine
- **Features**: Read-only ML model inference via Python process bridge with dual classifiers (`random_forest_model.pkl`, `early_random_forest_model.pkl`).
- **Backend**: `MlPredictionService.java`, `MlController.java`, `StudentRiskPrediction.java`.
- **Frontend**: `FacultyRiskOverview.jsx`, `StudentRiskStatus.jsx`, Risk badges on Dashboards.

### 3. Step 8: Grounded AI Academic Advisor
- **Features**: Explainable recommendations, actionable items, rationale cards, and interactive natural-language academic Q&A with optional Google Gemini integration and local rule-based fallback.
- **Backend**: `AdvisorService.java`, `AdvisorController.java`, `ChatMessageDTO.java`, `AdvisorIntegrationTest.java` (9 tests).
- **Frontend**: `StudentAdvisor.jsx`, interactive message thread, quick prompt chips, topic filters.

### 4. Step 9 & UI Polish: Admin Hub & Sci-Fi Cyber HUD Redesign
- **Features**: Complete administrative CRUD for departments, students, faculty, and courses; institutional analytics & reports; futuristic cyberpunk HUD visual identity (`index.css`, `CyberWaveChart.jsx`, glow accents, telemetry stats).
- **Frontend**: `AdminDashboard.jsx`, `AdminDepartments.jsx`, `AdminStudents.jsx`, `AdminFaculty.jsx`, `AdminCourses.jsx`, `AdminReports.jsx`.
- **Automated Tests**: All 91 backend integration tests and all 54 frontend unit tests passing with 100% pass rate.

