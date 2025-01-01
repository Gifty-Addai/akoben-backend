import express from 'express';
import { sendBookingMail } from '../controllers/mailing.controller.js';
import authorize from '../middlewares/authorization.middleware.js';
import { verifyAccessToken } from '../middlewares/verify-token.middleware.js';

const router = express.Router();


router.post('/bookingMail', verifyAccessToken, authorize("admin"), sendBookingMail);

export default router;