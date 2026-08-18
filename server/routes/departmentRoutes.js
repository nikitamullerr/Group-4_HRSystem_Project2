import express from 'express';
import { 
    getAllDepartments, 
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} from '../controllers/departmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All department routes require authentication
router.get('/', authenticate, getAllDepartments);
router.get('/:id', authenticate, getDepartmentById);
router.post('/', authenticate, createDepartment);
router.put('/:id', authenticate, updateDepartment);
router.delete('/:id', authenticate, deleteDepartment);

export default router;