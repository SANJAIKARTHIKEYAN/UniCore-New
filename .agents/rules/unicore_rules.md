# UniCore Workspace Customization Rules

These rules govern agent behavior in the UniCore workspace.

## 1. Machine Learning Safeguards
- Under no circumstances should any file inside `ML/` be deleted, overwritten, renamed, modified, or retrained.
- `ML/models/random_forest_model.pkl` and `ML/models/early_random_forest_model.pkl` are completed production artifacts.
- In backend services, load models strictly using read-only methods (`joblib.load`).

## 2. Phased Implementation
- Do not implement unauthorized modules ahead of instruction (e.g. Auth, DB migrations, Dashboards, AI Advisor).
- Scaffold only what is explicitly requested.

## 3. Technology Stack Alignment
- **Backend**: Java 17+ / Spring Boot 3.4.3, Spring Data JPA, Spring Security 6, Maven.
- **Frontend**: React + Vite, Vanilla CSS design system.
- **Database**: MySQL 8.0+ (Production) / H2 In-Memory (Automated Tests).
- **ML**: Pre-existing Scikit-Learn models in `ML/` loaded read-only via isolated Python process.
