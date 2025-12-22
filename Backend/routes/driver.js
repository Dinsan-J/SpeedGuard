const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const auth = require('../middleware/auth');

// Driver Registration (Public)
router.post('/register', driverController.registerDriver);

// Driver Profile Management (Auth required)
router.get('/:licenseNumber/profile', auth, driverController.getDriverProfile);

// Vehicle Management
router.post('/:licenseNumber/vehicles', auth, driverController.addVehicle);
router.get('/:licenseNumber/vehicles', auth, driverController.getDriverVehicles);

// Violation History
router.get('/:licenseNumber/violations', auth, driverController.getDriverViolations);

// IoT Device Assignment Request
router.post('/request-device', auth, driverController.requestDeviceAssignment);

module.exports = router;