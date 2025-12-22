const mongoose = require("mongoose");

const iotDeviceSchema = new mongoose.Schema({
  // Device Identification (Primary Key)
  deviceId: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // ESP32 device ID format validation (MAC address or custom format)
        return /^ESP32_[A-Z0-9]{6,12}$|^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(v);
      },
      message: 'Invalid ESP32 device ID format'
    }
  },
  
  // Device Hardware Information
  deviceType: {
    type: String,
    enum: ['ESP32', 'ESP32-S2', 'ESP32-S3', 'ESP32-C3'],
    default: 'ESP32'
  },
  macAddress: { 
    type: String, 
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/undefined
        return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(v);
      },
      message: 'Invalid MAC address format'
    }
  },
  firmwareVersion: String,
  hardwareVersion: String,
  
  // Device Status (Core State Management)
  status: {
    type: String,
    enum: ['unassigned', 'assigned', 'active', 'inactive', 'maintenance', 'damaged'],
    default: 'unassigned',
    required: true
  },
  
  // Vehicle Assignment (One-to-One Mapping)
  assignedVehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vehicle",
    default: null
  },
  assignmentDate: Date,
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who assigned
  
  // Real-time Status
  isOnline: { type: Boolean, default: false },
  lastSeen: Date,
  lastHeartbeat: Date,
  
  // GPS and Location Data
  lastKnownLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number, // GPS accuracy in meters
    timestamp: Date
  },
  
  // Network and Connectivity
  networkInfo: {
    signalStrength: Number, // RSSI value
    networkType: String, // WiFi, 4G, etc.
    ipAddress: String,
    connectionQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  },
  
  // Device Configuration
  configuration: {
    reportingInterval: { type: Number, default: 5000 }, // milliseconds
    gpsAccuracy: { type: Number, default: 5 }, // meters
    speedThreshold: { type: Number, default: 70 }, // km/h for alerts
    batteryThreshold: { type: Number, default: 20 }, // percentage
    enableGeofencing: { type: Boolean, default: true }
  },
  
  // Performance Metrics
  metrics: {
    totalDataPoints: { type: Number, default: 0 },
    totalViolationsDetected: { type: Number, default: 0 },
    uptime: { type: Number, default: 0 }, // hours
    batteryLevel: Number, // percentage
    temperature: Number, // Celsius
    dataTransmissionErrors: { type: Number, default: 0 },
    lastCalibrationDate: Date
  },
  
  // Maintenance and Support
  maintenance: {
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    maintenanceNotes: String,
    warrantyExpiry: Date,
    installationDate: Date,
    installedBy: String
  },
  
  // Security and Authentication
  security: {
    apiKey: String, // For device authentication
    lastKeyRotation: Date,
    encryptionEnabled: { type: Boolean, default: false },
    tamperDetection: { type: Boolean, default: false }
  },
  
  // Admin Notes
  notes: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
iotDeviceSchema.index({ deviceId: 1 });
iotDeviceSchema.index({ status: 1 });
iotDeviceSchema.index({ assignedVehicleId: 1 });
iotDeviceSchema.index({ isOnline: 1 });
iotDeviceSchema.index({ lastSeen: -1 });

// Middleware to update timestamps
iotDeviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to assign device to vehicle
iotDeviceSchema.methods.assignToVehicle = function(vehicleId, assignedBy) {
  if (this.status !== 'unassigned') {
    throw new Error(`Device is currently ${this.status} and cannot be assigned`);
  }
  
  this.assignedVehicleId = vehicleId;
  this.assignmentDate = new Date();
  this.assignedBy = assignedBy;
  this.status = 'assigned';
  
  return this.save();
};

// Method to unassign device from vehicle
iotDeviceSchema.methods.unassignFromVehicle = function() {
  this.assignedVehicleId = null;
  this.assignmentDate = null;
  this.assignedBy = null;
  this.status = 'unassigned';
  
  return this.save();
};

// Method to update device status and location
iotDeviceSchema.methods.updateStatus = function(data) {
  const { latitude, longitude, speed, batteryLevel, temperature, signalStrength } = data;
  
  // Update online status
  this.isOnline = true;
  this.lastSeen = new Date();
  this.lastHeartbeat = new Date();
  
  // Update location if provided
  if (latitude && longitude) {
    this.lastKnownLocation = {
      latitude,
      longitude,
      accuracy: data.accuracy || 5,
      timestamp: new Date()
    };
  }
  
  // Update metrics
  this.metrics.totalDataPoints += 1;
  if (batteryLevel !== undefined) this.metrics.batteryLevel = batteryLevel;
  if (temperature !== undefined) this.metrics.temperature = temperature;
  if (signalStrength !== undefined) this.networkInfo.signalStrength = signalStrength;
  
  // Update status based on activity
  if (this.assignedVehicleId && this.status === 'assigned') {
    this.status = 'active';
  }
  
  return this.save();
};

// Method to record violation detection
iotDeviceSchema.methods.recordViolationDetection = function() {
  this.metrics.totalViolationsDetected += 1;
  return this.save();
};

// Static method to find available devices
iotDeviceSchema.statics.findAvailableDevices = function() {
  return this.find({ status: 'unassigned' }).sort({ createdAt: -1 });
};

// Static method to find devices by status
iotDeviceSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ updatedAt: -1 });
};

// Static method to find offline devices
iotDeviceSchema.statics.findOfflineDevices = function(minutesThreshold = 10) {
  const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
  return this.find({
    $or: [
      { lastSeen: { $lt: thresholdTime } },
      { isOnline: false }
    ],
    status: { $in: ['assigned', 'active'] }
  });
};

// Static method to find devices needing maintenance
iotDeviceSchema.statics.findDevicesNeedingMaintenance = function() {
  const now = new Date();
  return this.find({
    $or: [
      { 'maintenance.nextMaintenanceDate': { $lte: now } },
      { 'metrics.batteryLevel': { $lte: 20 } },
      { status: 'maintenance' }
    ]
  });
};

module.exports = mongoose.model("IoTDevice", iotDeviceSchema);