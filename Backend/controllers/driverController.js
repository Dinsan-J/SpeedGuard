const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Violation = require('../models/Violation');

/**
 * Register new driver
 */
exports.registerDriver = async (req, res) => {
  try {
    const {
      licenseNumber,
      fullName,
      nicNumber,
      phoneNumber,
      email,
      address,
      licenseClass,
      licenseIssueDate,
      licenseExpiryDate
    } = req.body;

    // Validate required fields
    if (!licenseNumber || !fullName || !nicNumber || !phoneNumber || !email || !licenseClass) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if driver already exists
    const existingDriver = await Driver.findOne({
      $or: [
        { licenseNumber: licenseNumber.toUpperCase() },
        { nicNumber },
        { email: email.toLowerCase() }
      ]
    });

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Driver with this license number, NIC, or email already exists'
      });
    }

    // Create new driver
    const driver = new Driver({
      licenseNumber: licenseNumber.toUpperCase(),
      fullName,
      nicNumber,
      phoneNumber,
      email: email.toLowerCase(),
      address,
      licenseClass,
      licenseIssueDate: new Date(licenseIssueDate),
      licenseExpiryDate: new Date(licenseExpiryDate)
    });

    await driver.save();

    console.log(`✅ Driver registered: ${driver.fullName} (${driver.licenseNumber})`);

    res.status(201).json({
      success: true,
      message: 'Driver registered successfully',
      data: {
        _id: driver._id,
        licenseNumber: driver.licenseNumber,
        fullName: driver.fullName,
        meritPoints: driver.meritPoints,
        drivingStatus: driver.drivingStatus,
        createdAt: driver.createdAt
      }
    });

  } catch (error) {
    console.error('Error registering driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register driver',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get driver profile
 */
exports.getDriverProfile = async (req, res) => {
  try {
    const { licenseNumber } = req.params;

    const driver = await Driver.findByLicenseNumber(licenseNumber);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Get driver's vehicles
    const vehicles = await Vehicle.findByDriver(driver._id);

    // Get recent violations
    const violations = await Violation.findByDriver(driver._id).limit(10);

    res.json({
      success: true,
      data: {
        driver: {
          _id: driver._id,
          licenseNumber: driver.licenseNumber,
          fullName: driver.fullName,
          nicNumber: driver.nicNumber,
          phoneNumber: driver.phoneNumber,
          email: driver.email,
          licenseClass: driver.licenseClass,
          licenseIssueDate: driver.licenseIssueDate,
          licenseExpiryDate: driver.licenseExpiryDate,
          meritPoints: driver.meritPoints,
          drivingStatus: driver.drivingStatus,
          totalViolations: driver.totalViolations,
          lastViolationDate: driver.lastViolationDate,
          isActive: driver.isActive,
          isVerified: driver.isVerified
        },
        vehicles: vehicles.map(v => ({
          _id: v._id,
          vehicleNumber: v.vehicleNumber,
          vehicleType: v.vehicleType,
          speedLimit: v.speedLimit,
          make: v.make,
          model: v.model,
          year: v.year,
          hasIoTDevice: !!v.iotDeviceId,
          totalViolations: v.totalViolations,
          riskLevel: v.riskLevel
        })),
        recentViolations: violations.map(v => ({
          _id: v._id,
          vehicleNumber: v.vehicleId.vehicleNumber,
          speed: v.speed,
          speedLimit: v.speedLimit,
          severity: v.severity,
          meritPointsToDeduct: v.meritPointsToDeduct,
          timestamp: v.timestamp,
          status: v.status,
          officerVerified: v.officerVerified,
          meritPointsApplied: v.meritPointsApplied
        }))
      }
    });

  } catch (error) {
    console.error('Error getting driver profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get driver profile'
    });
  }
};

/**
 * Add vehicle to driver
 */
exports.addVehicle = async (req, res) => {
  try {
    const { licenseNumber } = req.params;
    const {
      vehicleNumber,
      vehicleType,
      make,
      model,
      year,
      color,
      engineNumber,
      chassisNumber,
      registrationDate,
      registrationExpiry,
      insuranceExpiry
    } = req.body;

    // Validate required fields
    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number and type are required'
      });
    }

    // Find driver
    const driver = await Driver.findByLicenseNumber(licenseNumber);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({ 
      vehicleNumber: vehicleNumber.toUpperCase() 
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this number already exists'
      });
    }

    // Validate vehicle type
    const validTypes = ['motorcycle', 'light_vehicle', 'three_wheeler', 'heavy_vehicle'];
    if (!validTypes.includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle type'
      });
    }

    // Create new vehicle
    const vehicle = new Vehicle({
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      make,
      model,
      year: year ? parseInt(year) : undefined,
      color,
      engineNumber,
      chassisNumber,
      driverId: driver._id,
      registrationDate: registrationDate ? new Date(registrationDate) : undefined,
      registrationExpiry: registrationExpiry ? new Date(registrationExpiry) : undefined,
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined
    });

    await vehicle.save();

    console.log(`✅ Vehicle added: ${vehicle.vehicleNumber} (${vehicle.vehicleType}) - Speed Limit: ${vehicle.speedLimit} km/h`);
    console.log(`   Owner: ${driver.fullName} (${driver.licenseNumber})`);

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: {
        _id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        speedLimit: vehicle.speedLimit,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        qrCode: vehicle.qrCode,
        owner: {
          fullName: driver.fullName,
          licenseNumber: driver.licenseNumber
        },
        createdAt: vehicle.createdAt
      }
    });

  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add vehicle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get driver's vehicles
 */
exports.getDriverVehicles = async (req, res) => {
  try {
    const { licenseNumber } = req.params;

    const driver = await Driver.findByLicenseNumber(licenseNumber);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const vehicles = await Vehicle.findByDriver(driver._id);

    res.json({
      success: true,
      data: {
        driver: {
          fullName: driver.fullName,
          licenseNumber: driver.licenseNumber,
          meritPoints: driver.meritPoints,
          drivingStatus: driver.drivingStatus
        },
        vehicles: vehicles.map(v => ({
          _id: v._id,
          vehicleNumber: v.vehicleNumber,
          vehicleType: v.vehicleType,
          speedLimit: v.speedLimit,
          make: v.make,
          model: v.model,
          year: v.year,
          color: v.color,
          status: v.status,
          qrCode: v.qrCode,
          hasIoTDevice: !!v.iotDeviceId,
          iotDevice: v.iotDeviceId ? {
            deviceId: v.iotDeviceId.deviceId,
            status: v.iotDeviceId.status,
            isOnline: v.iotDeviceId.isOnline,
            lastSeen: v.iotDeviceId.lastSeen
          } : null,
          totalViolations: v.totalViolations,
          riskLevel: v.riskLevel,
          lastViolationDate: v.lastViolationDate,
          isOnline: v.isOnline,
          currentSpeed: v.currentSpeed,
          currentLocation: v.currentLocation,
          createdAt: v.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error getting driver vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get driver vehicles'
    });
  }
};

/**
 * Get driver's violations
 */
exports.getDriverViolations = async (req, res) => {
  try {
    const { licenseNumber } = req.params;
    const { page = 1, limit = 20, status, severity } = req.query;

    const driver = await Driver.findByLicenseNumber(licenseNumber);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const filter = { driverId: driver._id };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const violations = await Violation.find(filter)
      .populate('vehicleId', 'vehicleNumber vehicleType')
      .populate('deviceId', 'deviceId')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Violation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        driver: {
          fullName: driver.fullName,
          licenseNumber: driver.licenseNumber,
          meritPoints: driver.meritPoints,
          drivingStatus: driver.drivingStatus,
          totalViolations: driver.totalViolations
        },
        violations: violations.map(v => ({
          _id: v._id,
          vehicle: {
            vehicleNumber: v.vehicleId.vehicleNumber,
            vehicleType: v.vehicleId.vehicleType
          },
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
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting driver violations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get driver violations'
    });
  }
};

/**
 * Request IoT device assignment
 */
exports.requestDeviceAssignment = async (req, res) => {
  try {
    const { vehicleId } = req.body;

    const vehicle = await Vehicle.findById(vehicleId).populate('driverId');
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.iotDeviceId) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle already has an IoT device assigned'
      });
    }

    // This creates a request that admin can fulfill
    // In a real system, this might create a notification or ticket

    res.json({
      success: true,
      message: 'IoT device assignment request submitted',
      data: {
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        owner: vehicle.driverId.fullName,
        status: 'pending_assignment'
      }
    });

  } catch (error) {
    console.error('Error requesting device assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request device assignment'
    });
  }
};

module.exports = exports;