const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Violation = require("../models/Violation");
const IoTDevice = require("../models/IoTDevice");
const mongoose = require("mongoose");

const SPEED_LIMITS = {
  motorcycle: 70,
  light_vehicle: 70,
  three_wheeler: 50,
  heavy_vehicle: 50,
};

const resolveDriverRef = (user) => {
  if (user && user.driverProfile && user.driverProfile._id) {
    return user.driverProfile._id;
  }
  return user ? user._id : null;
};

// Add vehicle
router.post("/add", async (req, res) => {
  try {
    const { userId, vehicleData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: userId",
      });
    }

    if (!vehicleData || typeof vehicleData !== "object") {
      return res.status(400).json({
        success: false,
        message: "Missing required field: vehicleData",
      });
    }

    if (!vehicleData.vehicleNumber || !vehicleData.vehicleType) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number and type are required",
      });
    }

    // Find the user and their driver profile
    const user = await User.findById(userId).populate('driverProfile');
    if (!user || user.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: "User must be a driver to add vehicles"
      });
    }
    const driverRef = resolveDriverRef(user);

    // Check if vehicle number already exists
    if (vehicleData.vehicleNumber) {
      const existingVehicle = await Vehicle.findOne({
        vehicleNumber: vehicleData.vehicleNumber.toUpperCase()
      });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: "Vehicle with this number already exists"
        });
      }
    }

    // If iotDeviceId is provided, it's expected to be an IoTDevice.deviceId (ESP32 id string)
    let resolvedIoTDevice = null;
    const iotDeviceIdentifier = vehicleData?.iotDeviceId;
    if (iotDeviceIdentifier) {
      resolvedIoTDevice = await IoTDevice.findOne({
        deviceId: String(iotDeviceIdentifier).toUpperCase(),
      });

      if (!resolvedIoTDevice) {
        return res.status(400).json({
          success: false,
          message: "IoT device is not registered in system",
        });
      }

      if (resolvedIoTDevice.assignedVehicleId) {
        return res.status(400).json({
          success: false,
          message: "This IoT device is already assigned to another vehicle",
        });
      }
    }

    // Create vehicle with proper driver reference
    // Note: Vehicle schema expects iotDeviceId as an ObjectId, but frontend sends deviceId string.
    const vehiclePayload = { ...vehicleData };
    delete vehiclePayload.iotDeviceId;
    if (resolvedIoTDevice) {
      vehiclePayload.iotDeviceId = resolvedIoTDevice._id;
    }

    const vehicle = new Vehicle({
      ...vehiclePayload,
      driverId: driverRef,
      vehicleNumber: vehicleData.vehicleNumber.toUpperCase(),
      speedLimit: SPEED_LIMITS[vehicleData.vehicleType],
      registrationDate: new Date(),
      // Set default expiry dates if not provided
      registrationExpiry: vehicleData.registrationExpiry
        ? new Date(vehicleData.registrationExpiry)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      insuranceExpiry: vehicleData.insuranceExpiry
        ? new Date(vehicleData.insuranceExpiry)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    });

    await vehicle.save();

    // If IoT device was provided, connect it to this newly created vehicle (one-to-one)
    if (resolvedIoTDevice) {
      resolvedIoTDevice.assignedVehicleId = vehicle._id;
      resolvedIoTDevice.status = "assigned";
      resolvedIoTDevice.assignmentDate = new Date();
      resolvedIoTDevice.assignedBy = user._id;
      await resolvedIoTDevice.save();
    }

    console.log(`✅ Vehicle added: ${vehicle.vehicleNumber} (${vehicle.vehicleType}) - Speed Limit: ${vehicle.speedLimit} km/h`);

    res.json({ success: true, vehicle });
  } catch (err) {
    console.log("Add vehicle error:", err);

    // Make the error visible to the frontend (instead of a generic 500),
    // so we can debug issues like CastError / ValidationError quickly.
    if (err && err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid id format",
        error: err.message,
      });
    }

    if (err && err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Vehicle validation failed",
        error: err.message,
      });
    }

    if (err && err.code === 11000) {
      const keyPattern = err.keyPattern || {};
      const keyValue = err.keyValue || {};
      const dupField =
        Object.keys(keyPattern)[0] ||
        Object.keys(keyValue)[0] ||
        "unknown_field";

      const dupValRaw = keyValue[dupField];
      const dupVal =
        dupValRaw === undefined || dupValRaw === null
          ? ""
          : String(dupValRaw).slice(0, 80);

      return res.status(400).json({
        success: false,
        message: dupVal
          ? `Duplicate key error: ${dupField}=${dupVal}`
          : `Duplicate key error: ${dupField}`,
        error: err.message,
        keyPattern,
        keyValue,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error adding vehicle",
      error: err && err.message ? err.message : String(err),
    });
  }
});

// Delete vehicle
router.delete("/delete/:vehicleId", async (req, res) => {
  try {
    const { userId } = req.body;
    const { vehicleId } = req.params;
    await Vehicle.findByIdAndDelete(vehicleId);
    await User.findByIdAndUpdate(userId, { $pull: { vehicles: vehicleId } });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete vehicle error:", err);
    res.status(500).json({ success: false, message: "Error deleting vehicle" });
  }
});

// Get user vehicles
router.get("/user/:userId", async (req, res) => {
  try {
    // Find the user and their driver profile
    const user = await User.findById(req.params.userId).populate('driverProfile');
    if (!user || user.role !== 'driver') {
      return res.json({ success: true, vehicles: [] });
    }
    const driverRef = resolveDriverRef(user);

    // Find vehicles by driver profile ID or fallback user ID
    const vehicles = await Vehicle.find({ driverId: driverRef });

    // IMPORTANT: Some older records might not have `vehicle.iotDeviceId` set.
    // So we derive IoT status by looking up IoTDevice.assignedVehicleId.
    const vehiclesWithIot = await Promise.all(
      vehicles.map(async (vehicle) => {
        const v = vehicle.toObject();

        // Ensure frontend-friendly id + plate fields are always present
        // (`UserVehicles` expects `id` and `plateNumber`).
        v.id = v.id || String(v._id);
        v.plateNumber = v.plateNumber || v.vehicleNumber;

        const iot = await IoTDevice.findOne({
          assignedVehicleId: vehicle._id,
        });

        if (iot) {
          v.iotDeviceId = iot.deviceId; // frontend expects string deviceId
          v.iotOnline = !!iot.isOnline;
          v.iotLastHeartbeat = iot.lastHeartbeat;
        } else {
          v.iotOnline = false;
          v.iotLastHeartbeat = null;
        }

        return v;
      })
    );

    res.json({ success: true, vehicles: vehiclesWithIot });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching vehicles" });
  }
});

// Add violation to vehicle
router.post("/violation/:plateNumber", async (req, res) => {
  try {
    const { plateNumber } = req.params;
    const violationData = req.body;

    const vehicle = await Vehicle.findOne({ plateNumber });
    if (!vehicle)
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });

    const violation = new Violation({
      ...violationData,
      vehicleId: vehicle._id,
    });
    await violation.save();

    vehicle.violations.push(violation._id);
    vehicle.lastViolation = violation.timestamp;
    await vehicle.save();

    res.json({ success: true, violation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get vehicle by plate + violations
router.get("/plate/:plateNumber", async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      plateNumber: req.params.plateNumber,
    });
    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }
    // Fetch violations for this vehicle using ObjectId
    const violations = await Violation.find({ vehicleId: vehicle._id });

    // Calculate fine for each violation
    const violationsWithFines = violations.map(v => {
      const speedLimit = 70;
      const speedExcess = v.speed - speedLimit;
      const calculatedFine = 1500 + Math.floor(speedExcess / 5) * 300;
      return {
        ...v.toObject(),
        fine: calculatedFine
      };
    });

    res.json({ success: true, vehicle: { ...vehicle.toObject(), violations: violationsWithFines } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get vehicle by ID + violations
router.get("/:vehicleId", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId).populate(
      "violations"
    );
    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }
    res.json({ success: true, vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get active IoT vehicles for officer dashboard
router.get("/active-iot-vehicles", async (req, res) => {
  try {
    const ONLINE_TTL_MS = 2 * 60 * 1000; // 2 minutes
    const cutoff = new Date(Date.now() - ONLINE_TTL_MS);

    // Devices that are "connected" (sent data recently) and assigned to exactly one vehicle
    const onlineDevices = await IoTDevice.find({
      assignedVehicleId: { $ne: null },
      isOnline: true,
      lastHeartbeat: { $gte: cutoff }
    }).sort({ lastHeartbeat: -1 });

    const vehicleIds = Array.from(
      new Set(onlineDevices.map((d) => d.assignedVehicleId.toString()))
    );

    const vehicles = await Vehicle.find({
      _id: { $in: vehicleIds },
    }).populate("driverId", "fullName licenseNumber");

    const vehicleById = new Map(
      vehicles.map((v) => [v._id.toString(), v])
    );

    const payload = onlineDevices
      .map((device) => {
        const vehicle = vehicleById.get(device.assignedVehicleId.toString());
        if (!vehicle) return null;

        return {
          _id: vehicle._id,
          plateNumber: vehicle.vehicleNumber,
          make: vehicle.make,
          model: vehicle.model,
          year: String(vehicle.year),
          color: vehicle.color,
          status: vehicle.status,
          owner: {
            username:
              vehicle.driverId?.fullName ||
              vehicle.driverId?.licenseNumber ||
              "Unknown",
          },
          iotDeviceId: device.deviceId,
          currentSpeed: vehicle.currentSpeed,
          currentLocation: vehicle.currentLocation
            ? {
              lat: vehicle.currentLocation.latitude,
              lng: vehicle.currentLocation.longitude,
            }
            : null,
          lastUpdated:
            vehicle.lastLocationUpdate ||
            device.lastHeartbeat ||
            vehicle.updatedAt ||
            new Date(0),
          speedLimit: vehicle.speedLimit,
        };
      })
      .filter(Boolean);

    res.json(payload);
  } catch (err) {
    console.error("Get active IoT vehicles error:", err);
    res.status(500).json({ success: false, message: "Error fetching active vehicles" });
  }
});

// Check if device exists
router.get("/check-device/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await IoTDevice.findOne({ deviceId: deviceId.toUpperCase() });

    if (!device || !device.assignedVehicleId) {
      return res.json({
        success: true,
        exists: false,
        vehicle: null,
      });
    }

    const vehicle = await Vehicle.findById(device.assignedVehicleId);

    res.json({
      success: true,
      exists: !!vehicle,
      vehicle: vehicle
        ? {
          id: vehicle._id,
          vehicleNumber: vehicle.vehicleNumber,
          vehicleType: vehicle.vehicleType,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
        }
        : null,
    });
  } catch (err) {
    console.error("Check device error:", err);
    res.status(500).json({ success: false, message: "Error checking device" });
  }
});

// Connect existing vehicle to user
router.post("/connect", async (req, res) => {
  try {
    const { userId, deviceId } = req.body;

    // Find the user and their driver profile
    const user = await User.findById(userId).populate('driverProfile');
    if (!user || user.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: "User must be a driver to connect vehicles"
      });
    }
    const driverRef = resolveDriverRef(user);

    // Find IoT device by its deviceId (ESP32 id string)
    const device = await IoTDevice.findOne({
      deviceId: String(deviceId).toUpperCase(),
    });

    if (!device || !device.assignedVehicleId) {
      return res.status(404).json({
        success: false,
        message: "IoT device is not assigned to any vehicle",
      });
    }

    // Vehicle assigned to this IoT device
    const vehicle = await Vehicle.findById(device.assignedVehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Assigned vehicle not found",
      });
    }

    // Ensure the vehicle points to this IoT device too (so UI can show heartbeat status)
    if (!vehicle.iotDeviceId || vehicle.iotDeviceId.toString() !== device._id.toString()) {
      vehicle.iotDeviceId = device._id;
      await vehicle.save();
    }

    // Ensure one-to-one linkage is consistent both directions
    if (!device.assignedVehicleId || device.assignedVehicleId.toString() !== vehicle._id.toString()) {
      device.assignedVehicleId = vehicle._id;
      device.status = "assigned";
      await device.save();
    }

    // Check if vehicle is already connected to another driver
    if (vehicle.driverId && vehicle.driverId.toString() !== driverRef.toString()) {
      return res.status(400).json({
        success: false,
        message: "This vehicle is already connected to another driver"
      });
    }

    // Connect vehicle to driver
    vehicle.driverId = driverRef;
    await vehicle.save();

    // Mark device as active (it is still one-to-one with this vehicle)
    device.status = "active";
    await device.save();

    console.log(`✅ Vehicle connected: ${vehicle.vehicleNumber} to driver ${user.username}`);

    res.json({ success: true, vehicle });
  } catch (err) {
    console.error("Connect vehicle error:", err);
    res.status(500).json({ success: false, message: "Error connecting vehicle" });
  }
});

// Register new vehicle from QR scan
router.post("/register", async (req, res) => {
  try {
    const { userId, vehicleData } = req.body;

    // Find the user and their driver profile
    const user = await User.findById(userId).populate('driverProfile');
    if (!user || user.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: "User must be a driver to register vehicles"
      });
    }
    const driverRef = resolveDriverRef(user);

    // Check if vehicle number already exists
    if (vehicleData.vehicleNumber) {
      const existingVehicle = await Vehicle.findOne({
        vehicleNumber: vehicleData.vehicleNumber.toUpperCase()
      });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: "Vehicle with this number already exists"
        });
      }
    }

    // If iotDeviceId is provided, it's expected to be an IoTDevice.deviceId (ESP32 id string)
    let resolvedIoTDevice = null;
    if (vehicleData.iotDeviceId) {
      resolvedIoTDevice = await IoTDevice.findOne({
        deviceId: String(vehicleData.iotDeviceId).toUpperCase(),
      });

      if (!resolvedIoTDevice) {
        return res.status(400).json({
          success: false,
          message: "IoT device is not registered in system",
        });
      }

      if (resolvedIoTDevice.assignedVehicleId) {
        return res.status(400).json({
          success: false,
          message: "This IoT device is already assigned to another vehicle",
        });
      }
    }

    // Create new vehicle
    const vehiclePayload = { ...vehicleData };
    delete vehiclePayload.iotDeviceId;

    if (resolvedIoTDevice) {
      vehiclePayload.iotDeviceId = resolvedIoTDevice._id;
    }

    const vehicle = new Vehicle({
      ...vehiclePayload,
      driverId: driverRef,
      vehicleNumber: vehicleData.vehicleNumber.toUpperCase(),
      speedLimit: SPEED_LIMITS[vehicleData.vehicleType],
      registrationDate: new Date(),
      registrationExpiry: new Date(vehicleData.registrationExpiry),
      insuranceExpiry: new Date(vehicleData.insuranceExpiry),
    });

    await vehicle.save();

    // Connect IoT device to this newly created vehicle (one-to-one)
    if (resolvedIoTDevice) {
      resolvedIoTDevice.assignedVehicleId = vehicle._id;
      resolvedIoTDevice.status = "assigned";
      resolvedIoTDevice.assignmentDate = new Date();
      resolvedIoTDevice.assignedBy = user._id;
      await resolvedIoTDevice.save();
    }

    console.log(`✅ Vehicle registered: ${vehicle.vehicleNumber} (${vehicle.vehicleType}) - Speed Limit: ${vehicle.speedLimit} km/h`);

    res.json({ success: true, vehicle });
  } catch (err) {
    console.error("Register vehicle error:", err);
    res.status(500).json({ success: false, message: "Error registering vehicle" });
  }
});

module.exports = router;
