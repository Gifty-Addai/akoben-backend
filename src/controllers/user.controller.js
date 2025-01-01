import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { checkTempUser } from '../services/user-temp.service.js';
import ApiResponse from '../lib/api-reponse.util.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get User Profile
export const getUserProfile = async (req, res, next) => {
  const token = req.cookies["jwtRefreshToken"];

  if (!token) {
    return ApiResponse.sendError(res, 'No session of user found', 403);
  }

  console.log("token",token)

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const id = decoded.userId;

    if (!isValidObjectId(id)) {
      return ApiResponse.sendError(res, "Invalid user ID.", 400);
    }

    const user = await User.findById(id)
      .select('-password')
      .populate('bookings', 'campsite campingDate');

    if (!user) {
      return ApiResponse.sendError(res, "User not found.", 404);
    }

    return ApiResponse.sendSuccess(res, "User profile fetched successfully.", user, 200);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return ApiResponse.sendError(res, "Unable to retrieve user session.", 403);
    }
    next(error);
  }
};

// Confirm Membership
export const confirmMembership = async (req, res, next) => {
  const { name, email, phone } = req.body;

  console.log(req.body)

  // Validate required fields
  if (!name || !email || !phone) {
    return ApiResponse.sendError(res, "Name, email, and phone are required.", 400)
  }

  try {
    const user = await checkTempUser(
      name,
      phone,
      email
    );

    if (!user) {
      return ApiResponse.sendError(res, "Unable to use user details", 400)
    }

    if (!user.isMember) {
      return ApiResponse.sendSuccess(res, "User found but is not a member.", {
        name: user.name,
        email: user.email,
        phone: user.phone,
        isMember: user.isMember,
        membershipExpired: true,
      }, 200)

    }

    // Optional: Check membership validity (if nextRenewalDate is used)
    const today = new Date();
    if (user.nextRenewalDate && user.nextRenewalDate < today) {
      return ApiResponse.sendSuccess(res, "User is a member, but their membership has expired.", {
        name: user.name,
        email: user.email,
        phone: user.phone,
        isMember: user.isMember,
        membershipExpired: true,
      }, 200)
    }

    return ApiResponse.sendSuccess(res, "User is an active member.", {
      name: user.name,
      email: user.email,
      phone: user.phone,
      isMember: user.isMember,
      membershipExpired: false,
    }, 200)

  } catch (error) {
    next(error);
  }
};

// Update User Profile (for the logged-in user)
export const updateUserProfile = async (req, res, next) => {
  const { id } = req.user;
  const { name, phone, address, preferences } = req.body;

  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (preferences) user.preferences = preferences;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a User by ID (Admin only, presumably)
export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Get All Users (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    // Optionally implement pagination and filtering
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      message: "All users retrieved successfully.",
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get a User by ID (Admin or maybe the user themselves)
export const getUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update a User by ID (Admin)
export const updateUserById = async (req, res, next) => {
  const { id } = req.params;
  const { name, phone, address, role } = req.body;

  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Optional: Validate body with Joi
    // const { error } = updateUserSchema.validate(req.body);
    // if (error) {
    //   return res.status(400).json({ success: false, message: error.message });
    // }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify Email
export const verifyEmail = async (req, res, next) => {
  const { otp, email } = req.body;

  if (!otp || !email) {
    return res.status(400).json({
      success: false,
      message: "OTP and email are required.",
    });
  }

  try {
    const user = await User.findOne({ email, otp });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or email.",
      });
    }

    user.isEmailConfirmed = true;
    user.otp = null; // Clear OTP after successful verification
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      user: {
        name: user.name,
        email: user.email,
        isEmailConfirmed: user.isEmailConfirmed,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Valid email and a password of at least 6 characters are required.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    next(error);
  }
};
