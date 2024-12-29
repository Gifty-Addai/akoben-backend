import express from 'express';
import { sendBookingMail } from '../controllers/mailing.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';

const router = express.Router();


router.post('/bookingMail', authenticate, authorize("admin"), sendBookingMail);

export default router;