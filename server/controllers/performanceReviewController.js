import {
    findAll,
    findById,
    create,
    update,
    remove
} from '../models/performanceReview.js';

// PERFORMANCE REVIEW CONTROLLERS
// Handles HTTP requests for performance reviews.

// Get all performance reviews
export const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await findAll();

        res.status(200).json(reviews);
    } catch (err) {
        next(err);
    }
};

// Get one performance review by ID
export const getReviewById = async (req, res, next) => {
    try {
        const review = await findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                error: 'Performance review not found'
            });
        }

        res.status(200).json(review);
    } catch (err) {
        next(err);
    }
};

// Create a performance review
export const createReview = async (req, res, next) => {
    try {
        const {
            employee_id,
            reviewer,
            rating,
            feedback
        } = req.body;

        // VALIDATION
        // Employee, reviewer and rating are required.
        if (!employee_id || !reviewer || !rating) {
            return res.status(400).json({
                error: 'Employee, reviewer and rating are required'
            });
        }

        const id = await create({
            employee_id,
            reviewer,
            rating,
            feedback
        });

        res.status(201).json({
            message: 'Performance review created successfully',
            id
        });
    } catch (err) {
        next(err);
    }
};

// Update a performance review
export const updateReview = async (req, res, next) => {
    try {
        const affectedRows = await update(
            req.params.id,
            req.body
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                error: 'Performance review not found'
            });
        }

        res.status(200).json({
            message: 'Performance review updated successfully'
        });
    } catch (err) {
        next(err);
    }
};

// Delete a performance review
export const deleteReview = async (req, res, next) => {
    try {
        const affectedRows = await remove(req.params.id);

        if (affectedRows === 0) {
            return res.status(404).json({
                error: 'Performance review not found'
            });
        }

        res.status(200).json({
            message: 'Performance review deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};