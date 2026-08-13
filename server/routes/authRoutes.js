import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

console.log('Auth routes loaded!');

router.post('/login', login);

export default router;