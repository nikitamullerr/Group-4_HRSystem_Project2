import db from '../config/db.js';

// GET - Get all departments with employee counts
export const getAllDepartments = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                d.id,
                d.name,
                COUNT(e.id) AS employeeCount
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            GROUP BY d.id, d.name
            ORDER BY d.name ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

// GET - Get single department by ID
export const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT 
                d.id,
                d.name,
                COUNT(e.id) AS employeeCount
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            WHERE d.id = ?
            GROUP BY d.id, d.name
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ error: 'Failed to fetch department' });
    }
};

// POST - Create new department
export const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        // Check if department already exists
        const [existing] = await db.query(
            'SELECT id FROM departments WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Department already exists' });
        }

        // Insert new department
        const [result] = await db.query(
            'INSERT INTO departments (name) VALUES (?)',
            [name]
        );

        // Get the newly created department
        const [newDepartment] = await db.query(
            'SELECT * FROM departments WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newDepartment[0]);
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ error: 'Failed to create department' });
    }
};

// PUT - Update department
export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        // Check if department exists
        const [existing] = await db.query(
            'SELECT * FROM departments WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        // Check if name already exists (excluding current department)
        const [duplicate] = await db.query(
            'SELECT id FROM departments WHERE name = ? AND id != ?',
            [name, id]
        );

        if (duplicate.length > 0) {
            return res.status(400).json({ error: 'Department name already exists' });
        }

        // Update department
        await db.query(
            'UPDATE departments SET name = ? WHERE id = ?',
            [name, id]
        );

        // Get updated department
        const [updated] = await db.query(
            'SELECT * FROM departments WHERE id = ?',
            [id]
        );

        res.json(updated[0]);
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ error: 'Failed to update department' });
    }
};

// DELETE - Delete department
export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if department exists
        const [existing] = await db.query(
            'SELECT * FROM departments WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        // Check if department has employees
        const [employees] = await db.query(
            'SELECT COUNT(*) AS count FROM employees WHERE department_id = ?',
            [id]
        );

        if (employees[0].count > 0) {
            return res.status(400).json({ 
                error: `Cannot delete department with ${employees[0].count} employees. Reassign employees first.` 
            });
        }

        // Delete department
        await db.query(
            'DELETE FROM departments WHERE id = ?',
            [id]
        );

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ error: 'Failed to delete department' });
    }
};