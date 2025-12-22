const mongoose = require("mongoose");

const driverProfileSchema = new mongoose.Schema({
  // Link to User account
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
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
  
  // Driving License Information
  drivingLicenseNumber: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
  },
  licenseClass: { 
    type: String, 
    enum: ['A', 'A1', 'B', 'B1', 'C', 'C1', 'CE', 'D', 'D1', 'DE', 'G'],
    required: true
  },
  licenseIssueDate: { type: Date, required: true },
  licenseExpiryDate: { type: Date, required: true },
  
  // Merit Point System
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
  
  // Address Information
  address: {
    street: String,
    city: String,
    district: String,
    province: String,
    postalCode: String
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  
  // Profile Status
  isVerified: { type: Boolean, default: false },
  verificationDate: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Officer who verified
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
driverProfileSchema.index({ userId: 1 });
driverProfileSchema.index({ drivingLicenseNumber: 1 });
driverProfileSchema.index({ nicNumber: 1 });
driverProfileSchema.index({ drivingStatus: 1 });

// Middleware to update driving status based on merit points
driverProfileSchema.pre('save', function(next) {
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
driverProfileSchema.methods.deductMeritPoints = function(speedOverLimit) {
  let pointsToDeduct = 0;
  
  if (speedOverLimit <= 10) {
    pointsToDeduct = 5;
  } else if (speedOverLimit <= 20) {
    pointsToDeduct = 10;
  } else if (speedOverLimit <= 30) {
    pointsToDeduct = 20;
  } else {
    pointsToDeduct = 30;
  }
  
  this.meritPoints = Math.max(0, this.meritPoints - pointsToDeduct);
  this.totalViolations += 1;
  this.lastViolationDate = new Date();
  this.violationFreeWeeks = 0; // Reset violation-free streak
  
  return { pointsDeducted: pointsToDeduct, newTotal: this.meritPoints };
};

// Method to recover merit points (weekly recovery)
driverProfileSchema.methods.recoverMeritPoints = function() {
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

module.exports = mongoose.model("DriverProfile", driverProfileSchema);