import bcrypt from 'bcrypt';
import {
    findAll,
    findById,
    create,
    update,
    remove
} from '../models/employee.js';

// Get all employees
export const getAllEmployees = async (req, res, next) => {
    try {
        const employees = await findAll();
        res.status(200).json(employees);
    } catch (err) {
        next(err);
    }
};

// Get one employee by ID
export const getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employee = await findById(id);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (err) {
        next(err);
    }
};

// Create a new employee (with password hashing)
export const createEmployee = async (req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            email,
            department_id,
            position,
            password,        // ✅ Now accepting 'password' from the request
            role
        } = req.body;

        // Required field validation
        if (!first_name || !last_name || !email || !department_id || !password) {
            return res.status(400).json({
                error: 'First name, last name, email, department, and password are required'
            });
        }

        // Basic email validation
        if (!email.includes('@')) {
            return res.status(400).json({
                error: 'Please provide a valid email address'
            });
        }

        // Department ID validation
        if (isNaN(Number(department_id))) {
            return res.status(400).json({
                error: 'Department ID must be a number'
            });
        }

        // Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        const employeeId = await create({
            first_name,
            last_name,
            email,
            department_id,
            position,
            password_hash,      // ✅ Pass the hashed password
            role: role || 'employee'
        });

        res.status(201).json({
            message: 'Employee created successfully',
            id: employeeId
        });
    } catch (err) {
        console.error('Error creating employee:', err);
        next(err);
    }
};

// Update an existing employee
export const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            first_name,
            last_name,
            email,
            department_id,
            position,
            role
        } = req.body;

        if (!first_name || !last_name || !email || !department_id) {
            return res.status(400).json({
                error: 'First name, last name, email and department are required'
            });
        }

        if (!email.includes('@')) {
            return res.status(400).json({
                error: 'Please provide a valid email address'
            });
        }

        if (isNaN(Number(department_id))) {
            return res.status(400).json({
                error: 'Department ID must be a number'
            });
        }

        const affectedRows = await update(id, {
            first_name,
            last_name,
            email,
            department_id,
            position,
            role
        });

        if (affectedRows === 0) {
            return res.status(404).json({
                error: 'Employee not found'
            });
        }

        res.status(200).json({
            message: 'Employee updated successfully'
        });
    } catch (err) {
        next(err);
    }
};

// Delete an employee
export const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const affectedRows = await remove(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                error: 'Employee not found'
            });
        }

        res.status(200).json({
            message: 'Employee deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};