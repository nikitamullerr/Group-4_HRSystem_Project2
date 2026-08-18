import TimeOff from '../models/timeoff.js';

export const getPendingLeaves = async (req, res) => {
    try {
        const pending = await TimeOff.getPending();
        res.json(pending);
    } catch (err) {
        console.error('Error fetching pending leaves:', err);
        res.status(500).json({ error: 'Failed to fetch pending leave requests' });
    }
};

export const getAllLeaves = async (req, res) => {
    try {
        const leaves = await TimeOff.getAll();
        res.json(leaves);
    } catch (err) {
        console.error('Error fetching leaves:', err);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
};

export const approveLeave = async (req, res) => {
    const { id } = req.params;
    
    try {
        await TimeOff.approve(id);
        res.json({ message: 'Leave request approved successfully' });
    } catch (err) {
        console.error('Error approving leave:', err);
        res.status(500).json({ error: 'Failed to approve leave request' });
    }
};

export const denyLeave = async (req, res) => {
    const { id } = req.params;
    
    try {
        await TimeOff.deny(id);
        res.json({ message: 'Leave request denied successfully' });
    } catch (err) {
        console.error('Error denying leave:', err);
        res.status(500).json({ error: 'Failed to deny leave request' });
    }
};

export const createLeave = async (req, res) => {
    const { employeeId, type, startDate, endDate } = req.body;
    
    if (!employeeId || !type || !startDate || !endDate) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await TimeOff.create(employeeId, type, startDate, endDate);
        res.status(201).json({ message: 'Leave request created successfully', result });
    } catch (err) {
        console.error('Error creating leave:', err);
        res.status(500).json({ error: 'Failed to create leave request' });
    }
};