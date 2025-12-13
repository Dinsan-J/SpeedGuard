require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http"); // <-- Needed for socket.io
const { Server } = require("socket.io");
const mlRoutes = require("./routes/predict");

const app = express();
const server = http.createServer(app); // wrap express with http
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080", "https://speedguard-zeta.vercel.app"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ["http://localhost:8080", "https://speedguard-zeta.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/vehicle", require("./routes/vehicle"));
app.use("/api/violation", require("./routes/violation"));
app.use("/api/iot", require("./routes/iot")); // IoT device routes
app.use("/api/sensitive-locations", require("./routes/sensitiveLocation")); // Geofencing routes
app.use("/data", require("./routes/violationData")); // ESP32 POST
app.use("/api", mlRoutes);

// 🔹 Socket.IO for live speed
io.on("connection", (socket) => {
  console.log("🔵 Client connected for live speed");
});

// Make io accessible in routes
app.set("socketio", io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
