import pool from '../config/db.js';

// Get all employees
export const findAll = async () => {
    const [rows] = await pool.query(`
        SELECT
            e.id,
            e.first_name,
            e.last_name,
            e.email,
            e.department_id,
            d.name AS department,
            e.position,
            e.role,
            e.created_at
        FROM employees e
        LEFT JOIN departments d
            ON e.department_id = d.id
        ORDER BY e.id
    `);

    return rows;
};

// Get one employee by ID
export const findById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            e.id,
            e.first_name,
            e.last_name,
            e.email,
            e.department_id,
            d.name AS department,
            e.position,
            e.role,
            e.created_at
        FROM employees e
        LEFT JOIN departments d
            ON e.department_id = d.id
        WHERE e.id = ?
    `, [id]);

    return rows[0];
};

// Create a new employee
export const create = async (employee) => {
    const {
        first_name,
        last_name,
        email,
        department_id,
        position,
        password_hash,
        role
    } = employee;

    const [result] = await pool.query(`
        INSERT INTO employees
        (first_name, last_name, email, department_id, position, password_hash, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        first_name,
        last_name,
        email,
        department_id,
        position,
        password_hash,
        role
    ]);

    return result.insertId;
};

// Update an existing employee
export const update = async (id, employee) => {
    const {
        first_name,
        last_name,
        email,
        department_id,
        position,
        role
    } = employee;

    const [result] = await pool.query(`
        UPDATE employees
        SET
            first_name = ?,
            last_name = ?,
            email = ?,
            department_id = ?,
            position = ?,
            role = ?
        WHERE id = ?
    `, [
        first_name,
        last_name,
        email,
        department_id,
        position,
        role,
        id
    ]);

    return result.affectedRows;
};

// Delete an employee
export const remove = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM employees WHERE id = ?',
        [id]
    );

    return result.affectedRows;
};