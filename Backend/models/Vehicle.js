const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  // Vehicle Registration Information
  plateNumber: { 
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
  
  // Vehicle Details
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { 
    type: Number, 
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  color: { type: String, required: true },
  
  // Vehicle Type and Speed Limit
  vehicleType: {
    type: String,
    enum: ["motorcycle", "light_vehicle", "three_wheeler", "heavy_vehicle"],
    required: true
  },
  speedLimit: {
    type: Number,
    required: true,
    default: function() {
      const speedLimits = {
        motorcycle: 70,
        light_vehicle: 70,
        three_wheeler: 50,
        heavy_vehicle: 50
      };
      return speedLimits[this.vehicleType] || 70;
    }
  },
  
  // Ownership Information
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  ownerType: {
    type: String,
    enum: ['individual', 'company', 'government'],
    default: 'individual'
  },
  
  // Registration Documents
  registrationNumber: { type: String, required: true, unique: true },
  registrationDate: { type: Date, required: true },
  registrationExpiry: { type: Date, required: true },
  
  // Insurance Information
  insuranceProvider: String,
  insurancePolicyNumber: String,
  insuranceExpiry: Date,
  
  // Technical Information
  engineNumber: String,
  chassisNumber: String,
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    default: 'petrol'
  },
  engineCapacity: Number, // in CC
  
  // IoT Device Assignment
  assignedDevice: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "IoTDevice",
    default: null
  },
  iotDeviceId: { type: String, unique: true, sparse: true }, // Legacy field for compatibility
  deviceAssignedDate: Date,
  deviceAssignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // Vehicle Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'impounded'],
    default: 'active'
  },
  
  // Current Status (from IoT device)
  currentLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date
  },
  currentSpeed: { type: Number, default: 0 }, // km/h
  lastSeen: Date,
  lastUpdated: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  
  // Violation Statistics
  violations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Violation" }],
  totalViolations: { type: Number, default: 0 },
  lastViolation: Date,
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  
  // Maintenance Information
  lastServiceDate: Date,
  nextServiceDate: Date,
  mileage: Number,
  
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
vehicleSchema.index({ plateNumber: 1 });
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ assignedDevice: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ registrationExpiry: 1 });

// Middleware to set speed limit based on vehicle type
vehicleSchema.pre('save', function(next) {
  if (this.isModified('vehicleType') || this.isNew) {
    const speedLimits = {
      motorcycle: 70,
      light_vehicle: 70,
      three_wheeler: 50,
      heavy_vehicle: 50
    };
    this.speedLimit = speedLimits[this.vehicleType] || 70;
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to get applicable speed limit (legacy compatibility)
vehicleSchema.methods.getSpeedLimit = function() {
  const speedLimits = {
    motorcycle: 70,
    light_vehicle: 70,
    three_wheeler: 50,
    heavy_vehicle: 50
  };
  return speedLimits[this.vehicleType] || 70;
};

// Method to assign IoT device
vehicleSchema.methods.assignDevice = function(deviceId, assignedBy) {
  this.assignedDevice = deviceId;
  this.deviceAssignedDate = new Date();
  this.deviceAssignedBy = assignedBy;
  return this.save();
};

// Method to unassign IoT device
vehicleSchema.methods.unassignDevice = function() {
  this.assignedDevice = null;
  this.deviceAssignedDate = null;
  this.deviceAssignedBy = null;
  return this.save();
};

// Method to update current status from IoT device
vehicleSchema.methods.updateStatus = function(location, speed) {
  this.currentLocation = {
    lat: location.lat,
    lng: location.lng,
    timestamp: new Date()
  };
  this.currentSpeed = speed;
  this.lastSeen = new Date();
  this.lastUpdated = new Date();
  this.isOnline = true;
  
  return this.save();
};

// Method to record violation
vehicleSchema.methods.recordViolation = function() {
  this.totalViolations += 1;
  this.lastViolation = new Date();
  
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

// Static method to find vehicles by owner
vehicleSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId }).populate('assignedDevice');
};

// Static method to find vehicles with expired registration
vehicleSchema.statics.findExpiredRegistrations = function() {
  return this.find({ 
    registrationExpiry: { $lte: new Date() },
    status: 'active'
  });
};

// Static method to find vehicles needing service
vehicleSchema.statics.findNeedingService = function() {
  return this.find({ 
    nextServiceDate: { $lte: new Date() },
    status: 'active'
  });
};

module.exports = mongoose.model("Vehicle", vehicleSchema);
