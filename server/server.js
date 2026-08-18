import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';  // ← ADD THIS
import attendanceRoutes from './routes/attendanceRoutes.js';
import timeOffRoutes from './routes/timeOffRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';

// Performance review routes
import performanceReviewRoutes from './routes/performanceReviewRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);  // ← ADD THIS
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timeoff', timeOffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/performance-reviews', performanceReviewRoutes);
app.use('/api/payroll', payrollRoutes);

// ============================================
// TEST ROUTE
// ============================================
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// ============================================
// START SERVER
// ============================================
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log('\n📋 Registered Routes:');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/employees');
    console.log('   GET  /api/departments');       // ← NOW REGISTERED
    console.log('   POST /api/departments');       // ← CREATE
    console.log('   PUT  /api/departments/:id');   // ← UPDATE
    console.log('   DELETE /api/departments/:id'); // ← DELETE
    console.log('   GET  /api/attendance');
    console.log('   GET  /api/timeoff/pending');
    console.log('   GET  /api/dashboard/summary');
});