const Vehicle = require("../models/Vehicle");
const Violation = require("../models/Violation");
const geofencingService = require("../services/geofencingService");

// Receive real-time data from IoT device
exports.receiveIoTData = async (req, res) => {
  try {
    const { iotDeviceId, speed, location, timestamp, vehicleType } = req.body;

    // Validate required fields
    if (!iotDeviceId || !speed || !location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: iotDeviceId, speed, location (lat, lng)"
      });
    }

    // Find vehicle by IoT device ID
    const vehicle = await Vehicle.findOne({ iotDeviceId }).populate('owner');
    
    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: "Vehicle not found for this IoT device" 
      });
    }

    // Get dynamic speed limit based on vehicle type
    let appliedSpeedLimit;
    let detectedVehicleType;
    
    if (vehicleType) {
      // Use vehicle type from IoT device if provided
      detectedVehicleType = vehicleType;
    } else if (vehicle.vehicleType) {
      // Use vehicle type from database
      detectedVehicleType = vehicle.vehicleType;
    } else if (vehicle.owner && vehicle.owner.vehicleType) {
      // Use vehicle type from user profile
      detectedVehicleType = vehicle.owner.vehicleType;
    } else {
      // Default to light vehicle if no type specified
      detectedVehicleType = 'light_vehicle';
    }
    
    // Calculate speed limit based on vehicle type
    const speedLimits = {
      motorcycle: 70,
      light_vehicle: 70,
      three_wheeler: 50,
      heavy_vehicle: 50
    };
    appliedSpeedLimit = speedLimits[detectedVehicleType] || 70;

    // Update vehicle's current speed and location
    vehicle.currentSpeed = speed;
    vehicle.currentLocation = location;
    vehicle.lastUpdated = timestamp || new Date();
    
    // Get socket.io instance for real-time updates
    const io = req.app.get('socketio');
    
    // Emit real-time vehicle data
    if (io) {
      io.emit('vehicleUpdate', {
        vehicleId: vehicle._id,
        plateNumber: vehicle.plateNumber,
        speed: speed,
        location: location,
        timestamp: vehicle.lastUpdated
      });
    }

    await vehicle.save();

    // Prepare additional context for ML risk assessment
    const additionalContext = {
      trafficDensity: req.body.trafficDensity || 'moderate',
      weatherConditions: req.body.weatherConditions || 'clear'
    };

    // Calculate fine with geofencing and ML risk analysis using dynamic speed limit
    const violationAnalysis = await geofencingService.calculateViolationFine(
      speed, 
      location.lat, 
      location.lng, 
      vehicle.owner ? vehicle.owner._id : null, // Driver ID if available
      appliedSpeedLimit, // Use dynamic speed limit based on vehicle type
      additionalContext
    );

    // Check for speed violations using dynamic speed limits
    const speedOverLimit = speed - appliedSpeedLimit;
    const isViolation = speedOverLimit > 0;
    
    if (isViolation) {
      console.log(`🚨 Speed violation detected: ${speed} km/h (limit: ${appliedSpeedLimit} km/h)`);
      console.log(`🚗 Vehicle type: ${detectedVehicleType}`);
      console.log(`📊 Speed over limit: ${speedOverLimit} km/h`);
      console.log(`📍 Location type: ${violationAnalysis.geofencing?.isInZone ? 'Sensitive Zone' : 'Normal Road'}`);
      
      // Create violation record with complete analysis data
      const violation = new Violation({
        vehicleId: vehicle.plateNumber,
        deviceId: iotDeviceId,
        vehicleType: detectedVehicleType,
        appliedSpeedLimit: appliedSpeedLimit,
        userId: vehicle.owner ? vehicle.owner._id : null,
        location: location,
        speed: speed,
        speedOverLimit: speedOverLimit,
        timestamp: timestamp || new Date(),
        status: "confirmed", // Automatically confirmed
        
        // Fine calculation
        baseFine: violationAnalysis.baseFine,
        finalFine: violationAnalysis.finalFine,
        zoneMultiplier: violationAnalysis.geofencing.multiplier,
        riskMultiplier: violationAnalysis.riskAssessment?.riskMultiplier || 1.0,
        fineBreakdown: violationAnalysis.fineBreakdown,
        
        // Geofencing data
        sensitiveZone: {
          isInZone: violationAnalysis.geofencing.isInZone,
          zoneType: violationAnalysis.geofencing.zoneType,
          zoneName: violationAnalysis.geofencing.zoneName,
          distanceFromZone: violationAnalysis.geofencing.distanceFromZone,
          zoneRadius: violationAnalysis.geofencing.zoneRadius
        },
        
        // ML Risk Assessment
        riskScore: violationAnalysis.riskAssessment?.riskScore || 0.3,
        riskLevel: violationAnalysis.riskAssessment?.riskLevel || 'medium',
        riskFactors: violationAnalysis.riskAssessment?.features ? 
          Object.entries(violationAnalysis.riskAssessment.features).map(([factor, weight]) => ({
            factor,
            weight,
            description: `${factor}: ${(weight * 100).toFixed(1)}%`
          })) : [],
        
        // Merit points (automatically applied)
        meritPointsDeducted: violationAnalysis.meritPointsDeduction || 5,
        driverConfirmed: true, // Automatically confirmed
        meritPointsApplied: true, // Automatically applied
        
        // Additional context
        trafficDensity: additionalContext.trafficDensity,
        weatherConditions: additionalContext.weatherConditions
      });

      await violation.save();

      // Automatically apply merit points to the user
      if (vehicle.owner && violationAnalysis.meritPointsDeduction) {
        const User = require('../models/User');
        const user = await User.findById(vehicle.owner._id);
        
        if (user) {
          const result = user.deductMeritPoints(speedOverLimit);
          await user.save();
          
          console.log(`🎯 Merit points automatically applied:`);
          console.log(`   Driver: ${user.username}`);
          console.log(`   Points deducted: ${result.pointsDeducted}`);
          console.log(`   New total: ${result.newTotal}`);
          console.log(`   Status: ${user.drivingStatus}`);
        }
      }

      // Add violation to vehicle
      vehicle.violations.push(violation._id);
      vehicle.lastViolation = violation.timestamp;
      await vehicle.save();

      // Emit real-time violation alert
      if (io) {
        io.emit('violationAlert', {
          violation: violation,
          vehicle: {
            plateNumber: vehicle.plateNumber,
            make: vehicle.make,
            model: vehicle.model
          },
          geofencing: violationAnalysis.geofencing
        });
      }

      console.log(`💰 Fine calculated: LKR ${violationAnalysis.finalFine}`);
      console.log(`   Base: LKR ${violationAnalysis.baseFine}`);
      console.log(`   Zone multiplier: ${violationAnalysis.geofencing.multiplier}x`);
      console.log(`   Risk multiplier: ${violationAnalysis.riskAssessment?.riskMultiplier || 1.0}x`);
      console.log(`🤖 ML Risk Assessment: ${violationAnalysis.riskAssessment?.riskLevel || 'medium'} (${((violationAnalysis.riskAssessment?.riskScore || 0.3) * 100).toFixed(1)}%)`);
      console.log(`🎯 Merit points to deduct: ${violationAnalysis.meritPointsDeduction || 5}`);
      
      if (violationAnalysis.geofencing.isInZone) {
        console.log(`📍 Violation in sensitive zone: ${violationAnalysis.geofencing.zoneName} (${violationAnalysis.geofencing.zoneType})`);
      }

      return res.json({ 
        success: true, 
        message: "Speed violation detected and processed",
        violation: violation,
        vehicle: vehicle,
        analysis: violationAnalysis
      });
    }

    res.json({ 
      success: true, 
      message: "IoT data received successfully",
      vehicle: vehicle
    });
  } catch (err) {
    console.error("❌ IoT data processing error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error processing IoT data",
      error: err.message 
    });
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
