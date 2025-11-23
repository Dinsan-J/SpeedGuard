const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Violation = require("../models/Violation");
const { verifyToken } = require("../middleware/auth");

// Add vehicle - Protected route
router.post("/add", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const vehicleData = req.body;
    
    // Check if IoT device ID is already in use
    if (vehicleData.iotDeviceId) {
      const existingVehicle = await Vehicle.findOne({ iotDeviceId: vehicleData.iotDeviceId });
      if (existingVehicle) {
        return res.status(400).json({ 
          success: false, 
          message: "This IoT device is already assigned to another vehicle" 
        });
      }
    }
    
    const vehicle = new Vehicle({ ...vehicleData, owner: userId });
    await vehicle.save();
    
    // Update user's vehicles array (initialize if doesn't exist)
    await User.findByIdAndUpdate(
      userId, 
      { $addToSet: { vehicles: vehicle._id } }, // $addToSet prevents duplicates and creates array if needed
      { upsert: false }
    );
    
    res.json({ success: true, vehicle });
  } catch (err) {
    console.error("Add vehicle error:", err);
    res.status(500).json({ success: false, message: err.message || "Error adding vehicle" });
  }
});

// Delete vehicle - Protected route
router.delete("/delete/:vehicleId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const { vehicleId } = req.params;
    
    // Verify vehicle belongs to user
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    if (vehicle.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    
    await Vehicle.findByIdAndDelete(vehicleId);
    await User.findByIdAndUpdate(userId, { $pull: { vehicles: vehicleId } });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete vehicle error:", err);
    res.status(500).json({ success: false, message: "Error deleting vehicle" });
  }
});

// Get user vehicles - Protected route
router.get("/my-vehicles", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const vehicles = await Vehicle.find({ owner: userId });
    res.json({ success: true, vehicles });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching vehicles" });
  }
});

// Add violation to vehicle
router.post("/violation/:plateNumber", async (req, res) => {
  try {
    const { plateNumber } = req.params;
    const violationData = req.body;

    const vehicle = await Vehicle.findOne({ plateNumber });
    if (!vehicle)
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });

    const violation = new Violation({
      ...violationData,
      vehicleId: vehicle._id,
    });
    await violation.save();

    vehicle.violations.push(violation._id);
    vehicle.lastViolation = violation.timestamp;
    await vehicle.save();

    res.json({ success: true, violation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get vehicle by plate + violations
router.get("/plate/:plateNumber", async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      plateNumber: req.params.plateNumber,
    });
    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }
    // Fetch violations for this vehicle
    const violations = await Violation.find({ vehicleId: vehicle.plateNumber });
    
    // Calculate fine for each violation
    const violationsWithFines = violations.map(v => {
      const speedLimit = 70;
      const speedExcess = v.speed - speedLimit;
      const calculatedFine = 1500 + Math.floor(speedExcess / 5) * 300;
      return {
        ...v.toObject(),
        fine: calculatedFine
      };
    });
    
    res.json({ success: true, vehicle: { ...vehicle.toObject(), violations: violationsWithFines } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get vehicle by ID + violations
router.get("/:vehicleId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId).populate(
      "violations"
    );
    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }
    res.json({ success: true, vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
