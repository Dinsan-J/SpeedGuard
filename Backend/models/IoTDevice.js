const mongoose = require("mongoose");

const iotDeviceSchema = new mongoose.Schema({
  // Device Identification
  deviceId: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
  },
  deviceType: {
    type: String,
    enum: ['ESP32', 'Arduino', 'RaspberryPi', 'Custom'],
    default: 'ESP32'
  },
  
  // Hardware Information
  hardwareVersion: String,
  firmwareVersion: String,
  macAddress: { 
    type: String, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(v);
      },
      message: 'Invalid MAC address format'
    }
  },
  
  // Assignment Information
  assignedVehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vehicle",
    default: null
  },
  assignedDate: Date,
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who assigned
  
  // Device Status
  status: {
    type: String,
    enum: ['available', 'assigned', 'active', 'inactive', 'maintenance', 'damaged'],
    default: 'available'
  },
  isOnline: { type: Boolean, default: false },
  lastSeen: Date,
  lastHeartbeat: Date,
  
  // Location and Connectivity
  lastKnownLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date
  },
  networkInfo: {
    signalStrength: Number, // RSSI value
    networkType: String, // WiFi, 4G, etc.
    ipAddress: String
  },
  
  // Configuration
  configuration: {
    reportingInterval: { type: Number, default: 5000 }, // milliseconds
    speedThreshold: { type: Number, default: 70 }, // km/h
    gpsAccuracy: { type: Number, default: 5 }, // meters
    batteryThreshold: { type: Number, default: 20 }, // percentage
  },
  
  // Performance Metrics
  metrics: {
    totalDataPoints: { type: Number, default: 0 },
    totalViolationsDetected: { type: Number, default: 0 },
    uptime: { type: Number, default: 0 }, // hours
    batteryLevel: Number, // percentage
    temperature: Number, // Celsius
  },
  
  // Maintenance Information
  maintenance: {
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    maintenanceNotes: String,
    warrantyExpiry: Date
  },
  
  // Installation Information
  installation: {
    installationDate: Date,
    installedBy: String,
    installationNotes: String,
    calibrationData: {
      gpsOffset: { lat: Number, lng: Number },
      speedCalibration: Number,
      lastCalibrated: Date
    }
  },
  
  // Security
  security: {
    encryptionKey: String,
    lastKeyRotation: Date,
    accessToken: String,
    tokenExpiry: Date
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
iotDeviceSchema.index({ deviceId: 1 });
iotDeviceSchema.index({ assignedVehicle: 1 });
iotDeviceSchema.index({ status: 1 });
iotDeviceSchema.index({ isOnline: 1 });
iotDeviceSchema.index({ lastSeen: -1 });

// Middleware to update timestamps
iotDeviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to assign device to vehicle
iotDeviceSchema.methods.assignToVehicle = function(vehicleId, assignedBy) {
  if (this.status !== 'available') {
    throw new Error('Device is not available for assignment');
  }
  
  this.assignedVehicle = vehicleId;
  this.assignedDate = new Date();
  this.assignedBy = assignedBy;
  this.status = 'assigned';
  
  return this.save();
};

// Method to unassign device from vehicle
iotDeviceSchema.methods.unassignFromVehicle = function() {
  this.assignedVehicle = null;
  this.assignedDate = null;
  this.status = 'available';
  
  return this.save();
};

// Method to update device status
iotDeviceSchema.methods.updateStatus = function(isOnline, location = null, metrics = {}) {
  this.isOnline = isOnline;
  this.lastSeen = new Date();
  
  if (isOnline) {
    this.lastHeartbeat = new Date();
    this.status = this.assignedVehicle ? 'active' : 'assigned';
  } else {
    this.status = this.assignedVehicle ? 'inactive' : 'available';
  }
  
  if (location) {
    this.lastKnownLocation = {
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date()
    };
  }
  
  // Update metrics
  if (metrics.batteryLevel !== undefined) this.metrics.batteryLevel = metrics.batteryLevel;
  if (metrics.temperature !== undefined) this.metrics.temperature = metrics.temperature;
  if (metrics.signalStrength !== undefined) this.networkInfo.signalStrength = metrics.signalStrength;
  
  return this.save();
};

// Method to record violation detection
iotDeviceSchema.methods.recordViolationDetection = function() {
  this.metrics.totalViolationsDetected += 1;
  this.metrics.totalDataPoints += 1;
  return this.save();
};

// Static method to find available devices
iotDeviceSchema.statics.findAvailableDevices = function() {
  return this.find({ status: 'available' }).sort({ createdAt: -1 });
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