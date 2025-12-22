const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  // Vehicle Registration Information (Primary Key)
  vehicleNumber: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Sri Lankan vehicle number plate validation
        return /^[A-Z]{2,3}-\d{4}$|^[A-Z]{3}-\d{4}$|^\d{2,3}-\d{4}$/.test(v);
      },
      message: 'Invalid Sri Lankan vehicle number plate format'
    }
  },
  
  // Vehicle Type and Speed Limit (Core Feature)
  vehicleType: {
    type: String,
    enum: ["motorcycle", "light_vehicle", "three_wheeler", "heavy_vehicle"],
    required: true
  },
  speedLimit: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        // Validate speed limit matches vehicle type
        const expectedLimits = {
          motorcycle: 70,
          light_vehicle: 70,
          three_wheeler: 50,
          heavy_vehicle: 50
        };
        return v === expectedLimits[this.vehicleType];
      },
      message: 'Speed limit does not match vehicle type'
    }
  },
  
  // Vehicle Details
  make: String,
  model: String,
  year: { 
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  color: String,
  engineNumber: String,
  chassisNumber: String,
  
  // Owner Information (Driver Mapping)
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Driver", 
    required: true 
  },
  
  // IoT Device Assignment (One-to-One Mapping)
  iotDeviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "IoTDevice",
    default: null
  },
  deviceAssignmentDate: Date,
  deviceAssignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // Registration Documents
  registrationDate: Date,
  registrationExpiry: Date,
  insuranceExpiry: Date,
  
  // Vehicle Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'impounded'],
    default: 'active'
  },
  
  // QR Code for Officer Scanning
  qrCode: {
    type: String,
    unique: true,
    sparse: true // Allow null but ensure uniqueness when present
  },
  qrCodeGeneratedAt: Date,
  
  // Real-time Status (from IoT device)
  currentLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  currentSpeed: { type: Number, default: 0 }, // km/h
  lastLocationUpdate: Date,
  isOnline: { type: Boolean, default: false },
  
  // Violation Statistics
  totalViolations: { type: Number, default: 0 },
  lastViolationDate: Date,
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  
  // Verification Status
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verificationDate: Date,
  verificationNotes: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ driverId: 1 });
vehicleSchema.index({ iotDeviceId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ qrCode: 1 });

// Middleware to automatically set speed limit based on vehicle type
vehicleSchema.pre('save', function(next) {
  if (this.isModified('vehicleType') || this.isNew) {
    const speedLimits = {
      motorcycle: 70,
      light_vehicle: 70,
      three_wheeler: 50,
      heavy_vehicle: 50
    };
    this.speedLimit = speedLimits[this.vehicleType];
  }
  
  // Generate QR code if not exists
  if (!this.qrCode && this.isNew) {
    this.qrCode = this.generateQRCode();
    this.qrCodeGeneratedAt = new Date();
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to generate QR code data
vehicleSchema.methods.generateQRCode = function() {
  // QR code contains vehicle ID for officer scanning
  const qrData = {
    vehicleId: this._id,
    vehicleNumber: this.vehicleNumber,
    timestamp: new Date().toISOString()
  };
  return Buffer.from(JSON.stringify(qrData)).toString('base64');
};

// Method to assign IoT device
vehicleSchema.methods.assignIoTDevice = function(deviceId, assignedBy) {
  this.iotDeviceId = deviceId;
  this.deviceAssignmentDate = new Date();
  this.deviceAssignedBy = assignedBy;
  return this.save();
};

// Method to unassign IoT device
vehicleSchema.methods.unassignIoTDevice = function() {
  this.iotDeviceId = null;
  this.deviceAssignmentDate = null;
  this.deviceAssignedBy = null;
  return this.save();
};

// Method to update real-time location from IoT device
vehicleSchema.methods.updateLocation = function(latitude, longitude, speed) {
  this.currentLocation = {
    latitude,
    longitude,
    timestamp: new Date()
  };
  this.currentSpeed = speed;
  this.lastLocationUpdate = new Date();
  this.isOnline = true;
  
  return this.save();
};

// Method to record violation
vehicleSchema.methods.recordViolation = function() {
  this.totalViolations += 1;
  this.lastViolationDate = new Date();
  
  // Update risk level based on violations
  if (this.totalViolations >= 10) {
    this.riskLevel = 'high';
  } else if (this.totalViolations >= 5) {
    this.riskLevel = 'medium';
  } else {
    this.riskLevel = 'low';
  }
  
  return this.save();
};

// Static method to find vehicles by driver
vehicleSchema.statics.findByDriver = function(driverId) {
  return this.find({ driverId }).populate('iotDeviceId').populate('driverId');
};

// Static method to find vehicle by IoT device
vehicleSchema.statics.findByIoTDevice = function(deviceId) {
  return this.findOne({ iotDeviceId: deviceId }).populate('driverId').populate('iotDeviceId');
};

// Static method to find vehicles without IoT devices
vehicleSchema.statics.findUnassignedVehicles = function() {
  return this.find({ 
    iotDeviceId: null,
    status: 'active'
  }).populate('driverId');
};

// Static method to decode QR code
vehicleSchema.statics.decodeQRCode = function(qrCode) {
  try {
    const decoded = Buffer.from(qrCode, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Invalid QR code format');
  }
};

// Static method to find vehicle by QR code
vehicleSchema.statics.findByQRCode = function(qrCode) {
  return this.findOne({ qrCode }).populate('driverId').populate('iotDeviceId');
};

module.exports = mongoose.model("Vehicle", vehicleSchema);