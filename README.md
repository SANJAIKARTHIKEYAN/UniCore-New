# UniCore: Smart Institutional ERP & Student Risk Analytics

UniCore is an enterprise-grade university Enterprise Resource Planning (ERP) platform designed for higher education institutions. It unites academic administration (roster management, attendance tracking, assessment and grading workflows) with offline machine learning to provide early student risk detection, proactive academic interventions, and an explainable AI Advisor.

---

## 🏛️ System Architecture

```
UniCore Platform
├── Frontend Layer (React 18 + Vite 6.4 Single Page Application)
│   ├── Student Portal (Dashboard, Attendance, Performance, Results, Fees, Documents, AI Advisor)
│   ├── Faculty Portal (Assigned Courses, Roster, Attendance Marking, Assessments & Grading, Risk Advisor)
│   └── Admin Portal (Institutional Dashboard, Students, Faculty, Courses, Enrollments, Analytics)
│
├── Backend Layer (Spring Boot 3.4.3 REST API)
│   ├── Security & Auth (JWT Stateless Authentication, BCrypt, RBAC for STUDENT / FACULTY / ADMIN)
│   ├── ERP Core Services (Users, Courses, Attendance, Assessments, Enrollments, Departments)
│   ├── ML Inference Bridge (Process-isolated Python execution with JSON standard I/O)
│   └── AI Academic Advisor (Deterministic rule engine, explainable recommendations, interactive Q&A)
│
├── Database Layer (MySQL 8.0+ / H2 In-Memory for Testing)
│   ├── 15 Normalized Relational Tables
│   └── Automated Seed Data (Departments, Admin, 25 Demo Students, 10 Demo Faculty)
│
└── ML Intelligence Core (ML/) [VERIFIED & PRESERVED]
    ├── random_forest_model.pkl (Full-term holistic risk classifier)
    └── early_random_forest_model.pkl (Mid-term early-alert classifier)
```

---

## 🚀 Key Modules & Capabilities

### 1. 👨‍🎓 Student Portal
- **Dashboard**: High-level telemetry displaying active semester, enrolled courses, attendance progress, fee status, and real-time ML risk early warning card.
- **Attendance**: Per-course breakdown of total sessions, present, absent, late counts, and examination eligibility status (75% cutoff).
- **Academic Performance**: Current semester course catalog, credit breakdown, and grading progress.
- **Semester Results**: Archived grade scorecards with cumulative and semester SGPA calculation.
- **AI Academic Advisor**: Explainable guidance cards tagged by priority (`HIGH`, `MEDIUM`, `LOW`), actionable remediation items, data rationales, and an interactive Q&A assistant with quick suggestion chips.
- **Administrative Services**: Digital student ID card, hall tickets, bonafide certificates, and fee dues tracking.

### 2. 👨‍🏫 Faculty Portal
- **Dashboard**: Teaching course roster overview, total enrolled students, and direct workflow shortcuts.
- **Classroom Attendance**: Date-filtered interactive attendance grid with instant status toggles (`PRESENT`, `ABSENT`, `LATE`) and bulk marking shortcuts.
- **Assessment & Grading Engine**: Create evaluations (`MIDTERM`, `FINAL`, `ASSIGNMENT`, `QUIZ`, `LAB`, `PROJECT`), enter and update per-student marks with validation, and compute course letter grades.
- **Risk Advisor (ML)**: Filter students by course and risk category (`High Risk`, `Medium Risk`, `Low Risk`), inspect feature contributions, and trigger proactive interventions.

### 3. 🏛️ Administration Portal
- **Institutional Dashboard**: Real-time telemetry on enrolled students, faculty roster, active course offerings, and campus health.
- **User & Roster Management**: Approve, search, register, update, and manage student and faculty accounts.
- **Curriculum & Assignment**: Manage course catalog, credit weightages, and assign/unassign faculty to courses.
- **Institutional Analytics & Reports**: System-wide attendance breakdowns, assessment coverage tables, department high-risk distribution, and AI Advisor intervention statistics.

### 4. 🧠 Machine Learning Early Warning System (`ML/`)
- Dual pre-trained Random Forest classifiers loadable in read-only mode via Python inference bridge.
- **Features Analyzed**: Attendance (%), Midterm Exam, Final Exam (when completed), Assignment Average, Quiz Average, Participation Score, Project Score.
- **Zero ML Mutation Policy**: Model artifacts and datasets remain strictly untouched and immutable.

### 5. 🤖 Grounded AI Academic Advisor
- Explains *why* a student is at risk and calculates exact actions needed (e.g., *"Attend the next 4 consecutive lectures to regain examination eligibility"*).
- Interactive Q&A Assistant processes natural queries regarding attendance standing, courses needing improvement, and academic habits without hallucinations or external LLM dependencies.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Java 25 / Spring Boot 3.4.3, Spring Data JPA, Spring Security, JWT (jjwt 0.12.6), Maven |
| **Frontend** | React 18, Vite 6.4.3, Vitest, Testing Library, Vanilla CSS Design System |
| **Database** | MySQL 8.0+ (Production) / H2 In-Memory (Automated Integration Tests) |
| **ML Runtime** | Python 3 (pandas, scikit-learn, joblib) |

---

## 📋 Prerequisites

Ensure the following tools are installed on your workstation:
1. **JDK 17 or higher** (JDK 25 recommended)
2. **Node.js 18+** & `npm`
3. **Python 3.10+** (with `joblib`, `pandas`, `scikit-learn` installed)
4. **MySQL Server 8.0+** (running on `localhost:3306`)

---

## ⚙️ Installation & Setup

### 1. Database Setup (MySQL)
Execute the database initialization script located at `database/schema.sql`:
```bash
mysql -u root -p < database/schema.sql
```
This creates `unicore_db`, sets up all 15 tables, and seeds configurable departments, approved student/faculty rosters, and the default system administrator.

### 2. Backend Configuration
The backend configuration is managed via `backend/src/main/resources/application.properties` with environment variable overrides:

| Property | Environment Variable | Default Value |
| :--- | :--- | :--- |
| Server Port | `PORT` | `8080` |
| JDBC URL | `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/unicore_db...` |
| DB Username | `SPRING_DATASOURCE_USERNAME`| `root` |
| DB Password | `SPRING_DATASOURCE_PASSWORD`| *(empty)* |
| JWT Secret | `JWT_SECRET` | *(pre-configured 256-bit secret)* |
| Python Path | `PYTHON_PATH` | `python` |
| Model Dir | `ML_MODEL_DIR` | `../ML/models` |

To run the backend:
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
Backend starts on `http://localhost:8080`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend development server starts on `http://localhost:5173`.

---

## 🔐 Default Credentials & Demo Accounts

### 1. System Administrator
- **Email**: `admin@unicore.edu`
- **Password**: `Admin@UniCore2026`
- **Role**: `ADMIN`

### 2. Approved Faculty (Self-Registration or Seed)
- **ID**: `BCA-FAC-001`
- **Email**: `bca.fac001@unicore.edu`
- **Department**: BCA
*(Self-register on the Login page using Faculty tab)*

### 3. Approved Student (Self-Registration or Seed)
- **ID**: `BCA-STU-001`
- **Email**: `bca.stu001@unicore.edu`
- **Name**: Sanjai Karthikeyan
- **Department**: BCA (Semester 2)
*(Self-register on the Login page using Student tab)*

---

## 🧪 Testing & Verification

### Run Backend Integration Test Suite (91 Tests)
```bash
cd backend
.\mvnw.cmd test
```
*Executes all 91 tests across `UniCoreApplicationTests.java`, `AdvisorIntegrationTest.java`, and `GradingWorkflowIntegrationTest.java` covering authentication, student workflows, faculty grading, admin APIs, ML inference, and AI Advisor Q&A.*

### Run Frontend Unit Test Suite (54 Tests)
```bash
cd frontend
npm test -- --run
```
*Executes all 54 tests across 8 test suites (`StudentPortal`, `FacultyPortal`, `AdminPortal`, `AdminCourses`, `AdminDepartments`, `AdminFaculty`, `AdminStudents`, `StudentAssessments`) using Vitest.*

### Build Production Bundles
```bash
# Frontend production bundle
cd frontend
npm run build

# Backend compilation check
cd backend
.\mvnw.cmd test-compile
```

---

## 🛡️ Security & Integrity Highlights

- **Role-Based Access Control**: Strict endpoint-level authorization using Spring Security `@PreAuthorize` and service-level ownership validation (Students cannot view peer records; Faculty can only access assigned courses).
- **Process Isolation**: ML inference is executed via isolated `ProcessBuilder` calls with JSON streams and execution timeouts (no shell injection risk).
- **Credential Hygiene**: Passwords are encrypted using BCrypt with salt rounds; credentials and tokens are never committed to version control.
- **Zero ML Mutation Policy**: The `ML/` model artifacts and datasets are strictly read-only and immutably preserved.

---

## 📄 License & Ownership
UniCore University ERP platform is maintained for academic administration and intelligent student support.
