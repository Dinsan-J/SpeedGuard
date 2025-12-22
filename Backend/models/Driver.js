const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  // Primary Identification
  licenseNumber: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Sri Lankan driving license format validation
        return /^[A-Z]\d{7}$|^[A-Z]{2}\d{6}$/.test(v);
      },
      message: 'Invalid Sri Lankan driving license format'
    }
  },
  
  // Personal Information
  fullName: { type: String, required: true },
  nicNumber: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        // Sri Lankan NIC validation (old: 9 digits + V/X, new: 12 digits)
        return /^(\d{9}[VvXx]|\d{12})$/.test(v);
      },
      message: 'Invalid Sri Lankan NIC number format'
    }
  },
  phoneNumber: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        // Sri Lankan phone number validation
        return /^(\+94|0)?[1-9]\d{8}$/.test(v);
      },
      message: 'Invalid Sri Lankan phone number format'
    }
  },
  email: { type: String, required: true, unique: true },
  address: String,
  
  // License Information
  licenseClass: { 
    type: String, 
    enum: ['A', 'A1', 'B', 'B1', 'C', 'C1', 'CE', 'D', 'D1', 'DE', 'G'],
    required: true
  },
  licenseIssueDate: { type: Date, required: true },
  licenseExpiryDate: { type: Date, required: true },
  
  // Merit Point System (Core Feature)
  meritPoints: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  
  // Status based on merit points
  drivingStatus: {
    type: String,
    enum: ['active', 'warning', 'review', 'suspended'],
    default: 'active'
  },
  
  // Violation tracking
  totalViolations: { type: Number, default: 0 },
  lastViolationDate: Date,
  violationFreeWeeks: { type: Number, default: 0 },
  lastMeritRecovery: Date,
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Officer who verified
  verificationDate: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ nicNumber: 1 });
driverSchema.index({ email: 1 });
driverSchema.index({ drivingStatus: 1 });
driverSchema.index({ meritPoints: 1 });

// Middleware to update driving status based on merit points
driverSchema.pre('save', function(next) {
  if (this.meritPoints >= 50) {
    this.drivingStatus = 'active';
  } else if (this.meritPoints >= 30) {
    this.drivingStatus = 'warning';
  } else if (this.meritPoints > 0) {
    this.drivingStatus = 'review';
  } else {
    this.drivingStatus = 'suspended';
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to deduct merit points with severity calculation
driverSchema.methods.deductMeritPoints = function(speedOverLimit, violationType = 'speed') {
  let pointsToDeduct = 0;
  
  // Merit point deduction based on speed violation severity
  if (violationType === 'speed') {
    if (speedOverLimit <= 10) {
      pointsToDeduct = 5;
    } else if (speedOverLimit <= 20) {
      pointsToDeduct = 10;
    } else if (speedOverLimit <= 30) {
      pointsToDeduct = 20;
    } else {
      pointsToDeduct = 30;
    }
  }
  
  this.meritPoints = Math.max(0, this.meritPoints - pointsToDeduct);
  this.totalViolations += 1;
  this.lastViolationDate = new Date();
  this.violationFreeWeeks = 0; // Reset violation-free streak
  
  return { 
    pointsDeducted: pointsToDeduct, 
    newTotal: this.meritPoints,
    status: this.drivingStatus
  };
};

// Method to recover merit points (weekly recovery)
driverSchema.methods.recoverMeritPoints = function() {
  if (!this.lastViolationDate) return { recovered: 0, newTotal: this.meritPoints };
  
  const now = new Date();
  const lastViolation = new Date(this.lastViolationDate);
  const weeksSinceViolation = Math.floor((now - lastViolation) / (7 * 24 * 60 * 60 * 1000));
  
  if (weeksSinceViolation > this.violationFreeWeeks) {
    const weeksToRecover = weeksSinceViolation - this.violationFreeWeeks;
    const pointsToRecover = Math.min(weeksToRecover * 2, 100 - this.meritPoints);
    
    this.meritPoints = Math.min(100, this.meritPoints + pointsToRecover);
    this.violationFreeWeeks = weeksSinceViolation;
    this.lastMeritRecovery = now;
    
    return { recovered: pointsToRecover, newTotal: this.meritPoints };
  }
  
  return { recovered: 0, newTotal: this.meritPoints };
};

// Static method to find driver by license number
driverSchema.statics.findByLicenseNumber = function(licenseNumber) {
  return this.findOne({ licenseNumber: licenseNumber.toUpperCase() });
};

// Static method to get drivers with low merit points
driverSchema.statics.findHighRiskDrivers = function() {
  return this.find({ 
    meritPoints: { $lt: 30 },
    isActive: true 
  }).sort({ meritPoints: 1 });
};

module.exports = mongoose.model("Driver", driverSchema);