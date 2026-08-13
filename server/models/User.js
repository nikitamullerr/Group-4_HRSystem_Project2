import db from '../config/db.js';

const User = {
    // Find a user by email
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM employees WHERE email = ?', [email]);
        return rows[0];
    }
};

export default User;