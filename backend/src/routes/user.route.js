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
} from '../controllers/user.controller.js';

const router = express.Router();

// Public Routes
router.post('/verify-email', verifyEmail);
router.post('/reset-password', resetPassword);

// Authenticated User Routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Admin Routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUser);

export default router;
