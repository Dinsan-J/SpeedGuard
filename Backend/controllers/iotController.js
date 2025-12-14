const Vehicle = require("../models/Vehicle");
const Violation = require("../models/Violation");
const geofencingService = require("../services/geofencingService");

// Receive real-time data from IoT device
exports.receiveIoTData = async (req, res) => {
  try {
    const { iotDeviceId, speed, location, timestamp, speedLimit = 60 } = req.body;

    // Validate required fields
    if (!iotDeviceId || !speed || !location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: iotDeviceId, speed, location (lat, lng)"
      });
    }

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

    // Calculate fine with geofencing and ML risk analysis
    const violationAnalysis = await geofencingService.calculateViolationFine(
      speed, 
      location.lat, 
      location.lng, 
      null, // No driver ID at this stage (will be confirmed by police)
      speedLimit !== 60 ? speedLimit : null, // Use custom speed limit if provided, otherwise auto-detect
      additionalContext
    );

    // Check for speed violations using dynamic speed limits
    if (violationAnalysis.isViolation) {
      console.log(`🚨 Speed violation detected: ${speed} km/h (limit: ${violationAnalysis.speedLimit} km/h)`);
      console.log(`📍 Location type: ${violationAnalysis.geofencing.isInZone ? 'Sensitive Zone' : 'Normal Road'}`);
      
      // Create violation record with complete analysis data
      const violation = new Violation({
        vehicleId: vehicle.plateNumber,
        deviceId: iotDeviceId,
        location: location,
        speed: speed,
        speedLimit: violationAnalysis.speedLimit,
        timestamp: timestamp || new Date(),
        status: "pending",
        
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
        
        // Merit points (will be applied after police confirmation)
        meritPointsDeducted: violationAnalysis.meritPointsDeduction || 5,
        
        // Additional context
        trafficDensity: additionalContext.trafficDensity,
        weatherConditions: additionalContext.weatherConditions
      });

      await violation.save();

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
