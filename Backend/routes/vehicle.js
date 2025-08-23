const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

// Add vehicle
router.post("/add", async (req, res) => {
  try {
    const { userId, vehicleData } = req.body;
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    await User.findByIdAndUpdate(userId, { $push: { vehicles: vehicle._id } });
    res.json({ success: true, vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding vehicle" });
  }
});

// Delete vehicle
router.delete("/delete/:vehicleId", async (req, res) => {
  try {
    const { userId } = req.body;
    const { vehicleId } = req.params;
    await Vehicle.findByIdAndDelete(vehicleId);
    await User.findByIdAndUpdate(userId, { $pull: { vehicles: vehicleId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting vehicle" });
  }
});

module.exports = router;