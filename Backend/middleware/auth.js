const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Check for token in Authorization header first, then in cookies
  let token = req.header("Authorization")?.replace("Bearer ", "");
  
  // If no token in header, check cookies
  if (!token && req.cookies) {
    token = req.cookies.token;
  }
  
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
