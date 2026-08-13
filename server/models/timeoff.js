import db from '../config/db.js';

const TimeOff = {
    // Get all pending leave requests
    getPending: async () => {
        const [rows] = await db.query(`
            SELECT l.*, e.first_name, e.last_name 
            FROM leave_requests l
            JOIN employees e ON l.employee_id = e.id
            WHERE l.status = 'Pending'
            ORDER BY l.start_date ASC
        `);
        return rows;
    },

    // Get all leave requests (for review)
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT l.*, e.first_name, e.last_name 
            FROM leave_requests l
            JOIN employees e ON l.employee_id = e.id
            ORDER BY l.start_date DESC
        `);
        return rows;
    },

    // Approve a leave request
    approve: async (id) => {
        const [result] = await db.query(
            'UPDATE leave_requests SET status = "Approved" WHERE id = ?',
            [id]
        );
        return result;
    },

    // Deny a leave request
    deny: async (id) => {
        const [result] = await db.query(
            'UPDATE leave_requests SET status = "Denied" WHERE id = ?',
            [id]
        );
        return result;
    },

    // Create a new leave request
    create: async (employeeId, type, startDate, endDate) => {
        const [result] = await db.query(
            `INSERT INTO leave_requests (employee_id, type, start_date, end_date, status) 
             VALUES (?, ?, ?, ?, 'Pending')`,
            [employeeId, type, startDate, endDate]
        );
        return result;
    }
};

export default TimeOff;