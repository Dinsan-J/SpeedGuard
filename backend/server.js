import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import speedLogRoutes from "./routes/speedLogRoutes.js";
import fineRoutes from "./routes/fineRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: "https://speedguard-theta.vercel.app", // Your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/speedlogs", speedLogRoutes);
app.use("/api/fines", fineRoutes);

// Start the server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");

  // MongoDB connection
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Error:", err));
});
