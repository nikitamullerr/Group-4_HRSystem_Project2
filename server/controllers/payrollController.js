import db from '../config/db.js';

// ============================================
// GET /api/payroll/summary — KPI cards
// ============================================
export const getSummary = async (req, res) => {
    try {
        const [payrollData] = await db.query(`
            SELECT 
                COUNT(DISTINCT pi.employee_id) as total_employees,
                SUM(pi.net_pay) as total_payroll,
                AVG(pi.net_pay) as average_pay
            FROM payroll_items pi
            JOIN payroll_periods pp ON pi.period_id = pp.id
            WHERE pp.status = 'ready'
        `);

        const result = payrollData[0] || { total_employees: 0, total_payroll: 0, average_pay: 0 };

        res.json({
            totalMonthlyPayroll: Math.round(result.total_payroll || 0),
            employeesPaid: result.total_employees || 0,
            averageNetPay: Math.round(result.average_pay || 0),
        });
    } catch (err) {
        console.error('Error fetching payroll summary:', err);
        res.status(500).json({ 
            error: 'Could not load payroll summary',
            details: err.message 
        });
    }
};

// ============================================
// GET /api/payroll/table — searchable payroll table
// ============================================
// GET /api/payroll/table — searchable payroll table
export const getTable = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 9;
        const offset = (page - 1) * perPage;

        const searchParam = `%${search}%`;

        const [rows] = await db.query(`
            SELECT 
                pi.id,
                pi.employee_id,
                pi.net_pay,
                pi.basic_salary,
                pi.gross_pay,
                pi.total_deductions,
                e.first_name,
                e.last_name,
                e.position as role,
                d.name as department,
                pp.name as period_name
            FROM payroll_items pi
            JOIN employees e ON pi.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN payroll_periods pp ON pi.period_id = pp.id
            WHERE e.first_name LIKE ? 
               OR e.last_name LIKE ? 
               OR d.name LIKE ?
            LIMIT ? OFFSET ?
        `, [searchParam, searchParam, searchParam, perPage, offset]);

        // Get total count
        const [countResult] = await db.query(`
            SELECT COUNT(DISTINCT pi.id) as total
            FROM payroll_items pi
            JOIN employees e ON pi.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE e.first_name LIKE ? 
               OR e.last_name LIKE ? 
               OR d.name LIKE ?
        `, [searchParam, searchParam, searchParam]);

        const total = countResult[0]?.total || 0;

        res.json({
            total,
            page,
            perPage,
            rows: rows.map(e => ({
                id: e.id,
                name: `${e.first_name} ${e.last_name}`,
                role: e.role || 'Team Member',
                dept: e.department || 'N/A',
                netPay: Number(e.net_pay) || 0,
                basicSalary: Number(e.basic_salary) || 0,
                grossPay: Number(e.gross_pay) || 0,
                totalDeductions: Number(e.total_deductions) || 0,
                period: e.period_name || 'N/A',
            })),
        });
    } catch (err) {
        console.error('Error fetching payroll table:', err);
        res.status(500).json({ 
            error: 'Could not load payroll table',
            details: err.message 
        });
    }
};

// ============================================
// POST /api/payroll/run — run payroll
// ============================================
export const runPayroll = async (req, res) => {
    const { month, year } = req.body;
    if (month === undefined || !year) {
        return res.status(400).json({ error: 'month (0-11) and year are required' });
    }

    try {
        // Find or create payroll period
        const [period] = await db.query(`
            SELECT id FROM payroll_periods 
            WHERE name = ? AND start_date >= ? AND end_date <= ?
        `, [`${month + 1}/${year}`, `${year}-${String(month + 1).padStart(2, '0')}-01`, `${year}-${String(month + 1).padStart(2, '0')}-31`]);

        let periodId;
        if (period.length === 0) {
            const [newPeriod] = await db.query(`
                INSERT INTO payroll_periods (name, start_date, end_date, payment_date, status) 
                VALUES (?, ?, ?, ?, ?)
            `, [
                `${month + 1}/${year}`,
                `${year}-${String(month + 1).padStart(2, '0')}-01`,
                `${year}-${String(month + 1).padStart(2, '0')}-31`,
                `${year}-${String(month + 1).padStart(2, '0')}-31`,
                'ready'
            ]);
            periodId = newPeriod.insertId;
        } else {
            periodId = period[0].id;
        }

        // Get all active employees
        const [employees] = await db.query(`
            SELECT e.id, e.first_name, e.last_name, e.position
            FROM employees e
            WHERE e.status = 'Active' OR e.status IS NULL
        `);

        let count = 0;
        for (const emp of employees) {
            // Calculate basic salary (default 50000 for simplicity)
            const basicSalary = 50000;
            const overtimePay = 0;
            const bonus = 0;
            const grossPay = basicSalary + overtimePay + bonus;
            const totalDeductions = Math.round(grossPay * 0.2) + Math.round(grossPay * 0.075); // Tax + Pension
            const netPay = grossPay - totalDeductions;

            await db.query(`
                INSERT INTO payroll_items (period_id, employee_id, basic_salary, overtime_pay, bonus, gross_pay, total_deductions, net_pay) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    basic_salary = VALUES(basic_salary),
                    overtime_pay = VALUES(overtime_pay),
                    bonus = VALUES(bonus),
                    gross_pay = VALUES(gross_pay),
                    total_deductions = VALUES(total_deductions),
                    net_pay = VALUES(net_pay)
            `, [periodId, emp.id, basicSalary, overtimePay, bonus, grossPay, totalDeductions, netPay]);
            count++;
        }

        res.status(201).json({ 
            ranFor: `${month + 1}/${year}`, 
            count,
            periodId
        });
    } catch (err) {
        console.error('Error running payroll:', err);
        res.status(500).json({ error: 'Could not run payroll' });
    }
};

// ============================================
// GET /api/payroll/payslip/:employeeId
// ============================================
export const getPayslip = async (req, res) => {
    const { employeeId } = req.params;
    const month = req.query.month !== undefined ? Number(req.query.month) : new Date().getMonth();
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    try {
        const [employee] = await db.query(`
            SELECT e.*, d.name as department
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE e.id = ?
        `, [employeeId]);

        if (!employee || employee.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const emp = employee[0];

        // Get payroll item for this employee and period
        const [payrollItem] = await db.query(`
            SELECT pi.*, pp.name as period_name
            FROM payroll_items pi
            JOIN payroll_periods pp ON pi.period_id = pp.id
            WHERE pi.employee_id = ? 
              AND YEAR(pp.start_date) = ? 
              AND MONTH(pp.start_date) = ?
        `, [employeeId, year, month + 1]);

        const exists = payrollItem.length > 0;
        const item = payrollItem[0] || {};

        const figures = {
            basic: exists ? Number(item.basic_salary) : 50000,
            overtime: exists ? Number(item.overtime_pay) : 0,
            bonus: exists ? Number(item.bonus) : 0,
            gross: exists ? Number(item.gross_pay) : 50000,
            tax: exists ? Number(item.total_deductions) * 0.727 : 10000,
            pension: exists ? Number(item.total_deductions) * 0.273 : 3750,
            other: 0,
            totalDeductions: exists ? Number(item.total_deductions) : 13750,
            net: exists ? Number(item.net_pay) : 36250,
        };

        res.json({
            employee: {
                id: emp.id,
                name: `${emp.first_name} ${emp.last_name}`,
                role: emp.position || 'Team Member',
                dept: emp.department || 'N/A',
                hoursWorked: 160,
                leaveDeductions: 0,
            },
            period: { 
                month, 
                year, 
                name: exists ? item.period_name : `${month + 1}/${year}`
            },
            figures,
            persisted: exists,
        });
    } catch (err) {
        console.error('Error fetching payslip:', err);
        res.status(500).json({ error: 'Could not load payslip' });
    }
};

// ============================================
// GET /api/payroll/ytd/:employeeId
// ============================================
// GET /api/payroll/ytd/:employeeId
export const getYTD = async (req, res) => {
    const { employeeId } = req.params;
    const throughMonth = req.query.throughMonth !== undefined ? Number(req.query.throughMonth) : new Date().getMonth();
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    try {
        const [employee] = await db.query('SELECT * FROM employees WHERE id = ?', [employeeId]);

        if (!employee || employee.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Get YTD from payroll_items
        const [ytdData] = await db.query(`
            SELECT 
                SUM(pi.net_pay) as ytd_total,
                COUNT(DISTINCT pi.id) as months_paid,
                AVG(pi.net_pay) as avg_monthly
            FROM payroll_items pi
            JOIN payroll_periods pp ON pi.period_id = pp.id
            WHERE pi.employee_id = ? 
              AND YEAR(pp.start_date) = ? 
              AND MONTH(pp.start_date) <= ?
        `, [employeeId, year, throughMonth + 1]);

        const result = ytdData[0] || { ytd_total: 0, months_paid: 0, avg_monthly: 0 };

        // If no data, calculate estimated YTD
        if (result.months_paid === 0) {
            const monthsToInclude = throughMonth + 1;
            const monthlyNet = 36250;
            result.ytd_total = monthlyNet * monthsToInclude;
            result.months_paid = monthsToInclude;
            result.avg_monthly = monthlyNet;
        }

        res.json({
            employeeId: Number(employeeId),
            year,
            throughMonth: throughMonth + 1,
            ytd_total: Math.round(result.ytd_total || 0),
            months_paid: result.months_paid || 0,
            avg_monthly: Math.round(result.avg_monthly || 0),
        });
    } catch (err) {
        console.error('Error fetching YTD:', err);
        res.status(500).json({ error: 'Could not load year-to-date totals' });
    }
};