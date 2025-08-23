const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

// Get recent violations
router.get("/", async (req, res) => {
  try {
    const violations = await Violation.find().sort({ timestamp: -1 }).limit(10);
    res.json({ success: true, violations });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching violations" });
  }
});

module.exports = router;
