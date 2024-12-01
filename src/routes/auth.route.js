import express from 'express';
import { signup, signin, logout,initializePayment,verifyPayment } from '../controllers/auth.controller.js'; 

const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/login', signin);
router.post('/logout', logout);
router.post('/payment',initializePayment)
router.post('/verifypayment',verifyPayment)

export default router;
