const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

// Receive data from ESP32
router.post("/", async (req, res) => {
  try {
    const { vehicleId, location, speed, timestamp } = req.body;

    // Store in MongoDB only if speed > limit (optional)
    const newViolation = new Violation({
      vehicleId,
      location,
      speed,
      timestamp,
      status: "pending",
    });
    await newViolation.save();

    // Send live speed to frontend via WebSocket
    const io = req.app.get("socketio");
    io.emit("live-speed", { vehicleId, speed, timestamp, location });

    res
      .status(200)
      .json({ success: true, message: "Data saved and live speed sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
