const express = require('express');
const router = express.Router();
const qrScanController = require('../controllers/qrScanController');
const auth = require('../middleware/auth');

// QR Code Generation (Driver)
router.get('/generate/:vehicleId', auth, qrScanController.generateVehicleQR);

// QR Code Scanning (Officer)
router.post('/scan', auth, qrScanController.scanVehicleQR);

// Merit Point Application (Officer)
router.post('/verify-merit-points', auth, qrScanController.verifyAndApplyMeritPoints);

// Pending Violations (Officer)
router.get('/pending-violations', auth, qrScanController.getPendingViolations);

module.exports = router;