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
const allowedOrigins = [
  "https://speedguard-theta.vercel.app", // frontend prod
  "http://localhost:3000" // frontend dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'SpeedGuard backend server is running.' });
});

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
