import Attendance from '../models/attendance.js';

export const getAttendance = async (req, res) => {
    try {
        const startDate = req.query.startDate || '2025-07-25';
        const endDate = req.query.endDate || '2025-07-29';
        
        const records = await Attendance.getByDateRange(startDate, endDate);
        res.json(records);
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
};

export const getAttendanceSummary = async (req, res) => {
    try {
        const startDate = req.query.startDate || '2025-07-25';
        const endDate = req.query.endDate || '2025-07-29';
        
        const summary = await Attendance.getSummary(startDate, endDate);
        res.json(summary);
    } catch (err) {
        console.error('Error fetching attendance summary:', err);
        res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }
};

export const markAttendance = async (req, res) => {
    const { employeeId, date, status } = req.body;
    
    if (!employeeId || !date || !status) {
        return res.status(400).json({ error: 'employeeId, date, and status are required' });
    }

    try {
        const result = await Attendance.createOrUpdate(employeeId, date, status);
        res.json({ message: 'Attendance recorded successfully', result });
    } catch (err) {
        console.error('Error marking attendance:', err);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
};