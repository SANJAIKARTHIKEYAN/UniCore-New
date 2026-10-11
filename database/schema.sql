-- ==========================================================
-- UniCore Database Initialization Script (MySQL 8.0+)
-- Step 3: Departments, Authentication, Profiles & Roster Seed Data
-- ==========================================================

CREATE DATABASE IF NOT EXISTS unicore_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE unicore_db;

-- 1. Departments Table (Configurable institutional departments)
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(20) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_department_code (short_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users Table (Core authentication entity)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'FACULTY', 'ADMIN') NOT NULL,
    department VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    admission_year INT NOT NULL,
    current_semester INT NOT NULL,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_roll (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Faculty Profiles Table
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    faculty_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_faculty_code (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Approved Students Roster (For controlled self-registration verification)
CREATE TABLE IF NOT EXISTS approved_students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    college_email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    admission_year INT NOT NULL,
    current_semester INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    is_registered BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_approved_student (student_id, college_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Approved Faculty Roster (For controlled self-registration verification)
CREATE TABLE IF NOT EXISTS approved_faculties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    college_email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    is_registered BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_approved_faculty (faculty_id, college_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- 5 Configurable Departments Seeding
-- ==========================================================
INSERT INTO departments (name, short_code, active)
VALUES
  ('Bachelor of Computer Applications', 'BCA', TRUE),
  ('B.Sc Computer Science', 'BSCS', TRUE),
  ('Bachelor of Commerce', 'BCOM', TRUE),
  ('Bachelor of Business Administration', 'BBA', TRUE),
  ('B.Sc Mathematics', 'BSM', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), active=VALUES(active);

-- ==========================================================
-- Initial Admin Seed
-- ==========================================================
INSERT INTO users (name, email, password_hash, role, department, status)
SELECT 'System Administrator', 'admin@unicore.edu', '$2a$10$eE.l0w44q/R8l8d1BwXfQ.l32jN6/O/4V6hX1.0g0M5oE4W3Y3eWW', 'ADMIN', 'Administration', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@unicore.edu');

-- ==========================================================
-- 25 Demo Approved Students (5 per department)
-- ==========================================================
INSERT INTO approved_students (student_id, name, college_email, department, admission_year, current_semester, active, is_registered)
VALUES
  -- 1. BCA
  ('BCA-STU-001', 'Sanjai Karthikeyan', 'bca.stu001@unicore.edu', 'BCA', 2024, 2, TRUE, FALSE),
  ('BCA-STU-002', 'Aravind Mohan', 'bca.stu002@unicore.edu', 'BCA', 2024, 1, TRUE, FALSE),
  ('BCA-STU-003', 'Kavitha Sundar', 'bca.stu003@unicore.edu', 'BCA', 2023, 4, TRUE, FALSE),
  ('BCA-STU-004', 'Deepak Raj', 'bca.stu004@unicore.edu', 'BCA', 2023, 3, TRUE, FALSE),
  ('BCA-STU-005', 'Harini Vijay', 'bca.stu005@unicore.edu', 'BCA', 2022, 6, TRUE, FALSE),

  -- 2. BSCS
  ('BSCS-STU-001', 'Rahul Sharma', 'bscs.stu001@unicore.edu', 'BSCS', 2024, 2, TRUE, FALSE),
  ('BSCS-STU-002', 'Sneha Patel', 'bscs.stu002@unicore.edu', 'BSCS', 2024, 1, TRUE, FALSE),
  ('BSCS-STU-003', 'Karthik Raja', 'bscs.stu003@unicore.edu', 'BSCS', 2023, 4, TRUE, FALSE),
  ('BSCS-STU-004', 'Divya Menon', 'bscs.stu004@unicore.edu', 'BSCS', 2023, 3, TRUE, FALSE),
  ('BSCS-STU-005', 'Aditya Varma', 'bscs.stu005@unicore.edu', 'BSCS', 2022, 5, TRUE, FALSE),

  -- 3. BCOM
  ('BCOM-STU-001', 'Manoj Kumar', 'bcom.stu001@unicore.edu', 'BCOM', 2024, 2, TRUE, FALSE),
  ('BCOM-STU-002', 'Pooja Hegde', 'bcom.stu002@unicore.edu', 'BCOM', 2024, 1, TRUE, FALSE),
  ('BCOM-STU-003', 'Suresh Raina', 'bcom.stu003@unicore.edu', 'BCOM', 2023, 4, TRUE, FALSE),
  ('BCOM-STU-004', 'Ananya Iyer', 'bcom.stu004@unicore.edu', 'BCOM', 2023, 3, TRUE, FALSE),
  ('BCOM-STU-005', 'Vikas Gupta', 'bcom.stu005@unicore.edu', 'BCOM', 2022, 6, TRUE, FALSE),

  -- 4. BBA
  ('BBA-STU-001', 'Rohan Mehra', 'bba.stu001@unicore.edu', 'BBA', 2024, 2, TRUE, FALSE),
  ('BBA-STU-002', 'Tara Singh', 'bba.stu002@unicore.edu', 'BBA', 2024, 1, TRUE, FALSE),
  ('BBA-STU-003', 'Nikhil Joshi', 'bba.stu003@unicore.edu', 'BBA', 2023, 4, TRUE, FALSE),
  ('BBA-STU-004', 'Ritu Sethi', 'bba.stu004@unicore.edu', 'BBA', 2023, 3, TRUE, FALSE),
  ('BBA-STU-005', 'Gaurav Sen', 'bba.stu005@unicore.edu', 'BBA', 2022, 5, TRUE, FALSE),

  -- 5. BSM
  ('BSM-STU-001', 'Siddharth Raman', 'bsm.stu001@unicore.edu', 'BSM', 2024, 2, TRUE, FALSE),
  ('BSM-STU-002', 'Meera Nair', 'bsm.stu002@unicore.edu', 'BSM', 2024, 1, TRUE, FALSE),
  ('BSM-STU-003', 'Arun Prakash', 'bsm.stu003@unicore.edu', 'BSM', 2023, 4, TRUE, FALSE),
  ('BSM-STU-004', 'Bhavna Jain', 'bsm.stu004@unicore.edu', 'BSM', 2023, 3, TRUE, FALSE),
  ('BSM-STU-005', 'Kiran Roy', 'bsm.stu005@unicore.edu', 'BSM', 2022, 6, TRUE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name), department=VALUES(department);

-- ==========================================================
-- 10 Demo Approved Faculty (2 per department)
-- ==========================================================
INSERT INTO approved_faculties (faculty_id, name, college_email, department, active, is_registered)
VALUES
  -- 1. BCA
  ('BCA-FAC-001', 'Dr. K. Sharma', 'bca.fac001@unicore.edu', 'BCA', TRUE, FALSE),
  ('BCA-FAC-002', 'Prof. S. Ranganathan', 'bca.fac002@unicore.edu', 'BCA', TRUE, FALSE),

  -- 2. BSCS
  ('BSCS-FAC-001', 'Dr. Anita Desai', 'bscs.fac001@unicore.edu', 'BSCS', TRUE, FALSE),
  ('BSCS-FAC-002', 'Prof. R. Balaji', 'bscs.fac002@unicore.edu', 'BSCS', TRUE, FALSE),

  -- 3. BCOM
  ('BCOM-FAC-001', 'Dr. P. Venkatraman', 'bcom.fac001@unicore.edu', 'BCOM', TRUE, FALSE),
  ('BCOM-FAC-002', 'Prof. Sunita Aggarwal', 'bcom.fac002@unicore.edu', 'BCOM', TRUE, FALSE),

  -- 4. BBA
  ('BBA-FAC-001', 'Dr. Rajiv Singhania', 'bba.fac001@unicore.edu', 'BBA', TRUE, FALSE),
  ('BBA-FAC-002', 'Prof. Nalini Swaminathan', 'bba.fac002@unicore.edu', 'BBA', TRUE, FALSE),

  -- 5. BSM
  ('BSM-FAC-001', 'Dr. T. S. Narayanan', 'bsm.fac001@unicore.edu', 'BSM', TRUE, FALSE),
  ('BSM-FAC-002', 'Prof. Geetha Krishnan', 'bsm.fac002@unicore.edu', 'BSM', TRUE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name), department=VALUES(department);

-- ==========================================================
-- Step 4: Student Module Tables
-- ==========================================================

-- 7. Courses (Institutional course catalog)
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    instructor_id BIGINT NULL,
    INDEX idx_course_dept_sem (department, semester),
    INDEX idx_course_instructor (instructor_id),
    CONSTRAINT fk_course_instructor FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Enrollments (Student <-> Course linkage per semester)
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    semester INT NOT NULL,
    academic_year INT NOT NULL,
    grade VARCHAR(5),
    grade_points DOUBLE,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_enrollment (student_id, course_id, semester, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Attendance Records (Day-level per student per course)
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_attendance_student_course_date (student_id, course_id, date),
    INDEX idx_attendance_student_course (student_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Assessments (Faculty-created evaluations per course)
CREATE TABLE IF NOT EXISTS assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM('MIDTERM', 'FINAL', 'ASSIGNMENT', 'QUIZ', 'LAB', 'PROJECT') NOT NULL,
    max_marks DOUBLE NOT NULL,
    weightage DOUBLE NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assessment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_assessment_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Assessment Marks (Per-student mark per assessment)
CREATE TABLE IF NOT EXISTS assessment_marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    marks_obtained DOUBLE,
    graded_at TIMESTAMP,
    CONSTRAINT fk_mark_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    CONSTRAINT fk_mark_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_assessment_student (assessment_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Fee Records (Semester-wise fee tracking)
CREATE TABLE IF NOT EXISTS fee_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    semester INT NOT NULL,
    academic_year INT NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    amount DOUBLE NOT NULL,
    paid_amount DOUBLE NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    status ENUM('PAID', 'PARTIALLY_PAID', 'UNPAID', 'OVERDUE') NOT NULL DEFAULT 'UNPAID',
    CONSTRAINT fk_fee_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Documents (Student-accessible document metadata)
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    semester INT,
    issued_date DATE NOT NULL,
    status ENUM('AVAILABLE', 'PENDING', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_document_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Notifications (System/department announcements)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('GENERAL', 'ACADEMIC', 'FEE', 'EXAM', 'DEPARTMENT') NOT NULL DEFAULT 'GENERAL',
    target_department VARCHAR(255),
    target_semester INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Student Risk Predictions (ML Early Warning Advisory Cache)
CREATE TABLE IF NOT EXISTS student_risk_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT,
    risk_category VARCHAR(30) NOT NULL,
    confidence DOUBLE,
    probabilities_json TEXT,
    model_version VARCHAR(50),
    predicted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_risk_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_risk_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_risk_student (student_id),
    INDEX idx_risk_category (risk_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

