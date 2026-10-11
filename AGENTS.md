# UniCore Development & Agent Rules

These rules are mandatory for all AI agents, engineers, and contributors working within the UniCore repository.

---

## 1. 🛑 Absolute ML Safeguard (Zero Mutation Policy)

- **Do NOT delete, rename, move, overwrite, or recreate any files inside the `ML/` directory.**
- **The existing ML implementation is complete and verified.**
- **Do NOT modify or retrain the existing ML models (`random_forest_model.pkl`, `early_random_forest_model.pkl`).**
- **Do NOT overwrite or alter existing datasets** (`student_data.csv`, `test.csv`, `train.csv`, `unicore_student_risk.csv`).
- **All backend or external services must access the models strictly in a read-only inference capacity.**

---

## 2. 🏛️ Architecture & Component Boundaries

The UniCore codebase is divided into four distinct components:
1. `ML/`: Immutable machine learning models, datasets, and scripts.
2. `backend/`: Java 17+ / Spring Boot 3.4.3 application providing REST APIs, JWT authentication, and read-only ML inference wrappers.
3. `database/`: MySQL database schema, relational constraints, and seed scripts.
4. `frontend/`: Modern React + Vite application with custom design system and responsive UI.

### Integration Boundaries:
- `backend/` executes ML inference via isolated Python process execution with JSON streaming against `ML/models/` in read-only mode.
- `frontend/` communicates **only** with `backend/` via standard REST API endpoints.
- No direct database access from `frontend/` or `ML/`.

---

## 3. 🎯 Scope Discipline & Incremental Execution

- **Never implement unrequested features prematurely.**
- Do not implement unauthorized modules until explicitly instructed by the user.
- Always present clear next steps and ask for instructions before progressing across major phases.

---

## 4. 🎨 Design & Code Quality Standards

When implementing the web application:
- **Rich Aesthetics**: Avoid basic or generic styling. Use curated, modern color palettes, crisp typography, subtle gradients, and glassmorphism.
- **CSS Strategy**: Use Vanilla CSS with design tokens (`index.css`) for high flexibility and performance.
- **Micro-Animations**: Smooth hover transitions, interactive states, and responsive layouts.
- **Robust Error Handling**: Explicit validation with Jakarta `@Valid` on the backend, defensive rendering on the frontend.
