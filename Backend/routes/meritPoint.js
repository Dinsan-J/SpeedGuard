const express = require('express');
const router = express.Router();
const meritPointController = require('../controllers/meritPointController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// User routes
router.get('/status', meritPointController.getUserMeritStatus);
router.get('/history/:userId', meritPointController.getMeritPointHistory);
router.get('/history', meritPointController.getMeritPointHistory);
router.put('/vehicle-type', meritPointController.updateVehicleType);

// Officer routes
router.post('/apply-penalty', meritPointController.applyViolationPenalty);
router.get('/statistics', meritPointController.getSystemStatistics);

// System/Admin routes
router.post('/process-recovery', meritPointController.processWeeklyRecovery);

module.exports = router;