import express from 'express';
import { authenticate } from '../middleware/auth.js';

import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from '../controllers/employeeController.js';

const router = express.Router();

// Get all employees
router.get('/', authenticate, getAllEmployees);

// Get one employee
router.get('/:id', authenticate, getEmployeeById);

// Create employee
router.post('/', authenticate, createEmployee);

// Update employee
router.put('/:id', authenticate, updateEmployee);

// Delete employee
router.delete('/:id', authenticate, deleteEmployee);

export default router;