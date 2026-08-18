import express from 'express';
import * as payrollController from '../controllers/payrollController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All payroll routes require authentication
router.get('/summary', authenticate, payrollController.getSummary);
router.get('/table', authenticate, payrollController.getTable);
router.post('/run', authenticate, payrollController.runPayroll);

// FIXED: Match frontend expectations
router.get('/payslip/:id', authenticate, payrollController.getPayslip);  // Changed :employeeId → :id
router.get('/ytd/:employeeId', authenticate, payrollController.getYTD);

// Added CRUD endpoints for frontend
router.get('/', authenticate, payrollController.getAllPayroll);  // ← ADD THIS
router.get('/month/:month', authenticate, payrollController.getPayrollByMonth);  // ← ADD THIS
router.get('/employee/:employeeId', authenticate, payrollController.getPayrollByEmployee);  // ← ADD THIS
router.post('/', authenticate, payrollController.createPayroll);  // ← ADD THIS
router.put('/:id', authenticate, payrollController.updatePayroll);  // ← ADD THIS
router.delete('/:id', authenticate, payrollController.deletePayroll);  // ← ADD THIS

export default router;