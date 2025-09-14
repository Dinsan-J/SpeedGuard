const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

// Get all violations with speed above 70
router.get("/", async (req, res) => {
  try {
    const violations = await Violation.find({ speed: { $gt: 70 } }).sort({
      timestamp: -1,
    }); // return all, newest first
    res.json({ success: true, violations });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching violations" });
  }
});

module.exports = router;
