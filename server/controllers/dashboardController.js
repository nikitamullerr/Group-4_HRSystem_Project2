import db from '../config/db.js';

export const getDashboardSummary = async (req, res) => {
    try {
        // Total employees
        const [employeeRows] = await db.query(`
            SELECT COUNT(*) AS totalEmployees
            FROM employees
        `);

        // Monthly payroll total
        const [payrollRows] = await db.query(`
            SELECT COALESCE(SUM(net_pay), 0) AS monthlyPayroll
            FROM payroll
            WHERE MONTH(month) = MONTH(CURRENT_DATE())
            AND YEAR(month) = YEAR(CURRENT_DATE())
        `);

        // Pending leave requests
        const [leaveRows] = await db.query(`
            SELECT COUNT(*) AS pendingLeave
            FROM leave_requests
            WHERE status = 'Pending'
        `);

        // Average performance rating
        const [ratingRows] = await db.query(`
            SELECT COALESCE(AVG(rating), 0) AS averageRating
            FROM performance_reviews
        `);

        // Attendance by day
        const [attendanceRows] = await db.query(`
            SELECT
                date,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent,
                SUM(CASE WHEN status = 'Remote' THEN 1 ELSE 0 END) AS remote,
                SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) AS onLeave
            FROM attendance
            GROUP BY date
            ORDER BY date ASC
        `);

        // Workforce by department
        const [departmentRows] = await db.query(`
            SELECT
                d.name AS department,
                COUNT(e.id) AS employeeCount
            FROM departments d
            LEFT JOIN employees e
                ON d.id = e.department_id
            GROUP BY d.id, d.name
            ORDER BY employeeCount DESC
        `);

        res.json({
            totalEmployees: employeeRows[0].totalEmployees,
            monthlyPayroll: payrollRows[0].monthlyPayroll,
            pendingLeave: leaveRows[0].pendingLeave,
            averageRating: Number(ratingRows[0].averageRating).toFixed(2),
            attendanceByDay: attendanceRows,
            workforceByDepartment: departmentRows
        });

    } catch (error) {
        console.error('Dashboard error:', error);

        res.status(500).json({
            message: 'Failed to load dashboard summary',
            error: error.message
        });
    }
};