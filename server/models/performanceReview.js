import pool from '../config/db.js';

// PERFORMANCE REVIEWS MODEL
// Handles all database operations for performance reviews.

// Get all performance reviews
export const findAll = async () => {
    const [rows] = await pool.query(`
        SELECT
            id,
            employee_id,
            reviewer,
            rating,
            feedback
        FROM performance_reviews
        ORDER BY id
    `);

    return rows;
};

// Get one performance review by ID
export const findById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            id,
            employee_id,
            reviewer,
            rating,
            feedback
        FROM performance_reviews
        WHERE id = ?
    `, [id]);

    return rows[0];
};

// Create a performance review
export const create = async (review) => {
    const {
        employee_id,
        reviewer,
        rating,
        feedback
    } = review;

    const [result] = await pool.query(`
        INSERT INTO performance_reviews
        (employee_id, reviewer, rating, feedback)
        VALUES (?, ?, ?, ?)
    `, [
        employee_id,
        reviewer,
        rating,
        feedback
    ]);

    return result.insertId;
};

// Update a performance review
export const update = async (id, review) => {
    const {
        employee_id,
        reviewer,
        rating,
        feedback
    } = review;

    const [result] = await pool.query(`
        UPDATE performance_reviews
        SET
            employee_id = ?,
            reviewer = ?,
            rating = ?,
            feedback = ?
        WHERE id = ?
    `, [
        employee_id,
        reviewer,
        rating,
        feedback,
        id
    ]);

    return result.affectedRows;
};

// Delete a performance review
export const remove = async (id) => {
    const [result] = await pool.query(`
        DELETE FROM performance_reviews
        WHERE id = ?
    `, [id]);

    return result.affectedRows;
};