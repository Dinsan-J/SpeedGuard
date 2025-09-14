const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Violation = require("../models/Violation");

// ------------------- Add Vehicle -------------------
router.post("/add", async (req, res) => {
  console.log("Add vehicle route called", req.body);
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

// ------------------- Delete Vehicle -------------------
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

// ------------------- Get User Vehicles -------------------
router.get("/user/:userId", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.params.userId });
    res.json({ success: true, vehicles });
  } catch (err) {
    console.error("Fetch vehicles error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching vehicles" });
  }
});

// ------------------- Get Vehicle by Plate -------------------
router.get("/plate/:plateNumber", async (req, res) => {
  try {
    const { plateNumber } = req.params;

    const vehicle = await Vehicle.findOne({ plateNumber }).populate({
      path: "violations",
      options: { sort: { timestamp: -1 } }, // latest violations first
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

// ------------------- Add Violation -------------------
router.post("/violation/:vehicleId", async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const violationData = req.body;

    const violation = new Violation({ ...violationData, vehicleId });
    await violation.save();

    await Vehicle.findByIdAndUpdate(vehicleId, {
      $push: { violations: violation._id },
      lastViolation: violation.timestamp,
    });

    res.json({ success: true, violation });
  } catch (err) {
    console.error("Add violation error:", err);
    res.status(500).json({ success: false, message: "Error adding violation" });
  }
});

module.exports = router;
