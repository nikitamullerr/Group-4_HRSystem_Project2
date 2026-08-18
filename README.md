# HR System — Group 4

A full-stack HR management app for tracking employees, attendance, payroll, time off, and performance reviews. Static HTML/CSS/JS front-end (Module 1) backed by a Node.js + Express + MySQL API (Module 2), built for the ModernTech Solutions case study.

## Group Members

- Nikita Muller — Auth, Attendance, Time Off
- Xabiso Phendu — Employees, Performance Reviews
- Rasool Fredericks — Payroll
- Rushin Presence — Dashboard

## Tech Stack

Node.js, Express (ES Modules), MySQL (`mysql2`), JWT auth, `bcrypt` password hashing.

## Links

- **ERD:** ![alt text](<Backend_ModernTech Solutions.drawio.png>)
- **GitHub Repo:** https://github.com/nikitamullerr/Group-4_HRSystem_Project2.git
- **Live front-end:** 
- **Docs:** https://docs.google.com/document/d/1VuhvWDlhzR18jsjG5No5b2fd3wmIOFVNX-AYX-hzXrI

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

## API

All routes except login require `Authorization: Bearer <token>`.

- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/employees`
- `GET/POST /api/attendance`
- `GET/POST /api/leave-requests`, `PUT /api/leave-requests/:id/status`
- `GET /api/payroll`, `POST /api/payroll/run`
- `GET/POST /api/performance-reviews`
- `GET /api/dashboard/summary`

## Getting Started

```bash
git clone https://github.com/nikitamullerr/HR_System-Group-4.git
cd HR_System-Group-4/server
npm install
cp .env.example .env   # fill in your MySQL credentials + a JWT secret
mysql -u root -p -e "CREATE DATABASE moderntech_hr"
mysql -u root -p moderntech_hr < database/schema.sql
npm run dev
```

Check `http://localhost:4000/api/health` returns `{"status":"ok"}`. Open `index.html` for the front-end.

## Demo Credentials

Login is by **email**. Password for every seeded account: `password123`.

- Admin: `admin@moderntech.com`

## Challenges

- **Module 1:** inconsistent data sources (embedded JS vs. fetched JSON) and silent path failures — resolved in Module 2 by having every page call the real API.
- **ES Modules:** the back-end uses `import`/`export` throughout, not `require`/`module.exports` — mixing the two caused early setup errors.
- **Team coordination on `server.js`:** the one file every route gets mounted into. Rule: build and test locally, then add your two lines and merge immediately.

## Future Enhancements

Refresh tokens, pagination/search, stricter role-based views, automated tests, hosting the back-end externally.
