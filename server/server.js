import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js'; 

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
console.log('Auth routes registered at /api/auth');  

console.log('ABOUT TO REGISTER AUTH ROUTES'); 
app.use('/api/auth', authRoutes);
console.log('AUTH ROUTES REGISTERED');

// Test route (public)
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});