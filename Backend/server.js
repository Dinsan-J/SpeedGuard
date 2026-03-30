const path = require("path");
const dns = require("dns");
// Reduce flaky `querySrv ENOTFOUND` on Windows/Node when resolving Atlas SRV records.
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: path.join(__dirname, ".env") });
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

// MongoDB connection (trim URI; allow MONGODB_URI alias)
const mongoUri = (
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  ""
).trim();
if (!mongoUri) {
  console.error("❌ MONGO_URI is not set in Backend/.env");
}
mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 20000,
    family: 4,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err.message || err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/vehicle", require("./routes/vehicle"));
app.use("/api/violation", require("./routes/violation"));
app.use("/api/iot", require("./routes/iot")); // IoT device routes
app.use("/api/sensitive-locations", require("./routes/sensitiveLocation")); // Geofencing routes
app.use("/api/police", require("./routes/police")); // Police dashboard routes
app.use("/api/merit-points", require("./routes/meritPoint")); // Merit point system routes
app.use("/data", require("./routes/violationData")); // ESP32 POST
app.use("/api", mlRoutes);

// 🔹 Socket.IO for live speed
io.on("connection", (socket) => {
  console.log("🔵 Client connected for live speed");
});

// Make io accessible in routes
app.set("socketio", io);

// Start server
const PORT = process.env.PORT || 8080;

// Serve frontend in production
app.use(express.static(path.join(__dirname, "public")));

// Handle SPA routing - Express 5 compatible wildcard (Regex object)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Listen on all interfaces so phones/ESP32 on LAN can reach this PC (not only 127.0.0.1).
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`)
);
