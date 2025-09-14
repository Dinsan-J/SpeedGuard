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

// ✅ Get vehicle by plate number
router.get("/plate/:plateNumber", async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      plateNumber: req.params.plateNumber,
    }).populate("violations"); // make sure violations is referenced in Vehicle schema

    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }

    res.json({ success: true, vehicle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
