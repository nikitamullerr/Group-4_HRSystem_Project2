import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows your server to read JSON data from requests

// A simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// TODO: Import and use your route files here
// app.use('/api/employees', employeeRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});