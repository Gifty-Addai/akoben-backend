import express from 'express';
import { signup, signin, logout } from '../controllers/auth.controller.js'; 

const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/login', signin);
router.post('/logout', logout);

export default router;
