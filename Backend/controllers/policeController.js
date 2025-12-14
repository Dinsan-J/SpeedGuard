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
    const officerId = req.user?.id; // Assuming authentication middleware sets req.user

    if (!officerId) {
      return res.status(401).json({
        success: false,
        message: 'Officer authentication required'
      });
    }

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
    const officerId = req.user?.id;

    if (!officerId) {
      return res.status(401).json({
        success: false,
        message: 'Officer authentication required'
      });
    }

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
    const officerId = req.user?.id;

    if (!officerId) {
      return res.status(401).json({
        success: false,
        message: 'Officer authentication required'
      });
    }

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