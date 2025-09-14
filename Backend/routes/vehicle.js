const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Violation = require("../models/Violation");

// Add vehicle
router.post("/add", async (req, res) => {
  try {
    const { userId, vehicleData } = req.body;

    const vehicle = new Vehicle({ ...vehicleData, owner: userId });
    await vehicle.save();

    await User.findByIdAndUpdate(userId, { $push: { vehicles: vehicle._id } });

    res.json({ success: true, vehicle });
  } catch (err) {
    console.error("Add vehicle error:", err);
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

    // Also remove all violations of this vehicle
    await Violation.deleteMany({ vehicle: vehicleId });

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
    console.error("Get user vehicles error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching vehicles" });
  }
});

// Get vehicle by plate number (with violations)
router.get("/plate/:plateNumber", async (req, res) => {
  try {
    const { plateNumber } = req.params;

    const vehicle = await Vehicle.findOne({ plateNumber }).populate({
      path: "violations",
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
