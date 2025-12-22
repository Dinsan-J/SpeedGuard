const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Violation = require('../models/Violation');
const QRCode = require('qrcode');

/**
 * Generate QR code for vehicle (Driver request)
 */
exports.generateVehicleQR = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.id;

    // Find vehicle and verify ownership
    const vehicle = await Vehicle.findById(vehicleId).populate('driverId');
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Verify vehicle ownership (if user is driver)
    if (req.user.role === 'driver' && vehicle.driverId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Not your vehicle'
      });
    }

    // Generate QR code data
    const qrData = {
      vehicleId: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    // Update vehicle QR code
    vehicle.qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');
    vehicle.qrCodeGeneratedAt = new Date();
    await vehicle.save();

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(vehicle.qrCode);

    res.json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        vehicleNumber: vehicle.vehicleNumber,
        qrCode: vehicle.qrCode,
        qrCodeImage,
        generatedAt: vehicle.qrCodeGeneratedAt
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
};

/**
 * Scan QR code and get vehicle/driver details (Officer use)
 */
exports.scanVehicleQR = async (req, res) => {
  try {
    const { qrCode, latitude, longitude } = req.body;
    const officerId = req.user.id;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code is required'
      });
    }

    // Verify officer permissions
    if (req.user.role !== 'officer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Officer privileges required'
      });
    }

    console.log(`👮 Officer ${req.user.username} scanning QR code`);

    // Find vehicle by QR code
    const vehicle = await Vehicle.findByQRCode(qrCode);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code or vehicle not found'
      });
    }

    console.log(`🚗 Vehicle found: ${vehicle.vehicleNumber}`);
    console.log(`👤 Driver: ${vehicle.driverId.fullName} (${vehicle.driverId.licenseNumber})`);

    // Get recent violations for this vehicle (if location provided)
    let nearbyViolations = [];
    if (latitude && longitude) {
      nearbyViolations = await Violation.findInRadius(latitude, longitude, 1) // 1km radius
        .where('vehicleId').equals(vehicle._id)
        .limit(10);
      
      console.log(`📍 Found ${nearbyViolations.length} violations within 1km radius`);
    }

    // Get all violations for this vehicle
    const allViolations = await Violation.findByVehicle(vehicle._id).limit(20);

    // Get pending violations (not verified by officer)
    const pendingViolations = allViolations.filter(v => 
      v.status === 'detected' && !v.officerVerified
    );

    // Prepare response data
    const responseData = {
      vehicle: {
        _id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        speedLimit: vehicle.speedLimit,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        status: vehicle.status,
        totalViolations: vehicle.totalViolations,
        riskLevel: vehicle.riskLevel,
        lastViolationDate: vehicle.lastViolationDate,
        isOnline: vehicle.isOnline,
        currentSpeed: vehicle.currentSpeed,
        currentLocation: vehicle.currentLocation
      },
      driver: {
        _id: vehicle.driverId._id,
        fullName: vehicle.driverId.fullName,
        licenseNumber: vehicle.driverId.licenseNumber,
        licenseClass: vehicle.driverId.licenseClass,
        meritPoints: vehicle.driverId.meritPoints,
        drivingStatus: vehicle.driverId.drivingStatus,
        totalViolations: vehicle.driverId.totalViolations,
        lastViolationDate: vehicle.driverId.lastViolationDate,
        phoneNumber: vehicle.driverId.phoneNumber,
        email: vehicle.driverId.email
      },
      violations: {
        total: allViolations.length,
        pending: pendingViolations.length,
        nearby: nearbyViolations.length,
        recent: allViolations.slice(0, 5).map(v => ({
          _id: v._id,
          speed: v.speed,
          speedLimit: v.speedLimit,
          speedOverLimit: v.speedOverLimit,
          severity: v.severity,
          meritPointsToDeduct: v.meritPointsToDeduct,
          timestamp: v.timestamp,
          location: v.location,
          status: v.status,
          officerVerified: v.officerVerified,
          meritPointsApplied: v.meritPointsApplied,
          sensitiveZone: v.sensitiveZone,
          riskLevel: v.riskLevel
        })),
        pendingList: pendingViolations.map(v => ({
          _id: v._id,
          speed: v.speed,
          speedLimit: v.speedLimit,
          speedOverLimit: v.speedOverLimit,
          severity: v.severity,
          meritPointsToDeduct: v.meritPointsToDeduct,
          timestamp: v.timestamp,
          location: v.location,
          riskLevel: v.riskLevel,
          sensitiveZone: v.sensitiveZone
        }))
      },
      scanInfo: {
        scannedBy: officerId,
        scannedAt: new Date(),
        scanLocation: latitude && longitude ? { latitude, longitude } : null
      }
    };

    console.log(`✅ QR scan successful - Vehicle: ${vehicle.vehicleNumber}, Driver: ${vehicle.driverId.fullName}`);
    console.log(`📊 Merit Points: ${vehicle.driverId.meritPoints}/100 (${vehicle.driverId.drivingStatus})`);
    console.log(`🚨 Pending Violations: ${pendingViolations.length}`);

    res.json({
      success: true,
      message: 'QR code scanned successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error scanning QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify driver license and apply merit points (Officer use)
 */
exports.verifyAndApplyMeritPoints = async (req, res) => {
  try {
    const { violationId, licenseNumber, notes } = req.body;
    const officerId = req.user.id;

    // Validate inputs
    if (!violationId || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'Violation ID and license number are required'
      });
    }

    // Verify officer permissions
    if (req.user.role !== 'officer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Officer privileges required'
      });
    }

    console.log(`👮 Officer ${req.user.username} verifying violation ${violationId}`);
    console.log(`📄 License to verify: ${licenseNumber}`);

    // Find violation
    const violation = await Violation.findById(violationId)
      .populate('vehicleId')
      .populate('driverId');

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    // Check if already verified
    if (violation.officerVerified) {
      return res.status(400).json({
        success: false,
        message: 'Violation already verified by officer'
      });
    }

    console.log(`🚗 Vehicle: ${violation.vehicleId.vehicleNumber}`);
    console.log(`👤 Registered Driver: ${violation.driverId.fullName} (${violation.driverId.licenseNumber})`);

    // Verify license number matches vehicle owner
    if (violation.driverId.licenseNumber !== licenseNumber.toUpperCase()) {
      console.log(`❌ License mismatch: Expected ${violation.driverId.licenseNumber}, Got ${licenseNumber}`);
      
      return res.status(400).json({
        success: false,
        message: 'License number does not match vehicle owner',
        data: {
          expectedLicense: violation.driverId.licenseNumber,
          providedLicense: licenseNumber.toUpperCase(),
          vehicleOwner: violation.driverId.fullName
        }
      });
    }

    console.log(`✅ License verified successfully`);

    // Step 1: Verify violation by officer
    await violation.verifyByOfficer(officerId, licenseNumber, notes);

    // Step 2: Apply merit points to driver
    const driver = violation.driverId;
    const meritResult = driver.deductMeritPoints(violation.speedOverLimit);
    await driver.save();

    // Step 3: Mark merit points as applied
    await violation.applyMeritPoints(officerId);

    console.log(`🎯 Merit points applied:`);
    console.log(`   Points deducted: ${meritResult.pointsDeducted}`);
    console.log(`   New total: ${meritResult.newTotal}/100`);
    console.log(`   Driving status: ${meritResult.status}`);

    res.json({
      success: true,
      message: 'Violation verified and merit points applied successfully',
      data: {
        violation: {
          _id: violation._id,
          speed: violation.speed,
          speedLimit: violation.speedLimit,
          severity: violation.severity,
          status: 'resolved',
          verifiedAt: violation.verificationDate
        },
        driver: {
          fullName: driver.fullName,
          licenseNumber: driver.licenseNumber,
          previousMeritPoints: meritResult.newTotal + meritResult.pointsDeducted,
          currentMeritPoints: meritResult.newTotal,
          pointsDeducted: meritResult.pointsDeducted,
          drivingStatus: meritResult.status
        },
        officer: {
          verifiedBy: req.user.username,
          verificationDate: violation.verificationDate,
          notes: notes || null
        }
      }
    });

  } catch (error) {
    console.error('Error verifying and applying merit points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify violation and apply merit points',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get pending violations for officer review
 */
exports.getPendingViolations = async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, riskLevel } = req.query;

    // Verify officer permissions
    if (req.user.role !== 'officer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Officer privileges required'
      });
    }

    const filter = { 
      status: 'detected',
      officerVerified: false 
    };

    if (severity) filter.severity = severity;
    if (riskLevel) filter.riskLevel = riskLevel;

    const violations = await Violation.find(filter)
      .populate('vehicleId', 'vehicleNumber vehicleType')
      .populate('driverId', 'fullName licenseNumber meritPoints drivingStatus')
      .populate('deviceId', 'deviceId')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Violation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        violations: violations.map(v => ({
          _id: v._id,
          vehicle: {
            vehicleNumber: v.vehicleId.vehicleNumber,
            vehicleType: v.vehicleId.vehicleType
          },
          driver: {
            fullName: v.driverId.fullName,
            licenseNumber: v.driverId.licenseNumber,
            meritPoints: v.driverId.meritPoints,
            drivingStatus: v.driverId.drivingStatus
          },
          violation: {
            speed: v.speed,
            speedLimit: v.speedLimit,
            speedOverLimit: v.speedOverLimit,
            severity: v.severity,
            meritPointsToDeduct: v.meritPointsToDeduct,
            timestamp: v.timestamp,
            location: v.location,
            riskLevel: v.riskLevel,
            sensitiveZone: v.sensitiveZone
          }
        })),
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting pending violations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending violations'
    });
  }
};

module.exports = exports;