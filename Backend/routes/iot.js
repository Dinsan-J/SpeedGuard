const express = require("express");
const router = express.Router();
const iotController = require("../controllers/iotController");

// POST /api/iot/data - Receive data from IoT device
router.post("/data", iotController.receiveIoTData);

// GET /api/iot/vehicle/:vehicleId - Get real-time vehicle data
router.get("/vehicle/:vehicleId", iotController.getVehicleRealTimeData);

module.exports = router;
