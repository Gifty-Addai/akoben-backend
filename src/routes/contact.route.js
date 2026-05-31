import express from 'express';
import {
    createContactMessage,
    getContactMessages,
    updateContactMessageStatus,
    replyContactMessage,
    deleteContactMessage
} from '../controllers/contact.controller.js';
import { verifyAccessToken } from '../middlewares/verify-token.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Public route to submit contact us message
router.post('/', createContactMessage);

// Admin protected routes
router.use(verifyAccessToken, authorize('admin'));

router.get('/', getContactMessages);
router.patch('/:id', updateContactMessageStatus);
router.post('/:id/reply', replyContactMessage);
router.delete('/:id', deleteContactMessage);

export default router;
