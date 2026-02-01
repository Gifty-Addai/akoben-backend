import express from 'express';
import {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
} from '../controllers/order.controller.js';
import { verifyAccessToken } from '../middlewares/verify-token.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Public/User Routes (Protected by Auth)
router.post('/', verifyAccessToken, createOrder);
router.get('/my-orders', verifyAccessToken, getUserOrders);

// Admin Routes
router.get('/admin', verifyAccessToken, authorize('admin'), getAllOrders);
router.patch('/:id/status', verifyAccessToken, authorize('admin'), updateOrderStatus);

export default router;
