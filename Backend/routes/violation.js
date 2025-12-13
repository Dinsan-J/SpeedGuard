const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");
const geofencingService = require("../services/geofencingService");

// Get all violations with optional filtering
router.get("/", async (req, res) => {
  try {
    const { 
      minSpeed = 70, 
      zoneType, 
      isInZone, 
      limit = 100, 
      page = 1,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { speed: { $gt: parseInt(minSpeed) } };
    
    if (zoneType) {
      filter['sensitiveZone.zoneType'] = zoneType;
    }
    
    if (isInZone !== undefined) {
      filter['sensitiveZone.isInZone'] = isInZone === 'true';
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const violations = await Violation.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Violation.countDocuments(filter);

    res.json({ 
      success: true, 
      violations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('❌ Error fetching violations:', err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching violations",
      error: err.message 
    });
  }
});

// Get violation statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await Violation.aggregate([
      { $match: { speed: { $gt: 70 } } },
      {
        $group: {
          _id: null,
          totalViolations: { $sum: 1 },
          avgSpeed: { $avg: "$speed" },
          avgFine: { $avg: "$fine" },
          totalFines: { $sum: "$fine" },
          maxSpeed: { $max: "$speed" },
          violationsInZones: {
            $sum: { $cond: ["$sensitiveZone.isInZone", 1, 0] }
          }
        }
      }
    ]);

    const zoneStats = await Violation.aggregate([
      { 
        $match: { 
          speed: { $gt: 70 },
          "sensitiveZone.isInZone": true 
        } 
      },
      {
        $group: {
          _id: "$sensitiveZone.zoneType",
          count: { $sum: 1 },
          avgFine: { $avg: "$fine" },
          avgSpeed: { $avg: "$speed" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {},
        byZoneType: zoneStats
      }
    });
  } catch (err) {
    console.error('❌ Error fetching violation stats:', err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching violation statistics",
      error: err.message
    });
  }
});

// Get violation by ID
router.get("/:id", async (req, res) => {
  try {
    const violation = await Violation.findById(req.params.id);
    
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: "Violation not found"
      });
    }

    res.json({
      success: true,
      violation
    });
  } catch (err) {
    console.error('❌ Error fetching violation:', err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching violation",
      error: err.message
    });
  }
});

module.exports = router;
