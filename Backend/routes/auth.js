const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const registrationController = require("../controllers/registrationController");

router.post("/register", registrationController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
