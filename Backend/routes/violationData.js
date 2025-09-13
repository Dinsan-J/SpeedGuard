// routes/violationData.js
const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

// POST data from ESP32
//ok
router.post("/", async (req, res) => {
  try {
    const { vehicleId, location, speed, timestamp } = req.body;

    const newViolation = new Violation({
      vehicleId: vehicleId || "UNKNOWN",
      location: {
        lat: location?.lat || 0,
        lng: location?.lng || 0,
      },
      speed: speed || 0,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    await newViolation.save();
    res.status(201).json({ message: "✅ Violation saved successfully" });
  } catch (err) {
    console.error("❌ Error saving violation:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
