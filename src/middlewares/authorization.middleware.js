
/**
 * Authorization Middleware to check user roles.
 *
 * @param {Array} roles - Array of roles permitted to access the route.
 * @returns {Function} - Middleware function.
 */
const authorize = (roles = []) => {
    // roles param can be a single role string (e.g., 'admin') or an array of roles (e.g., ['admin', 'user'])
    if (typeof roles === 'string') {
      roles = [roles];
    }
  
    return (req, res, next) => {
      if (!req.user) {
        return ApiResponse.sendError(res, 'User not authenticated', 401);
      }
  
      if (roles.length && !roles.includes(req.user.role)) {
        // User's role is not authorized
        return ApiResponse.sendError(res, 'Access denied: insufficient permissions', 403);
      }
  
      // User is authorized
      next();
    };
  };
  
  export default authorize;
  