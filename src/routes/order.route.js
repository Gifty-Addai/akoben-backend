import express from 'express';
import {
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/order.controller.js';
import { verifyAccessToken, verifyAccessTokenOptional } from '../middlewares/verify-token.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Public/User Routes (Optional/Required Auth)
router.post('/', verifyAccessTokenOptional, createOrder);
router.get('/my-orders', verifyAccessToken, getUserOrders);

// Admin Routes
router.get('/admin', verifyAccessToken, authorize('admin'), getAllOrders);
router.get('/:id/status', verifyAccessToken, authorize('admin'), updateOrderStatus); // Keep legacy if used or fix
router.patch('/:id/status', verifyAccessToken, authorize('admin'), updateOrderStatus);
router.get('/:id', verifyAccessToken, authorize('admin'), getOrderById);

export default router;
