import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import timeOffRoutes from './routes/timeOffRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import performanceReviewRoutes from './routes/performanceReviewRoutes.js';

// Performance review routes
import performanceReviewRoutes from './routes/performanceReviewRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/performanceReviews', performanceReviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timeoff', timeOffRoutes);
app.use('/api/performance-reviews', performanceReviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
console.log('Dashboard routes loaded!');

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Routes registered:');
    console.log(` Server running on port ${port}`);
    console.log(' Routes registered:');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/employees');
    console.log('   GET  /api/performanceReviews');
    console.log('   GET  /api/attendance');
    console.log('   GET  /api/timeoff/pending');
    console.log('   GET  /api/employees');
    console.log('   GET  /api/performance-reviews');
    console.log('   GET  /api/dashboard');
});