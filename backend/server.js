import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import speedLogRoutes from "./routes/speedLogRoutes.js";
import fineRoutes from "./routes/fineRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

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
