import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserById,
  verifyEmail,
  resetPassword,
  confirmMembership
} from '../controllers/user.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public Routes
router.post('/verify-email', verifyEmail);
router.post('/reset-password', resetPassword);

// Authenticated User Routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/confirmMembership', confirmMembership);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUser);

export default router;
