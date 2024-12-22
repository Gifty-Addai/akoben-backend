import express from 'express';
import { signup, signin, logout,initializePayment,genVerifyPayment,verifyBookingPayment } from '../controllers/auth.controller.js'; 

const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/login', signin);
router.post('/logout', logout);
router.post('/payment',initializePayment)
router.get('/verifypayment/:reference',genVerifyPayment)
router.get('/verifyBookingPayment/:reference',verifyBookingPayment)

export default router;
