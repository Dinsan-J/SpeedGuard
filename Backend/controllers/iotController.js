const Vehicle = require("../models/Vehicle");
const Violation = require("../models/Violation");

// Receive real-time data from IoT device
exports.receiveIoTData = async (req, res) => {
  try {
    const { iotDeviceId, speed, location, timestamp } = req.body;

    // Find vehicle by IoT device ID
    const vehicle = await Vehicle.findOne({ iotDeviceId });
    
    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: "Vehicle not found for this IoT device" 
      });
    }

    // Update vehicle's current speed and location
    vehicle.currentSpeed = speed;
    vehicle.currentLocation = location;
    vehicle.lastUpdated = timestamp || new Date();
    await vehicle.save();

    // Check for speed violations (assuming 70 km/h limit)
    const speedLimit = 70;
    if (speed > speedLimit) {
      // Create violation record
      const violation = new Violation({
        vehicleId: vehicle.plateNumber,
        location: location,
        speed: speed,
        timestamp: timestamp || new Date(),
        status: "pending"
      });
      await violation.save();

      // Add violation to vehicle
      vehicle.violations.push(violation._id);
      vehicle.lastViolation = violation.timestamp;
      await vehicle.save();

      return res.json({ 
        success: true, 
        message: "Speed violation detected",
        violation: violation,
        vehicle: vehicle
      });
    }

    res.json({ 
      success: true, 
      message: "IoT data received successfully",
      vehicle: vehicle
    });
  } catch (err) {
    console.error("IoT data error:", err);
    res.status(500).json({ success: false, message: "Error processing IoT data" });
  }
};

// Get real-time vehicle data
exports.getVehicleRealTimeData = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const vehicle = await Vehicle.findById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: "Vehicle not found" 
      });
    }

    res.json({ 
      success: true, 
      data: {
        currentSpeed: vehicle.currentSpeed,
        currentLocation: vehicle.currentLocation,
        lastUpdated: vehicle.lastUpdated,
        iotDeviceId: vehicle.iotDeviceId
      }
    });
  } catch (err) {
    console.error("Get real-time data error:", err);
    res.status(500).json({ success: false, message: "Error fetching real-time data" });
  }
};
