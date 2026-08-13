import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';  
import timeOffRoutes from './routes/timeOffRoutes.js';

console.log('🧪 attendanceRoutes type:', typeof attendanceRoutes);
console.log('🧪 attendanceRoutes value:', attendanceRoutes);

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timeoff', timeOffRoutes);

// Test route (public)
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Start server
app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log('📋 Routes registered:');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/attendance');
    console.log('   GET  /api/timeoff/pending');
});