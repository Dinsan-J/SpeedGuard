const IoTDevice = require('../models/IoTDevice');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Violation = require('../models/Violation');

/**
 * Register new IoT device (Admin only)
 */
exports.registerIoTDevice = async (req, res) => {
  try {
    const { deviceId, deviceType, macAddress, firmwareVersion, hardwareVersion, notes } = req.body;

    // Validate required fields
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    // Check if device already exists
    const existingDevice = await IoTDevice.findOne({ deviceId: deviceId.toUpperCase() });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'Device with this ID already exists'
      });
    }

    // Create new IoT device
    const device = new IoTDevice({
      deviceId: deviceId.toUpperCase(),
      deviceType: deviceType || 'ESP32',
      macAddress,
      firmwareVersion,
      hardwareVersion,
      status: 'unassigned',
      notes,
      security: {
        apiKey: generateApiKey(),
        lastKeyRotation: new Date()
      }
    });

    await device.save();

    console.log(`✅ IoT Device registered: ${device.deviceId}`);

    res.status(201).json({
      success: true,
      message: 'IoT device registered successfully',
      data: {
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        status: device.status,
        apiKey: device.security.apiKey,
        createdAt: device.createdAt
      }
    });

  } catch (error) {
    console.error('Error registering IoT device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register IoT device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all IoT devices with status
 */
exports.getAllIoTDevices = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const devices = await IoTDevice.find(filter)
      .populate('assignedVehicleId', 'vehicleNumber vehicleType driverId')
      .populate({
        path: 'assignedVehicleId',
        populate: {
          path: 'driverId',
          select: 'fullName licenseNumber'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await IoTDevice.countDocuments(filter);

    res.json({
      success: true,
      data: {
        devices,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting IoT devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get IoT devices'
    });
  }
};

/**
 * Assign IoT device to vehicle
 */
exports.assignDeviceToVehicle = async (req, res) => {
  try {
    const { deviceId, vehicleId } = req.body;
    const adminId = req.user.id;

    // Validate inputs
    if (!deviceId || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID and Vehicle ID are required'
      });
    }

    // Find device
    const device = await IoTDevice.findOne({ deviceId: deviceId.toUpperCase() });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'IoT device not found'
      });
    }

    // Check device status
    if (device.status !== 'unassigned') {
      return res.status(400).json({
        success: false,
        message: `Device is currently ${device.status} and cannot be assigned`
      });
    }

    // Find vehicle
    const vehicle = await Vehicle.findById(vehicleId).populate('driverId');
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle already has a device
    if (vehicle.iotDeviceId) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle already has an IoT device assigned'
      });
    }

    // Assign device to vehicle
    await device.assignToVehicle(vehicle._id, adminId);
    await vehicle.assignIoTDevice(device._id, adminId);

    console.log(`✅ Device ${device.deviceId} assigned to vehicle ${vehicle.vehicleNumber}`);

    res.json({
      success: true,
      message: 'Device assigned to vehicle successfully',
      data: {
        deviceId: device.deviceId,
        vehicleNumber: vehicle.vehicleNumber,
        driverName: vehicle.driverId.fullName,
        driverLicense: vehicle.driverId.licenseNumber,
        assignmentDate: device.assignmentDate
      }
    });

  } catch (error) {
    console.error('Error assigning device to vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign device to vehicle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Unassign IoT device from vehicle
 */
exports.unassignDeviceFromVehicle = async (req, res) => {
  try {
    const { deviceId } = req.body;

    // Find device
    const device = await IoTDevice.findOne({ deviceId: deviceId.toUpperCase() })
      .populate('assignedVehicleId');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'IoT device not found'
      });
    }

    if (!device.assignedVehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Device is not assigned to any vehicle'
      });
    }

    const vehicle = device.assignedVehicleId;

    // Unassign device
    await device.unassignFromVehicle();
    await vehicle.unassignIoTDevice();

    console.log(`✅ Device ${device.deviceId} unassigned from vehicle ${vehicle.vehicleNumber}`);

    res.json({
      success: true,
      message: 'Device unassigned from vehicle successfully',
      data: {
        deviceId: device.deviceId,
        previousVehicle: vehicle.vehicleNumber,
        newStatus: 'unassigned'
      }
    });

  } catch (error) {
    console.error('Error unassigning device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign device'
    });
  }
};

/**
 * Get available devices for assignment
 */
exports.getAvailableDevices = async (req, res) => {
  try {
    const devices = await IoTDevice.findAvailableDevices();

    res.json({
      success: true,
      data: devices.map(device => ({
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        status: device.status,
        isOnline: device.isOnline,
        lastSeen: device.lastSeen,
        createdAt: device.createdAt
      }))
    });

  } catch (error) {
    console.error('Error getting available devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available devices'
    });
  }
};

/**
 * Get vehicles without IoT devices
 */
exports.getUnassignedVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findUnassignedVehicles();

    res.json({
      success: true,
      data: vehicles.map(vehicle => ({
        _id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        speedLimit: vehicle.speedLimit,
        driver: {
          fullName: vehicle.driverId.fullName,
          licenseNumber: vehicle.driverId.licenseNumber
        },
        createdAt: vehicle.createdAt
      }))
    });

  } catch (error) {
    console.error('Error getting unassigned vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unassigned vehicles'
    });
  }
};

/**
 * Update device status
 */
exports.updateDeviceStatus = async (req, res) => {
  try {
    const { deviceId, status, notes } = req.body;

    const device = await IoTDevice.findOne({ deviceId: deviceId.toUpperCase() });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const validStatuses = ['unassigned', 'assigned', 'active', 'inactive', 'maintenance', 'damaged'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    device.status = status;
    if (notes) device.notes = notes;
    await device.save();

    res.json({
      success: true,
      message: 'Device status updated successfully',
      data: {
        deviceId: device.deviceId,
        status: device.status,
        updatedAt: device.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating device status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device status'
    });
  }
};

/**
 * Get system statistics
 */
exports.getSystemStatistics = async (req, res) => {
  try {
    // Device statistics
    const deviceStats = await IoTDevice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Violation statistics
    const violationStats = await Violation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Driver statistics
    const driverStats = await Driver.aggregate([
      {
        $group: {
          _id: '$drivingStatus',
          count: { $sum: 1 },
          avgMeritPoints: { $avg: '$meritPoints' }
        }
      }
    ]);

    // Recent activity
    const recentViolations = await Violation.find()
      .populate('vehicleId', 'vehicleNumber')
      .populate('driverId', 'fullName licenseNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        devices: {
          total: await IoTDevice.countDocuments(),
          byStatus: deviceStats
        },
        violations: {
          total: await Violation.countDocuments(),
          byStatus: violationStats,
          recent: recentViolations
        },
        drivers: {
          total: await Driver.countDocuments(),
          byStatus: driverStats
        },
        vehicles: {
          total: await Vehicle.countDocuments(),
          withDevices: await Vehicle.countDocuments({ iotDeviceId: { $ne: null } }),
          withoutDevices: await Vehicle.countDocuments({ iotDeviceId: null })
        }
      }
    });

  } catch (error) {
    console.error('Error getting system statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system statistics'
    });
  }
};

// Helper function to generate API key
function generateApiKey() {
  return 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = exports;