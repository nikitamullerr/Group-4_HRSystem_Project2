import express from 'express';
import { authenticate } from '../middleware/auth.js';

import {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
} from '../controllers/performanceReviewController.js';

const router = express.Router();

// ==================================================
// PERFORMANCE REVIEW ROUTES
// All routes are protected by authentication.
// ==================================================

router.get('/', authenticate, getAllReviews);

router.get('/:id', authenticate, getReviewById);

router.post('/', authenticate, createReview);

router.put('/:id', authenticate, updateReview);

router.delete('/:id', authenticate, deleteReview);

export default router;
