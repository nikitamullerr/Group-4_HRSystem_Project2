import express from 'express';
import * as payrollController from '../controllers/payrollController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All payroll routes require authentication
router.get('/summary', authenticate, payrollController.getSummary);
router.get('/table', authenticate, payrollController.getTable);
router.post('/run', authenticate, payrollController.runPayroll);
router.get('/payslip/:employeeId', authenticate, payrollController.getPayslip);
router.get('/ytd/:employeeId', authenticate, payrollController.getYTD);

export default router;