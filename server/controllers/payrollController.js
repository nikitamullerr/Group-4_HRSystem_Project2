// controllers/payrollController.js
const payrollModel = require("../models/payrollModel");
const { calculatePayslipFigures, calculateYTD } = require("../models/payrollCalculations");

// GET /api/payroll/summary — KPI cards for the Payroll tab
function getSummary(req, res) {
  payrollModel
    .getAllEmployeesForPayroll()
    .then((employees) => {
      const total = employees.reduce(
        (sum, e) => sum + Number(e.salary) + Number(e.overtime) - Number(e.deductions),
        0
      );
      const avgNet = employees.length ? Math.round(total / employees.length) : 0;

      res.json({
        totalMonthlyPayroll: Math.round(total),
        employeesPaid: employees.length,
        averageNetPay: avgNet,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Could not load payroll summary" });
    });
}

// GET /api/payroll/table?search=&page=&perPage= — searchable payroll table
function getTable(req, res) {
  const search = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 9;
  const offset = (page - 1) * perPage;

  payrollModel
    .getEmployeesPage(search, perPage, offset)
    .then(({ total, rows }) => {
      res.json({
        total,
        page,
        perPage,
        rows: rows.map((e) => ({
          id: e.id,
          name: `${e.first_name} ${e.last_name}`,
          role: e.role,
          dept: e.department,
          status: e.status,
          netPay: Number(e.salary) + Number(e.overtime) - Number(e.deductions),
        })),
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Could not load payroll table" });
    });
}

// POST /api/payroll/run  { month, year } — snapshot every employee's payslip for a period
function runPayroll(req, res) {
  const { month, year } = req.body;
  if (month === undefined || !year) {
    return res.status(400).json({ error: "month (0-11) and year are required" });
  }

  payrollModel
    .getAllEmployeesForPayroll()
    .then((employees) => {
      const saves = employees.map((e) => {
        const figures = calculatePayslipFigures(e, Number(month));
        return payrollModel.upsertPayrollRun(e.id, month, year, figures);
      });
      return Promise.all(saves);
    })
    .then((results) => {
      res.status(201).json({ ranFor: `${Number(month) + 1}/${year}`, count: results.length });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Could not run payroll" });
    });
}

// GET /api/payroll/payslip/:employeeId?month=&year=
function getPayslip(req, res) {
  const { employeeId } = req.params;
  const month = req.query.month !== undefined ? Number(req.query.month) : new Date().getMonth();
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

  payrollModel
    .getEmployeeById(employeeId)
    .then((employee) => {
      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return null;
      }

      return payrollModel.findPayrollRun(employeeId, month, year).then((savedRun) => {
        const figures = savedRun
          ? {
              basic: Number(savedRun.basic),
              overtime: Number(savedRun.overtime),
              gross: Number(savedRun.gross),
              tax: Number(savedRun.tax),
              pension: Number(savedRun.pension),
              other: Number(savedRun.other_deductions),
              totalDeductions:
                Number(savedRun.tax) + Number(savedRun.pension) + Number(savedRun.other_deductions),
              net: Number(savedRun.net),
            }
          : calculatePayslipFigures(employee, month);

        res.json({
          employee: {
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            role: employee.role,
            dept: employee.department,
            hoursWorked: employee.hours_worked,
            leaveDeductions: employee.leave_deductions,
          },
          period: { month, year },
          figures,
          persisted: Boolean(savedRun),
        });
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Could not load payslip" });
    });
}

// GET /api/payroll/ytd/:employeeId?throughMonth=&year=
function getYTD(req, res) {
  const { employeeId } = req.params;
  const throughMonth =
    req.query.throughMonth !== undefined ? Number(req.query.throughMonth) : new Date().getMonth();
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

  payrollModel
    .getEmployeeById(employeeId)
    .then((employee) => {
      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }
      const ytd = calculateYTD(employee, throughMonth);
      res.json({ employeeId: employee.id, year, throughMonth, ...ytd });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Could not load year-to-date totals" });
    });
}

module.exports = { getSummary, getTable, runPayroll, getPayslip, getYTD };