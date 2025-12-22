const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Violation = require("../models/Violation");

// Add vehicle
router.post("/add", async (req, res) => {
  try {
    const { userId, vehicleData } = req.body;
    
    // Find the user and their driver profile
    const user = await User.findById(userId).populate('driverProfile');
    if (!user || user.role !== 'driver' || !user.driverProfile) {
      return res.status(400).json({ 
        success: false, 
        message: "User must be a driver with a valid profile to add vehicles" 
      });
    }
    
    // Check if vehicle number already exists
    if (vehicleData.vehicleNumber) {
      const existingVehicle = await Vehicle.findOne({ 
        vehicleNumber: vehicleData.vehicleNumber.toUpperCase() 
      });
      if (existingVehicle) {
        return res.status(400).json({ 
          success: false, 
          message: "Vehicle with this number already exists" 
        });
      }
    }
    
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
    
    // Create vehicle with proper driver reference
    const vehicle = new Vehicle({ 
      ...vehicleData, 
      driverId: user.driverProfile._id,
      vehicleNumber: vehicleData.vehicleNumber.toUpperCase()
    });
    
    await vehicle.save();
    
    console.log(`✅ Vehicle added: ${vehicle.vehicleNumber} (${vehicle.vehicleType}) - Speed Limit: ${vehicle.speedLimit} km/h`);
    
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
    // Find the user and their driver profile
    const user = await User.findById(req.params.userId).populate('driverProfile');
    if (!user || user.role !== 'driver' || !user.driverProfile) {
      return res.json({ success: true, vehicles: [] });
    }
    
    // Find vehicles by driver ID
    const vehicles = await Vehicle.find({ driverId: user.driverProfile._id });
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

// Get active IoT vehicles for officer dashboard
router.get("/active-iot-vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ 
      iotDeviceId: { $exists: true, $ne: null },
      status: "active"
    })
    .populate('owner', 'username')
    .select('plateNumber vehicleType currentSpeed currentLocation lastUpdated iotDeviceId status owner')
    .sort({ lastUpdated: -1 });

    // Add speed limits based on vehicle type
    const vehiclesWithLimits = vehicles.map(vehicle => ({
      ...vehicle.toObject(),
      speedLimit: vehicle.getSpeedLimit()
    }));

    res.json(vehiclesWithLimits);
  } catch (err) {
    console.error("Get active IoT vehicles error:", err);
    res.status(500).json({ success: false, message: "Error fetching active vehicles" });
  }
});

module.exports = router;
