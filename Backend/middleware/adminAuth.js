/**
 * Admin Authorization Middleware
 * Ensures only admin users can access admin routes
 */
const adminAuth = (req, res, next) => {
  try {
    // Check if user is authenticated (should be done by auth middleware first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin' && req.user.role !== 'officer') {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};

module.exports = adminAuth;