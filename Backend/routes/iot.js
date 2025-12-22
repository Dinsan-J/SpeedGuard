const express = require('express');
const router = express.Router();
const iotDataController = require('../controllers/iotDataController');
const auth = require('../middleware/auth');

// IoT Data Ingestion Routes (No auth required for ESP32 devices)
router.post('/data', iotDataController.ingestIoTData);
router.post('/heartbeat', iotDataController.deviceHeartbeat);

// Device Status Routes (Auth required)
router.get('/device/:deviceId/status', auth, iotDataController.getDeviceStatus);

module.exports = router;