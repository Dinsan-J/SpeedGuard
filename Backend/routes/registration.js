const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Registration routes
router.post('/register', registrationController.register);
router.get('/registration-requirements', registrationController.getRegistrationRequirements);
router.post('/validate-registration', registrationController.validateRegistrationData);

module.exports = router;