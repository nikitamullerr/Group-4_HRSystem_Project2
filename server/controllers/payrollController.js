import db from '../config/db.js';
import { calculatePayslipFigures, calculateYTD } from '../models/payrollCalculations.js';

// GET /api/payroll/summary — KPI cards
export const getSummary = async (req, res) => {
    try {
        // Get current month payroll from your existing payroll table
        const [payrollData] = await db.query(`
            SELECT 
                COUNT(DISTINCT p.employee_id) as total_employees,
                SUM(p.net_pay) as total_payroll,
                AVG(p.net_pay) as average_pay
            FROM payroll p
            WHERE MONTH(p.month) = MONTH(CURRENT_DATE())
            AND YEAR(p.month) = YEAR(CURRENT_DATE())
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
                p.id,
                p.employee_id,
                p.net_pay,
                e.first_name,
                e.last_name,
                e.position as role,
                d.name as department,
                DATE_FORMAT(p.month, '%M %Y') as period_name
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE e.first_name LIKE ? 
               OR e.last_name LIKE ? 
               OR d.name LIKE ?
            ORDER BY p.month DESC, e.last_name ASC
            LIMIT ? OFFSET ?
        `, [searchParam, searchParam, searchParam, perPage, offset]);

        // Get total count
        const [countResult] = await db.query(`
            SELECT COUNT(DISTINCT p.id) as total
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
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

// POST /api/payroll/run — run payroll
export const runPayroll = async (req, res) => {
    const { month, year } = req.body;
    
    if (month === undefined || !year) {
        return res.status(400).json({ error: 'month (0-11) and year are required' });
    }

    try {
        const monthNum = Number(month) + 1; // Convert 0-based to 1-based
        const monthStr = String(monthNum).padStart(2, '0');
        const monthDate = `${year}-${monthStr}-01`;

        // Get all active employees
        const [employees] = await db.query(`
            SELECT e.id, e.first_name, e.last_name, e.position
            FROM employees e
            WHERE e.status = 'Active' OR e.status IS NULL
        `);

        let count = 0;
        for (const emp of employees) {
            // Check if payroll already exists for this employee/month
            const [existing] = await db.query(`
                SELECT id FROM payroll 
                WHERE employee_id = ? AND MONTH(month) = ? AND YEAR(month) = ?
            `, [emp.id, monthNum, year]);

            if (existing.length > 0) {
                continue; // Skip if already exists
            }

            // Calculate payroll using the model
            const employeeData = {
                salary: 50000, // Default - you can get from employee record
                overtime: 0,
                leave_deductions: 0
            };

            const figures = calculatePayslipFigures(employeeData, month);

            await db.query(`
                INSERT INTO payroll (employee_id, month, net_pay, status)
                VALUES (?, ?, ?, 'Ready')
            `, [emp.id, monthDate, figures.net]);

            count++;
        }

        res.status(201).json({ 
            ranFor: `${month + 1}/${year}`, 
            count,
            month: monthDate
        });
    } catch (err) {
        console.error('Error running payroll:', err);
        res.status(500).json({ error: 'Could not run payroll' });
    }
};

// GET /api/payroll/payslip/:id
export const getPayslip = async (req, res) => {
    const { id } = req.params;

    try {
        // Get payroll record with employee details
        const [rows] = await db.query(`
            SELECT 
                p.*,
                e.first_name,
                e.last_name,
                e.email,
                e.position,
                d.name AS department
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE p.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        const record = rows[0];

        // Calculate payslip figures
        const employeeData = {
            salary: record.net_pay / 0.65, // Estimate from net pay
            overtime: 0,
            leave_deductions: 0
        };
        
        const figures = calculatePayslipFigures(employeeData, new Date(record.month).getMonth());

        res.json({
            employee: {
                id: record.employee_id,
                name: `${record.first_name} ${record.last_name}`,
                email: record.email || 'N/A',
                position: record.position || 'Team Member',
                department: record.department || 'N/A'
            },
            payroll: {
                id: record.id,
                month: record.month,
                netPay: record.net_pay,
                status: record.status || 'Ready'
            },
            breakdown: {
                basicSalary: figures.basic,
                allowances: figures.overtime,
                bonuses: 0,
                deductions: figures.totalDeductions,
                total: figures.net
            },
            generatedAt: new Date().toISOString()
        });

    } catch (err) {
        console.error('Error fetching payslip:', err);
        res.status(500).json({ error: 'Could not load payslip' });
    }
};

// GET /api/payroll/ytd/:employeeId
export const getYTD = async (req, res) => {
    const { employeeId } = req.params;
    const throughMonth = req.query.throughMonth !== undefined ? Number(req.query.throughMonth) : new Date().getMonth();
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    try {
        // Get YTD from payroll records
        const [ytdData] = await db.query(`
            SELECT 
                SUM(p.net_pay) as ytd_total,
                COUNT(DISTINCT p.id) as months_paid,
                AVG(p.net_pay) as avg_monthly
            FROM payroll p
            WHERE p.employee_id = ? 
              AND YEAR(p.month) = ? 
              AND MONTH(p.month) <= ?
        `, [employeeId, year, throughMonth + 1]);

        const result = ytdData[0] || { ytd_total: 0, months_paid: 0, avg_monthly: 0 };

        // If no data, calculate estimated YTD
        if (result.months_paid === 0) {
            const monthsToInclude = throughMonth + 1;
            const monthlyNet = 36250; // Default estimate
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

// CRUD ENDPOINTS FOR FRONTEND

// GET - Get all payroll records
export const getAllPayroll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.*,
                e.first_name,
                e.last_name,
                e.email,
                d.name AS department
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY p.month DESC, e.last_name ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching payroll:', error);
        res.status(500).json({ error: 'Failed to fetch payroll records' });
    }
};

// GET - Get payroll by employee
export const getPayrollByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const [rows] = await db.query(`
            SELECT 
                p.*,
                e.first_name,
                e.last_name,
                e.email,
                e.position,
                d.name AS department
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE p.employee_id = ?
            ORDER BY p.month DESC
        `, [employeeId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employee payroll:', error);
        res.status(500).json({ error: 'Failed to fetch employee payroll' });
    }
};

// GET - Get payroll by month
export const getPayrollByMonth = async (req, res) => {
    try {
        const { month } = req.params;
        const [rows] = await db.query(`
            SELECT 
                p.*,
                e.first_name,
                e.last_name,
                e.email,
                e.position,
                d.name AS department
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE DATE_FORMAT(p.month, '%Y-%m') = ?
            ORDER BY e.last_name ASC
        `, [month]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching monthly payroll:', error);
        res.status(500).json({ error: 'Failed to fetch monthly payroll' });
    }
};

// POST - Create payroll record
export const createPayroll = async (req, res) => {
    try {
        const { employee_id, month, net_pay, status } = req.body;

        if (!employee_id || !month || net_pay === undefined) {
            return res.status(400).json({ 
                error: 'employee_id, month, and net_pay are required' 
            });
        }

        const [employee] = await db.query(
            'SELECT id FROM employees WHERE id = ?',
            [employee_id]
        );

        if (employee.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const [existing] = await db.query(`
            SELECT id FROM payroll 
            WHERE employee_id = ? AND DATE_FORMAT(month, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')
        `, [employee_id, month]);

        if (existing.length > 0) {
            return res.status(400).json({ 
                error: 'Payroll record already exists for this employee and month' 
            });
        }

        const [result] = await db.query(`
            INSERT INTO payroll (employee_id, month, net_pay, status)
            VALUES (?, ?, ?, ?)
        `, [employee_id, month, net_pay, status || 'Ready']);

        const [newRecord] = await db.query(`
            SELECT 
                p.*,
                e.first_name,
                e.last_name,
                e.email
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            WHERE p.id = ?
        `, [result.insertId]);

        res.status(201).json(newRecord[0]);
    } catch (error) {
        console.error('Error creating payroll:', error);
        res.status(500).json({ error: 'Failed to create payroll record' });
    }
};

// PUT - Update payroll record
export const updatePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const { net_pay, status } = req.body;

        const [existing] = await db.query(
            'SELECT * FROM payroll WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        await db.query(`
            UPDATE payroll 
            SET net_pay = COALESCE(?, net_pay),
                status = COALESCE(?, status)
            WHERE id = ?
        `, [net_pay, status, id]);

        const [updated] = await db.query(`
            SELECT 
                p.*,
                e.first_name,
                e.last_name,
                e.email
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            WHERE p.id = ?
        `, [id]);

        res.json(updated[0]);
    } catch (error) {
        console.error('Error updating payroll:', error);
        res.status(500).json({ error: 'Failed to update payroll record' });
    }
};

// DELETE - Delete payroll record
export const deletePayroll = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query(
            'SELECT * FROM payroll WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        await db.query('DELETE FROM payroll WHERE id = ?', [id]);

        res.json({ message: 'Payroll record deleted successfully' });
    } catch (error) {
        console.error('Error deleting payroll:', error);
        res.status(500).json({ error: 'Failed to delete payroll record' });
    }
};