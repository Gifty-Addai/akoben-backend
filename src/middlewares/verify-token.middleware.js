import jwt from 'jsonwebtoken';
import ApiResponse from '../lib/api-reponse.util.js';

/**
 * Middleware to verify a valid Access Token.
 * 
 * This middleware checks if there's a token in the `Authorization` header
 * (Bearer scheme) or optionally in cookies if you prefer. It verifies the token
 * with your ACCESS_TOKEN_SECRET. If valid, attaches the decoded user info to req.user.
 * Otherwise, returns an Unauthorized error.
 */
export const verifyAccessToken = (req, res, next) => {
    try {
        // Bypass auth if in development mode
        if (process.env.NODE_ENV === 'development') {
            console.warn("⚠️ AUTHENTICATION DISABLED IN DEVELOPMENT: Mocking Admin User ⚠️");
            req.user = {
                id: 'dev-admin-id',
                role: 'admin', // Mocking admin role
                email: 'admin@example.com'
            };
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ApiResponse.sendError(res, 'Access token missing or malformed', 401);
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
            return ApiResponse.sendError(res, 'Access token expired', 401);
        }
        return ApiResponse.sendError(res, 'Invalid access token', 401);
    }
};