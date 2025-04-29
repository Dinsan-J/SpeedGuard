import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify JWT token and attach user to request
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized, no token" });
  }
};

// Middleware to allow only officers to access a route
export const officerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "officer") {
    return res.status(403).json({ message: "Access denied. Officers only." });
  }
  next();
};
