// models/payrollModel.js
// Raw SQL for payroll + payslips. Assumes an `employees` table already
// exists (from employeeModel.js) and adds a `payroll_runs` table for
// saved/snapshotted payslips.
//
// Adjust the require path below to match wherever your pool actually lives.
const db = require("../database/db");

// ---- one-time table used to store generated payslips ----
// Run this once (e.g. paste into your DB client, or a migration script):
//
// CREATE TABLE IF NOT EXISTS payroll_runs (
//   id               SERIAL PRIMARY KEY,
//   employee_id      INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
//   period_month     INT NOT NULL,
//   period_year      INT NOT NULL,
//   basic            NUMERIC(12,2) NOT NULL,
//   overtime         NUMERIC(12,2) NOT NULL,
//   tax              NUMERIC(12,2) NOT NULL,
//   pension          NUMERIC(12,2) NOT NULL,
//   other_deductions NUMERIC(12,2) NOT NULL,
//   gross            NUMERIC(12,2) NOT NULL,
//   net              NUMERIC(12,2) NOT NULL,
//   created_at       TIMESTAMP DEFAULT now(),
//   UNIQUE(employee_id, period_month, period_year)
// );

function getAllEmployeesForPayroll() {
  return db.query("SELECT * FROM employees ORDER BY last_name, first_name")
    .then((result) => result.rows);
}

function getEmployeesPage(search, limit, offset) {
  const params = [];
  let where = "";
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    where = `WHERE LOWER(first_name || ' ' || last_name || ' ' || department) LIKE $${params.length}`;
  }

  const countParams = [...params];
  params.push(limit, offset);

  return db.query(`SELECT COUNT(*)::int AS total FROM employees ${where}`, countParams)
    .then((countResult) => {
      const total = countResult.rows[0].total;
      return db
        .query(
          `SELECT * FROM employees ${where}
           ORDER BY last_name, first_name
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        )
        .then((rowsResult) => ({ total, rows: rowsResult.rows }));
    });
}

function getEmployeeById(employeeId) {
  return db.query("SELECT * FROM employees WHERE id = $1", [employeeId])
    .then((result) => result.rows[0] || null);
}

function findPayrollRun(employeeId, month, year) {
  return db
    .query(
      `SELECT * FROM payroll_runs WHERE employee_id = $1 AND period_month = $2 AND period_year = $3`,
      [employeeId, month, year]
    )
    .then((result) => result.rows[0] || null);
}

function upsertPayrollRun(employeeId, month, year, figures) {
  return db
    .query(
      `INSERT INTO payroll_runs
        (employee_id, period_month, period_year, basic, overtime, tax, pension, other_deductions, gross, net)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (employee_id, period_month, period_year)
       DO UPDATE SET basic=$4, overtime=$5, tax=$6, pension=$7, other_deductions=$8, gross=$9, net=$10
       RETURNING *`,
      [
        employeeId, month, year,
        figures.basic, figures.overtime, figures.tax, figures.pension,
        figures.other, figures.gross, figures.net,
      ]
    )
    .then((result) => result.rows[0]);
}

module.exports = {
  getAllEmployeesForPayroll,
  getEmployeesPage,
  getEmployeeById,
  findPayrollRun,
  upsertPayrollRun,
};