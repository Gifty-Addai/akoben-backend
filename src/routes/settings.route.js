import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { verifyAccessToken } from '../middlewares/verify-token.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';

const router = express.Router();

// GET is public so frontend can retrieve phone, email, and promo banner
router.get('/', getSettings);

// PUT is protected so only admins can modify setting variables
router.put('/', verifyAccessToken, authorize('admin'), updateSettings);

export default router;
