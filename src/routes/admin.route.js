import express from 'express';
import { getDashboardStats } from '../controllers/admin.controller.js';
import { verifyAccessToken } from '../middlewares/verify-token.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Protect all admin routes
router.use(verifyAccessToken, authorize('admin'));

router.get('/stats', getDashboardStats);

export default router;
