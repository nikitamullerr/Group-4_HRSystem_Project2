import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Log all environment variables (except password)
console.log('DATABASE CONFIGURATION:');
console.log('  Host:', process.env.DB_HOST || 'MISSING');
console.log('  Port:', process.env.DB_PORT || 'MISSING');
console.log('  User:', process.env.DB_USER || 'MISSING');
console.log('  Database:', process.env.DB_NAME || 'MISSING');
console.log('  Password exists:', process.env.DB_PASSWORD ? 'Yes' : 'NO');

// Validate required variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('CRITICAL: Missing database environment variables!');
    console.error('   DB_HOST:', process.env.DB_HOST ? 'Yes' : 'No');
    console.error('   DB_USER:', process.env.DB_USER ? 'Yes' : 'No');
    console.error('   DB_PASSWORD:', process.env.DB_PASSWORD ? 'Yes' : 'No');
    console.error('   DB_NAME:', process.env.DB_NAME ? 'Yes' : 'No');
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection immediately
(async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully!');
        connection.release();
    } catch (err) {
        console.error('Database connection FAILED:', err.message);
        console.error('   Error code:', err.code);
        console.error('   Error number:', err.errno);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('The password or username is incorrect. Check DB_USER and DB_PASSWORD.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('The database name is incorrect. Check DB_NAME.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('The host or port is incorrect. Check DB_HOST and DB_PORT.');
        }
    }
})();

export default pool;