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
      vehicleNumber: vehicleData.vehicleNumber.toUpperCase(),
      registrationDate: new Date(),
      // Set default expiry dates if not provided
      registrationExpiry: vehicleData.registrationExpiry ? new Date(vehicleData.registrationExpiry) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      insuranceExpiry: vehicleData.insuranceExpiry ? new Date(vehicleData.insuranceExpiry) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
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

// Check if device exists
router.get("/check-device/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // Check if vehicle with this device ID exists
    const vehicle = await Vehicle.findOne({ iotDeviceId: deviceId });
    
    res.json({ 
      success: true, 
      exists: !!vehicle,
      vehicle: vehicle ? {
        id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color
      } : null
    });
  } catch (err) {
    console.error("Check device error:", err);
    res.status(500).json({ success: false, message: "Error checking device" });
  }
});

// Connect existing vehicle to user
router.post("/connect", async (req, res) => {
  try {
    const { userId, deviceId } = req.body;
    
    // Find the user and their driver profile
    const user = await User.findById(userId).populate('driverProfile');
    if (!user || user.role !== 'driver' || !user.driverProfile) {
      return res.status(400).json({ 
        success: false, 
        message: "User must be a driver with a valid profile to connect vehicles" 
      });
    }
    
    // Find vehicle by device ID
    const vehicle = await Vehicle.findOne({ iotDeviceId: deviceId });
    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: "Vehicle with this device ID not found" 
      });
    }
    
    // Check if vehicle is already connected to another driver
    if (vehicle.driverId && vehicle.driverId.toString() !== user.driverProfile._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "This vehicle is already connected to another driver" 
      });
    }
    
    // Connect vehicle to driver
    vehicle.driverId = user.driverProfile._id;
    await vehicle.save();
    
    console.log(`✅ Vehicle connected: ${vehicle.vehicleNumber} to driver ${user.username}`);
    
    res.json({ success: true, vehicle });
  } catch (err) {
    console.error("Connect vehicle error:", err);
    res.status(500).json({ success: false, message: "Error connecting vehicle" });
  }
});

// Register new vehicle from QR scan
router.post("/register", async (req, res) => {
  try {
    const { userId, vehicleData } = req.body;
    
    // Find the user and their driver profile
    const user = await User.findById(userId).populate('driverProfile');
    if (!user || user.role !== 'driver' || !user.driverProfile) {
      return res.status(400).json({ 
        success: false, 
        message: "User must be a driver with a valid profile to register vehicles" 
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
      const existingDevice = await Vehicle.findOne({ iotDeviceId: vehicleData.iotDeviceId });
      if (existingDevice) {
        return res.status(400).json({ 
          success: false, 
          message: "This IoT device is already registered to another vehicle" 
        });
      }
    }
    
    // Create new vehicle
    const vehicle = new Vehicle({ 
      ...vehicleData, 
      driverId: user.driverProfile._id,
      vehicleNumber: vehicleData.vehicleNumber.toUpperCase(),
      registrationDate: new Date(),
      registrationExpiry: new Date(vehicleData.registrationExpiry),
      insuranceExpiry: new Date(vehicleData.insuranceExpiry)
    });
    
    await vehicle.save();
    
    console.log(`✅ Vehicle registered: ${vehicle.vehicleNumber} (${vehicle.vehicleType}) - Speed Limit: ${vehicle.speedLimit} km/h`);
    
    res.json({ success: true, vehicle });
  } catch (err) {
    console.error("Register vehicle error:", err);
    res.status(500).json({ success: false, message: "Error registering vehicle" });
  }
});

module.exports = router;
