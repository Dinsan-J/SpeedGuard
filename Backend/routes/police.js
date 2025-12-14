const express = require('express');
const router = express.Router();
const policeController = require('../controllers/policeController');

// Middleware to verify police officer role (placeholder - implement based on your auth system)
const verifyOfficer = (req, res, next) => {
  // This should verify JWT token and check if user has 'officer' role
  // For now, we'll assume the user is authenticated and is an officer
  // In production, implement proper JWT verification
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'officer') {
    return res.status(403).json({
      success: false,
      message: 'Police officer access required'
    });
  }
  
  next();
};

// Get pending violations awaiting confirmation
router.get('/violations/pending', verifyOfficer, policeController.getPendingViolations);

// Get high-risk violations requiring immediate attention
router.get('/violations/high-risk', verifyOfficer, policeController.getHighRiskViolations);

// Confirm driver for a specific violation
router.post('/violations/:violationId/confirm', verifyOfficer, policeController.confirmDriver);

// Dispute a violation
router.post('/violations/:violationId/dispute', verifyOfficer, policeController.disputeViolation);

// Cancel a violation
router.post('/violations/:violationId/cancel', verifyOfficer, policeController.cancelViolation);

// Get violation statistics
router.get('/stats/violations', verifyOfficer, policeController.getViolationStats);

// Search drivers by license ID or name
router.get('/drivers/search', verifyOfficer, policeController.searchDrivers);

// Get detailed driver information and violation history
router.get('/drivers/:licenseId', verifyOfficer, policeController.getDriverDetails);

// Get high-risk drivers requiring attention
router.get('/drivers/high-risk', verifyOfficer, policeController.getHighRiskDrivers);

// QR Code Scanner Routes
router.get('/scan/:vehicleId', verifyOfficer, policeController.scanVehicleQR);
router.post('/violations/:violationId/quick-confirm', verifyOfficer, policeController.quickConfirmViolation);

module.exports = router;