import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';


export const getUserProfile = async (req, res, next) => {
    const { id } = req.user; // Assume `req.user` is set by authentication middleware
  
    try {
      const user = await User.findById(id).populate('bookings', 'campsite campingDate');
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
  

  export const updateUserProfile = async (req, res, next) => {
    const { id } = req.user;
    const { name, phone, address, preferences } = req.body;
  
    try {
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      if (preferences) user.preferences = preferences;
  
      await user.save();
      res.status(200).json({ message: "Profile updated successfully.", user });
    } catch (error) {
      next(error);
    }
  };

  
  export const deleteUser = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const user = await User.findByIdAndDelete(id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      next(error);
    }
  };

  export const getAllUsers = async (req, res, next) => {
    try {
      const users = await User.find().select('-password');
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };
  

  export const getUserById = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const user = await User.findById(id).select('-password');
  
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  
  export const updateUserById = async (req, res, next) => {
    const { id } = req.params;
    const { name, phone, address, role } = req.body;
  
    try {
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      if (role) user.role = role;
  
      await user.save();
      res.status(200).json({ message: "User updated successfully.", user });
    } catch (error) {
      next(error);
    }
  };

  
  export const verifyEmail = async (req, res, next) => {
    const { otp, email } = req.body;
  
    try {
      const user = await User.findOne({ email, otp });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid OTP or email." });
      }
  
      user.isEmailConfirmed = true;
      user.otp = null; // Clear OTP after successful verification
  
      await user.save();
      res.status(200).json({ message: "Email verified successfully!" });
    } catch (error) {
      next(error);
    }
  };

  

export const resetPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    next(error);
  }
};
