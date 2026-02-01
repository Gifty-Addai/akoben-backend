import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserById,
  verifyEmail,
  sendOTPEnd,
  resetPassword,
  confirmMembership,
  verifyOTPEnd
} from '../controllers/user.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import { verifyAccessToken } from '../middlewares/verify-token.middleware.js';

const router = express.Router();

// Public Routes
router.post('/verify-email', verifyEmail);
router.post('/reset-password', resetPassword);
router.post('/sendOTP', sendOTPEnd);
router.post('/verifyOTP', verifyOTPEnd);

// Authenticated User Routes
router.use(authenticate); // Apply authentication to all routes below

router.get('/getUserProfile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/confirmMembership', confirmMembership);
router.get('/', getAllUsers);

router.get('/:id', getUserById);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUser);

export default router;
