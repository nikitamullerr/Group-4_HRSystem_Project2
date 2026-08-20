# HR System — Group 4

A full-stack HR management app for tracking employees, attendance, payroll, time off, and performance reviews. Built for the ModernTech Solutions case study.

---

## 👥 Group Members

| Name | Modules |
| :--- | :--- |
| Nikita Muller | Auth, Attendance, Time Off |
| Xabiso Phendu | Employees, Performance Reviews |
| Rasool Fredericks | Payroll |
| Rushin Presence | Dashboard |

---

## 🛠️ Tech Stack

Node.js, Express (ES Modules), MySQL (`mysql2`), JWT auth, `bcrypt`

---

## 🔗 Links

- **ERD:** ![ERD](Backend-ModernTech%20HR-ERD.png)
- **GitHub:** [Group-4_HRSystem_Project2](https://github.com/nikitamullerr/Group-4_HRSystem_Project2.git)
- **Live:** [moderntech-hr-frontend.onrender.com](https://moderntech-hr-frontend.onrender.com)
- **Docs:** [Google Docs](https://docs.google.com/document/d/1wiat-3Vutg5_HJgBbIjsWfUwSew7h4BmxC3-6Zd-1lw/edit?usp=sharing)
- **Docs:** [Google Docs](https://docs.google.com/document/d/1QtPscGWXRALAwVyTvwORRLI8jyo24lOe7K12bFvxHcI/edit?usp=sharing)

---
## Project Structure

```
HR_System-Group-4/
  index.html, dashboard.html, employees.html,
  attendance.html, time_off.html,
  payroll_payslips.html, performance_review.html
  css/, javascript/
  server/
    config/db.js              — MySQL connection
    middleware/auth.js         — JWT auth guard
    models/                     — database queries
    controllers/                 — request handling per feature
    routes/                       — endpoint definitions
    database/schema.sql            — tables + seed data
    scripts/hash_password.js        — password hashing helper
    server.js                        — entry point
```

## Database

Six MySQL tables: `departments`, `employees` (hub table, holds login credentials), `attendance`, `leave_requests`, `payroll`, `performance_reviews` — all foreign-keyed to `employees`. Full schema in `server/database/schema.sql`.
## API Endpoints

All routes (except login) require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Login |
| GET/POST/PUT/DELETE | `/api/employees` | Employee CRUD |
| GET/POST | `/api/attendance` | Attendance |
| GET/PUT/POST | `/api/timeoff` | Leave requests |
| GET/POST | `/api/payroll` | Payroll |
| GET/POST | `/api/performance-reviews` | Performance reviews |
| GET | `/api/dashboard/summary` | Dashboard KPIs |

---

## Quick Start

```bash
git clone https://github.com/nikitamullerr/Group-4_HRSystem_Project2.git
cd Group-4_HRSystem_Project2/server
npm install
cp .env.example .env   # Add MySQL credentials + JWT secret
mysql -u root -p < database/schema.sql
npm run dev
Open index.html in browser.
## Demo Credentials

Login is by **email**. Password for every seeded account: `password123`.

- Admin: `admin@moderntech.com`

## Challenges

- **Module 1:** inconsistent data sources (embedded JS vs. fetched JSON) and silent path failures — resolved in Module 2 by having every page call the real API.
- **ES Modules:** the back-end uses `import`/`export` throughout, not `require`/`module.exports` — mixing the two caused early setup errors.
- **Team coordination on `server.js`:** the one file every route gets mounted into. Rule: build and test locally, then add your two lines and merge immediately.

## Future Enhancements

Refresh tokens, pagination/search, stricter role-based views, automated tests, hosting the back-end externally.
