const policeConfirmationService = require('../services/policeConfirmationService');
const Driver = require('../models/Driver');
const Violation = require('../models/Violation');

/**
 * Police Dashboard Controller
 * Handles all police officer operations for violation confirmation
 */

// Get pending violations for confirmation
exports.getPendingViolations = async (req, res) => {
  try {
    const filters = {
      vehicleId: req.query.vehicleId,
      riskLevel: req.query.riskLevel,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      limit: parseInt(req.query.limit) || 50
    };

    const violations = await policeConfirmationService.getPendingViolations(filters);

    res.json({
      success: true,
      data: violations,
      count: violations.length,
      message: `Found ${violations.length} pending violations`
    });

  } catch (error) {
    console.error('❌ Error fetching pending violations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending violations',
      error: error.message
    });
  }
};

// Confirm driver for a violation
exports.confirmDriver = async (req, res) => {
  try {
    const { violationId } = req.params;
    const { drivingLicenseId, additionalInfo } = req.body;
    const officerId = req.user?.id || 'test-officer-123'; // Default for testing

    const result = await policeConfirmationService.confirmDriver(
      violationId,
      drivingLicenseId,
      officerId,
      additionalInfo
    );

    res.json(result);

  } catch (error) {
    console.error('❌ Error confirming driver:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Dispute a violation
exports.disputeViolation = async (req, res) => {
  try {
    const { violationId } = req.params;
    const { reason } = req.body;
    const officerId = req.user?.id || 'test-officer-123'; // Default for testing

    const result = await policeConfirmationService.disputeViolation(
      violationId,
      reason,
      officerId
    );

    res.json(result);

  } catch (error) {
    console.error('❌ Error disputing violation:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel a violation
exports.cancelViolation = async (req, res) => {
  try {
    const { violationId } = req.params;
    const { reason } = req.body;
    const officerId = req.user?.id || 'test-officer-123'; // Default for testing

    const result = await policeConfirmationService.cancelViolation(
      violationId,
      reason,
      officerId
    );

    res.json(result);

  } catch (error) {
    console.error('❌ Error cancelling violation:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get violation statistics
exports.getViolationStats = async (req, res) => {
  try {
    const officerId = req.query.officerId || req.user?.id;
    const stats = await policeConfirmationService.getViolationStats(officerId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching violation stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching violation statistics',
      error: error.message
    });
  }
};

// Search drivers
exports.searchDrivers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters'
      });
    }

    const drivers = await policeConfirmationService.searchDrivers(q);

    res.json({
      success: true,
      data: drivers,
      count: drivers.length
    });

  } catch (error) {
    console.error('❌ Error searching drivers:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error searching drivers',
      error: error.message
    });
  }
};

// Get driver details and violation history
exports.getDriverDetails = async (req, res) => {
  try {
    const { licenseId } = req.params;
    
    const driver = await Driver.findByLicenseId(licenseId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Get driver's violation history
    const violations = await Violation.getDriverViolations(licenseId);

    res.json({
      success: true,
      data: {
        driver: {
          licenseId: driver.drivingLicenseId,
          fullName: driver.fullName,
          dateOfBirth: driver.dateOfBirth,
          licenseClass: driver.licenseClass,
          licenseExpiryDate: driver.licenseExpiryDate,
          meritPoints: driver.meritPoints,
          status: driver.status,
          riskLevel: driver.riskLevel,
          averageRiskScore: driver.averageRiskScore,
          totalViolations: driver.totalViolations,
          lastViolationDate: driver.lastViolationDate,
          mandatoryTrainingRequired: driver.mandatoryTrainingRequired
        },
        violations: violations,
        violationCount: violations.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching driver details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching driver details',
      error: error.message
    });
  }
};

// Get high-risk violations requiring immediate attention
exports.getHighRiskViolations = async (req, res) => {
  try {
    const violations = await Violation.getHighRiskViolations();

    res.json({
      success: true,
      data: violations,
      count: violations.length,
      message: `Found ${violations.length} high-risk violations`
    });

  } catch (error) {
    console.error('❌ Error fetching high-risk violations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching high-risk violations',
      error: error.message
    });
  }
};

// Get high-risk drivers
exports.getHighRiskDrivers = async (req, res) => {
  try {
    const drivers = await Driver.getHighRiskDrivers();

    const driverData = drivers.map(driver => ({
      licenseId: driver.drivingLicenseId,
      fullName: driver.fullName,
      meritPoints: driver.meritPoints,
      status: driver.status,
      riskLevel: driver.riskLevel,
      averageRiskScore: driver.averageRiskScore,
      totalViolations: driver.totalViolations,
      lastViolationDate: driver.lastViolationDate,
      mandatoryTrainingRequired: driver.mandatoryTrainingRequired
    }));

    res.json({
      success: true,
      data: driverData,
      count: driverData.length
    });

  } catch (error) {
    console.error('❌ Error fetching high-risk drivers:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching high-risk drivers',
      error: error.message
    });
  }
};

// QR Code Scanner - Get vehicle and driver information
exports.scanVehicleQR = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    // Find vehicle
    const Vehicle = require('../models/Vehicle');
    const vehicle = await Vehicle.findOne({ 
      $or: [
        { plateNumber: vehicleId },
        { _id: vehicleId }
      ]
    }).populate('owner');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Get pending violations for this vehicle
    const pendingViolations = await Violation.find({
      vehicleId: vehicle.plateNumber,
      driverConfirmed: false,
      status: 'pending'
    }).sort({ timestamp: -1 });

    // Get confirmed violations for this vehicle (last 10)
    const recentViolations = await Violation.find({
      vehicleId: vehicle.plateNumber,
      driverConfirmed: true
    }).sort({ timestamp: -1 }).limit(10);

    // Get driver information if available from recent violations
    let driverInfo = null;
    if (recentViolations.length > 0) {
      const lastDriverLicense = recentViolations[0].drivingLicenseId;
      if (lastDriverLicense) {
        driverInfo = await Driver.findByLicenseId(lastDriverLicense);
      }
    }

    res.json({
      success: true,
      data: {
        vehicle: {
          plateNumber: vehicle.plateNumber,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          status: vehicle.status,
          owner: vehicle.owner ? {
            username: vehicle.owner.username,
            email: vehicle.owner.email
          } : null,
          iotDeviceId: vehicle.iotDeviceId,
          currentSpeed: vehicle.currentSpeed,
          currentLocation: vehicle.currentLocation,
          lastUpdated: vehicle.lastUpdated
        },
        pendingViolations: pendingViolations.map(v => ({
          _id: v._id,
          speed: v.speed,
          speedLimit: v.speedLimit,
          timestamp: v.timestamp,
          location: v.location,
          finalFine: v.finalFine,
          riskScore: v.riskScore,
          riskLevel: v.riskLevel,
          meritPointsDeducted: v.meritPointsDeducted,
          sensitiveZone: v.sensitiveZone
        })),
        recentDriver: driverInfo ? {
          licenseId: driverInfo.drivingLicenseId,
          fullName: driverInfo.fullName,
          meritPoints: driverInfo.meritPoints,
          status: driverInfo.status,
          riskLevel: driverInfo.riskLevel,
          totalViolations: driverInfo.totalViolations,
          lastViolationDate: driverInfo.lastViolationDate,
          mandatoryTrainingRequired: driverInfo.mandatoryTrainingRequired
        } : null,
        recentViolations: recentViolations.slice(0, 5).map(v => ({
          timestamp: v.timestamp,
          speed: v.speed,
          finalFine: v.finalFine,
          riskLevel: v.riskLevel,
          drivingLicenseId: v.drivingLicenseId
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error scanning vehicle QR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error scanning vehicle QR code',
      error: error.message
    });
  }
};

// Quick violation confirmation from QR scan
exports.quickConfirmViolation = async (req, res) => {
  try {
    const { violationId } = req.params;
    const { drivingLicenseId, quickConfirm } = req.body;
    const officerId = req.user?.id || 'test-officer-123'; // Default for testing

    if (!quickConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Quick confirmation flag required'
      });
    }

    // Use existing confirmation service
    const result = await policeConfirmationService.confirmDriver(
      violationId,
      drivingLicenseId,
      officerId,
      { quickConfirm: true }
    );

    res.json({
      ...result,
      message: 'Violation confirmed via QR scan'
    });

  } catch (error) {
    console.error('❌ Error in quick confirm:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get dashboard statistics for officer dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const Vehicle = require('../models/Vehicle');
    
    // Get active IoT devices count
    const activeDevices = await Vehicle.countDocuments({ 
      iotDeviceId: { $exists: true, $ne: null },
      status: "active"
    });

    // Get today's violations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayViolations = await Violation.countDocuments({
      timestamp: { $gte: today, $lt: tomorrow }
    });

    // Get pending confirmations
    const pendingFines = await Violation.countDocuments({
      status: "confirmed",
      meritPointsApplied: true
    });

    // Get total fines amount (confirmed violations only)
    const confirmedViolations = await Violation.find({
      status: "confirmed",
      finalFine: { $exists: true }
    });

    const totalRevenue = confirmedViolations.reduce((sum, violation) => {
      return sum + (violation.finalFine || 0);
    }, 0);

    res.json({
      activeDevices,
      todayViolations,
      pendingFines,
      revenue: totalRevenue
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};