const jwt = require("jsonwebtoken");

// Middleware to verify JWT token and extract user info
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token, authorization denied" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: userId, role: userRole }
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false, 
      message: "Token is not valid" 
    });
  }
};

// Middleware to check if user is authenticated (returns user info without blocking)
exports.getUser = (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (err) {
    next();
  }
};
