import db from '../config/db.js';

const Attendance = {
    // Get all attendance records with employee names
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT a.*, e.first_name, e.last_name 
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            ORDER BY a.date DESC, e.id
        `);
        return rows;
    },

    // Get attendance for a specific date range
    getByDateRange: async (startDate, endDate) => {
        const [rows] = await db.query(`
            SELECT a.*, e.first_name, e.last_name 
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE a.date BETWEEN ? AND ?
            ORDER BY a.date, e.id
        `, [startDate, endDate]);
        return rows;
    },

    // Mark attendance for an employee on a specific date
    createOrUpdate: async (employeeId, date, status) => {
        const [result] = await db.query(
            `INSERT INTO attendance (employee_id, date, status) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [employeeId, date, status]
        );
        return result;
    },

    // Get attendance summary (present/absent counts)
    getSummary: async (startDate, endDate) => {
        const [rows] = await db.query(`
            SELECT 
                COUNT(DISTINCT employee_id) AS total_employees,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN status = 'Remote' THEN 1 ELSE 0 END) AS remote_count,
                SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) AS leave_count
            FROM attendance
            WHERE date BETWEEN ? AND ?
        `, [startDate, endDate]);
        return rows[0];
    }
};

export default Attendance;