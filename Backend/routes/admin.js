const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Admin authentication middleware
router.use(auth);
router.use(adminAuth);

// IoT Device Management
router.post('/devices/register', adminController.registerIoTDevice);
router.get('/devices', adminController.getAllIoTDevices);
router.get('/devices/available', adminController.getAvailableDevices);
router.put('/devices/status', adminController.updateDeviceStatus);

// Vehicle-Device Assignment
router.post('/devices/assign', adminController.assignDeviceToVehicle);
router.post('/devices/unassign', adminController.unassignDeviceFromVehicle);
router.get('/vehicles/unassigned', adminController.getUnassignedVehicles);

// System Statistics
router.get('/statistics', adminController.getSystemStatistics);

module.exports = router;