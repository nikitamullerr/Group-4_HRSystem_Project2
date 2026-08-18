// models/payrollCalculations.js

/**
 * Calculate payslip figures for a single employee for a given month
 * @param {Object} employee - Employee object with salary, attendance, etc.
 * @param {number} month - Month index (0-11)
 * @returns {Object} Payslip figures
 */
export const calculatePayslipFigures = (employee, month) => {
  const basic = Number(employee.salary) || 0;

  // Calculate overtime from attendance (simplified)
  // If attendance data is available, we could calculate actual overtime
  const overtime = Number(employee.overtime) || 0;

  const gross = basic + overtime;

  // Tax calculation (simplified - 20% flat rate)
  const tax = Math.round(gross * 0.2);

  // Pension calculation (7.5% of gross)
  const pension = Math.round(gross * 0.075);

  // Other deductions (e.g., leave deductions)
  const other = Number(employee.leave_deductions) || 0;

  const totalDeductions = tax + pension + other;
  const net = gross - totalDeductions;

  return {
    basic,
    overtime,
    gross,
    tax,
    pension,
    other,
    totalDeductions,
    net,
  };
};

/**
 * Calculate Year-to-Date totals for an employee
 * @param {Object} employee - Employee object with salary
 * @param {number} throughMonth - Month index (0-11) to calculate through
 * @returns {Object} YTD totals
 */
export const calculateYTD = (employee, throughMonth) => {
  const basic = Number(employee.salary) || 0;
  const monthsToInclude = throughMonth + 1;

  // Calculate monthly net pay
  const monthlyGross = basic;
  const monthlyTax = Math.round(monthlyGross * 0.2);
  const monthlyPension = Math.round(monthlyGross * 0.075);
  const monthlyNet = monthlyGross - monthlyTax - monthlyPension;

  const ytdTotal = monthlyNet * monthsToInclude;
  const avgMonthly = monthlyNet;

  return {
    ytd_total: ytdTotal,
    months_paid: monthsToInclude,
    avg_monthly: avgMonthly,
  };
};
