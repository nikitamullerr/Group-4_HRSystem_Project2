import express from 'express';
import { 
    getPendingLeaves, 
    getAllLeaves, 
    approveLeave, 
    denyLeave,
    createLeave
} from '../controllers/timeOffController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All time-off routes require authentication
router.get('/pending', authenticate, getPendingLeaves);
router.get('/all', authenticate, getAllLeaves);
router.post('/create', authenticate, createLeave);
router.put('/:id/approve', authenticate, approveLeave);
router.put('/:id/deny', authenticate, denyLeave);

export default router;