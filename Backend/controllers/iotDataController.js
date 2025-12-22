const IoTDevice = require('../models/IoTDevice');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Violation = require('../models/Violation');
const GeofencingService = require('../services/geofencingService');
const MLRiskService = require('../services/mlRiskService');

/**
 * IoT Data Ingestion Endpoint
 * Receives data from ESP32 devices
 * 
 * Expected JSON format:
 * {
 *   "deviceId": "ESP32_ABC123",
 *   "speed": 85,
 *   "latitude": 9.6615,
 *   "longitude": 80.0255,
 *   "timestamp": "2024-01-15T10:30:00Z"
 * }
 */
exports.ingestIoTData = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { deviceId, speed, latitude, longitude, timestamp, batteryLevel, temperature, signalStrength } = req.body;

    // Validate required fields
    if (!deviceId || speed === undefined || !latitude || !longitude || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: deviceId, speed, latitude, longitude, timestamp'
      });
    }

    console.log(`📡 IoT Data Received from ${deviceId}:`);
    console.log(`   Speed: ${speed} km/h`);
    console.log(`   Location: ${latitude}, ${longitude}`);
    console.log(`   Timestamp: ${timestamp}`);

    // Step 1: Find IoT device
    const device = await IoTDevice.findOne({ deviceId: deviceId.toUpperCase() });
    
    if (!device) {
      console.log(`❌ Device not found: ${deviceId}`);
      return res.status(404).json({
        success: false,
        message: 'IoT device not registered in system',
        deviceId
      });
    }

    // Step 2: Update device status
    await device.updateStatus({
      latitude,
      longitude,
      speed,
      batteryLevel,
      temperature,
      signalStrength
    });

    console.log(`✅ Device status updated: ${deviceId}`);

    // Step 3: Find assigned vehicle
    if (!device.assignedVehicleId) {
      console.log(`⚠️  Device ${deviceId} is not assigned to any vehicle`);
      return res.status(200).json({
        success: true,
        message: 'Data received but device not assigned to vehicle',
        deviceStatus: 'unassigned'
      });
    }

    const vehicle = await Vehicle.findById(device.assignedVehicleId).populate('driverId');
    
    if (!vehicle) {
      console.log(`❌ Vehicle not found for device ${deviceId}`);
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found for assigned device'
      });
    }

    console.log(`🚗 Vehicle found: ${vehicle.vehicleNumber} (${vehicle.vehicleType})`);
    console.log(`👤 Driver: ${vehicle.driverId.fullName} (License: ${vehicle.driverId.licenseNumber})`);

    // Step 4: Update vehicle location
    await vehicle.updateLocation(latitude, longitude, speed);

    // Step 5: Check for speed violation
    const speedLimit = vehicle.speedLimit;
    const isViolation = speed > speedLimit;

    console.log(`🚦 Speed Limit: ${speedLimit} km/h`);
    console.log(`📊 Violation: ${isViolation ? 'YES' : 'NO'}`);

    if (!isViolation) {
      return res.status(200).json({
        success: true,
        message: 'Data processed successfully - No violation',
        data: {
          deviceId,
          vehicleNumber: vehicle.vehicleNumber,
          speed,
          speedLimit,
          isViolation: false
        }
      });
    }

    // Step 6: Violation detected - Perform geofencing analysis
    console.log(`🚨 VIOLATION DETECTED!`);
    console.log(`   Speed: ${speed} km/h (Limit: ${speedLimit} km/h)`);
    console.log(`   Excess: +${speed - speedLimit} km/h`);

    const geofencing = await GeofencingService.analyzeViolationLocation(latitude, longitude);
    
    console.log(`📍 Geofencing Analysis:`);
    console.log(`   In Sensitive Zone: ${geofencing.isInZone ? 'YES' : 'NO'}`);
    if (geofencing.isInZone) {
      console.log(`   Zone Type: ${geofencing.zoneType}`);
      console.log(`   Zone Name: ${geofencing.zoneName}`);
    }

    // Step 7: ML Risk Assessment
    const violationData = {
      speed,
      speedLimit,
      speedOverLimit: speed - speedLimit,
      location: { latitude, longitude },
      timeOfDay: new Date(timestamp).getHours(),
      vehicleType: vehicle.vehicleType,
      isInSensitiveZone: geofencing.isInZone,
      zoneType: geofencing.zoneType
    };

    const driverData = {
      licenseNumber: vehicle.driverId.licenseNumber,
      meritPoints: vehicle.driverId.meritPoints,
      totalViolations: vehicle.driverId.totalViolations,
      drivingStatus: vehicle.driverId.drivingStatus
    };

    const riskAssessment = await MLRiskService.calculateRiskScore(violationData, driverData);

    console.log(`🤖 ML Risk Assessment:`);
    console.log(`   Risk Score: ${(riskAssessment.riskScore * 100).toFixed(1)}%`);
    console.log(`   Risk Level: ${riskAssessment.riskLevel.toUpperCase()}`);

    // Step 8: Create violation record (DO NOT apply merit points automatically)
    const violation = new Violation({
      vehicleId: vehicle._id,
      driverId: vehicle.driverId._id,
      deviceId: device._id,
      location: {
        latitude,
        longitude,
        accuracy: 5 // Default GPS accuracy
      },
      speed,
      speedLimit,
      speedOverLimit: speed - speedLimit,
      timestamp: new Date(timestamp),
      sensitiveZone: {
        isInZone: geofencing.isInZone,
        zoneType: geofencing.zoneType,
        zoneName: geofencing.zoneName,
        distanceFromZone: geofencing.distanceFromZone,
        zoneRadius: geofencing.zoneRadius
      },
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      riskFactors: riskAssessment.riskFactors,
      status: 'detected', // Requires officer verification
      processingTime: Date.now() - startTime
    });

    await violation.save();

    // Step 9: Update statistics
    await vehicle.recordViolation();
    await device.recordViolationDetection();

    console.log(`✅ Violation recorded: ${violation._id}`);
    console.log(`⚠️  Merit points NOT automatically deducted - Requires officer verification`);
    console.log(`📊 Processing time: ${Date.now() - startTime}ms`);

    // Step 10: Send response
    res.status(201).json({
      success: true,
      message: 'Violation detected and recorded - Awaiting officer verification',
      data: {
        violationId: violation._id,
        deviceId,
        vehicleNumber: vehicle.vehicleNumber,
        driverLicense: vehicle.driverId.licenseNumber,
        speed,
        speedLimit,
        speedOverLimit: speed - speedLimit,
        severity: violation.severity,
        meritPointsToDeduct: violation.meritPointsToDeduct,
        location: {
          latitude,
          longitude
        },
        sensitiveZone: geofencing.isInZone ? {
          type: geofencing.zoneType,
          name: geofencing.zoneName
        } : null,
        riskAssessment: {
          score: riskAssessment.riskScore,
          level: riskAssessment.riskLevel
        },
        status: 'detected',
        requiresOfficerVerification: true,
        processingTime: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('❌ IoT Data Ingestion Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process IoT data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get device status
 */
exports.getDeviceStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await IoTDevice.findOne({ deviceId: deviceId.toUpperCase() })
      .populate('assignedVehicleId');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: {
        deviceId: device.deviceId,
        status: device.status,
        isOnline: device.isOnline,
        lastSeen: device.lastSeen,
        assignedVehicle: device.assignedVehicleId ? {
          vehicleNumber: device.assignedVehicleId.vehicleNumber,
          vehicleType: device.assignedVehicleId.vehicleType,
          speedLimit: device.assignedVehicleId.speedLimit
        } : null,
        lastKnownLocation: device.lastKnownLocation,
        metrics: device.metrics
      }
    });

  } catch (error) {
    console.error('Error getting device status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device status'
    });
  }
};

/**
 * Device heartbeat endpoint
 */
exports.deviceHeartbeat = async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID required'
      });
    }

    const device = await IoTDevice.findOne({ deviceId: deviceId.toUpperCase() });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    device.isOnline = true;
    device.lastHeartbeat = new Date();
    device.lastSeen = new Date();
    await device.save();

    res.json({
      success: true,
      message: 'Heartbeat received',
      configuration: device.configuration
    });

  } catch (error) {
    console.error('Error processing heartbeat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process heartbeat'
    });
  }
};