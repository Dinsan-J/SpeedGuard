const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");
const geofencingService = require("../services/geofencingService");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const IoTDevice = require("../models/IoTDevice");

const mapStatusForFrontend = (status) => {
  switch (status) {
    case "resolved":
      return "paid";
    case "disputed":
      return "disputed";
    case "verified":
      return "unpaid";
    case "pending_verification":
    case "detected":
    default:
      return "pending";
  }
};

const mapViolationForFrontend = (violationDoc) => {
  const v = violationDoc.toObject ? violationDoc.toObject() : violationDoc;
  const latitude = v.location?.latitude ?? 0;
  const longitude = v.location?.longitude ?? 0;
  const baseFine = 2000;
  const zoneMultiplier = v.sensitiveZone?.isInZone ? 1.5 : 1;
  const riskMultiplier = v.riskLevel === "high" ? 1.5 : v.riskLevel === "medium" ? 1.2 : 1;
  const computedFine = Math.round(baseFine * zoneMultiplier * riskMultiplier);

  return {
    ...v,
    vehicleId: v.vehicleId?.vehicleNumber || String(v.vehicleId || ""),
    location: {
      lat: latitude,
      lng: longitude,
    },
    fine: v.fine || computedFine,
    baseFine,
    zoneMultiplier,
    riskMultiplier,
    predictedFine: v.fine || computedFine,
    status: mapStatusForFrontend(v.status),
    meritPointsDeducted: v.meritPointsToDeduct || 0,
  };
};

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
      .populate("vehicleId", "vehicleNumber")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Violation.countDocuments(filter);

    res.json({ 
      success: true, 
      violations: violations.map(mapViolationForFrontend),
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

// Seed dummy violations in MongoDB for testing/demo
router.post("/seed-dummy", async (req, res) => {
  try {
    let vehicle = await Vehicle.findOne().sort({ createdAt: -1 });
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "No vehicles found. Add a vehicle first before seeding violations.",
      });
    }

    let driverId = vehicle.driverId;
    if (!driverId) {
      const driver = await Driver.findOne().sort({ createdAt: -1 });
      if (!driver) {
        return res.status(400).json({
          success: false,
          message: "No driver found. Create driver data before seeding violations.",
        });
      }
      driverId = driver._id;
    }

    let deviceId = vehicle.iotDeviceId;
    if (!deviceId) {
      let device = await IoTDevice.findOne().sort({ createdAt: -1 });
      if (!device) {
        const generatedId = `ESP32_${Date.now().toString(36).toUpperCase().slice(-8)}`;
        device = await IoTDevice.create({
          deviceId: generatedId,
          status: "active",
          assignedVehicleId: vehicle._id,
          assignmentDate: new Date(),
        });
      }
      deviceId = device._id;
    }

    const speedLimit = vehicle.speedLimit || 70;
    const now = Date.now();
    const samples = [
      { speed: speedLimit + 24, minutesAgo: 30, riskLevel: "high", inZone: true },
      { speed: speedLimit + 12, minutesAgo: 190, riskLevel: "medium", inZone: false },
      { speed: speedLimit + 18, minutesAgo: 540, riskLevel: "medium", inZone: false },
    ];

    const payload = samples.map((sample, idx) => {
      const timestamp = new Date(now - sample.minutesAgo * 60 * 1000);
      const baseFine = 2000;
      const zoneMultiplier = sample.inZone ? 1.5 : 1;
      const riskMultiplier = sample.riskLevel === "high" ? 1.5 : 1.2;
      const fine = Math.round(baseFine * zoneMultiplier * riskMultiplier);
      const speedOverLimit = sample.speed - speedLimit;
      const latBase = 6.9271;
      const lngBase = 79.8612;

      return {
        vehicleId: vehicle._id,
        driverId,
        deviceId,
        location: {
          latitude: latBase + idx * 0.01,
          longitude: lngBase + idx * 0.01,
          accuracy: 5,
          address: "Colombo",
        },
        speed: sample.speed,
        speedLimit,
        speedOverLimit,
        timestamp,
        detectedAt: timestamp,
        violationType: "speed",
        severity: speedOverLimit > 20 ? "serious" : "moderate",
        sensitiveZone: sample.inZone
          ? {
              isInZone: true,
              zoneType: "school",
              zoneName: "Demo School Zone",
              distanceFromZone: 120,
              zoneRadius: 300,
            }
          : { isInZone: false },
        riskScore: sample.riskLevel === "high" ? 0.78 : 0.55,
        riskLevel: sample.riskLevel,
        status: idx === 1 ? "verified" : "detected",
        timeOfDay: "morning",
        weatherConditions: "clear",
        trafficDensity: "moderate",
        meritPointsApplied: idx === 1,
        meritPointsToDeduct: speedOverLimit > 20 ? 20 : 10,
        fine,
      };
    });

    const created = await Violation.insertMany(payload);

    return res.status(201).json({
      success: true,
      message: "Dummy violations saved to MongoDB.",
      count: created.length,
      violations: created.map(mapViolationForFrontend),
    });
  } catch (err) {
    console.error("❌ Error seeding dummy violations:", err.message);
    return res.status(500).json({
      success: false,
      message: "Error seeding dummy violations",
      error: err.message,
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
