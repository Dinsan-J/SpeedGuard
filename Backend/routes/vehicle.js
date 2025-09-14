const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

// Add vehicle
router.post("/add", async (req, res) => {
  console.log("Add vehicle route called", req.body);
  try {
    const { userId, vehicleData } = req.body;
    const vehicle = new Vehicle({ ...vehicleData, owner: userId });
    await vehicle.save();
    await User.findByIdAndUpdate(userId, { $push: { vehicles: vehicle._id } });
    res.json({ success: true, vehicle });
  } catch (err) {
    console.log("Add vehicle error:", err);
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
    console.error("Delete vehicle error:", err);
    res.status(500).json({ success: false, message: "Error deleting vehicle" });
  }
});

// Get user vehicles
router.get("/user/:userId", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.params.userId });
    res.json({ success: true, vehicles });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching vehicles" });
  }
});

// Add this route at the bottom or with other GET routes
router.get("/plate/:plateNumber", async (req, res) => {
  try {
    const { plateNumber } = req.params;

    // Find vehicle by plateNumber and populate violations
    const vehicle = await Vehicle.findOne({ plateNumber }).populate({
      path: "violations", // Make sure this is the field name in Vehicle model
      options: { sort: { timestamp: -1 } }, // latest first
    });

    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }

    res.json({ success: true, vehicle });
  } catch (err) {
    console.error("Error fetching vehicle by plate:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
