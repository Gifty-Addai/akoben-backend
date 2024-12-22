import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiResponse from '../lib/api-reponse.util.js';

// Import logger if you have one, e.g., import logger from '../lib/logger.js';

/**
 * Authentication Middleware to verify JWT tokens.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from cookies
    const token = req.cookies.jwt;

    if (!token) {
      return ApiResponse.sendError(res, 'Authentication token is missing', 401);
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Retrieve user from the token payload
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return ApiResponse.sendError(res, 'User not found', 404);
    }

    // 4. Attach user to the request object
    
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication Error:', error);

    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.sendError(res, 'Invalid authentication token', 401);
    }

    if (error.name === 'TokenExpiredError') {
      return ApiResponse.sendError(res, 'Authentication token has expired', 401);
    }
    next(error);
  }
};

export default authenticate;
