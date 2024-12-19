import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
// import Joi from 'joi'; // Uncomment if using Joi for validation

// Optional: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* Optional: Example Joi schema for update requests
const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  preferences: Joi.object().optional(),
  role: Joi.string().valid('user', 'admin').optional(),
});
*/

// Get User Profile
export const getUserProfile = async (req, res, next) => {
  const { id } = req.user; // Assume `req.user` is set by authentication middleware

  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id)
      .select('-password') // Always exclude password
      .populate('bookings', 'campsite campingDate');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm Membership
export const confirmMembership = async (req, res, next) => {
  const { name, email, phone } = req.body;

  console.log(req.body)

  // Validate required fields
  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and phone are required.",
    });
  }

  try {
    const user = await User.findOne({ name, email, phone });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "No user found with the provided details.",
      });
    }

    if (!user.isMember) {
      return res.status(200).json({
        success: false,
        message: "User found but is not a member.",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    }

    // Optional: Check membership validity (if nextRenewalDate is used)
    const today = new Date();
    if (user.nextRenewalDate && user.nextRenewalDate < today) {
      return res.status(200).json({
        success: false,
        message: "User is a member, but their membership has expired.",
        membershipExpired: true,
        renewalDate: user.nextRenewalDate,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User is an active member.",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        nextRenewalDate: user.nextRenewalDate,
      },
    });

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
