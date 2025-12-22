const mongoose = require("mongoose");

const officerProfileSchema = new mongoose.Schema({
  // Link to User account
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  
  // Personal Information
  fullName: { type: String, required: true },
  
  // Police Information
  policeIdNumber: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
  },
  policeStation: { type: String, required: true },
  division: { type: String, required: true },
  rank: { 
    type: String, 
    enum: [
      'Police Constable', 
      'Police Sergeant', 
      'Police Inspector', 
      'Sub Inspector', 
      'Assistant Superintendent', 
      'Deputy Inspector General', 
      'Inspector General'
    ]
  },
  
  // Contact Information
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
  
  // Work Information
  badgeNumber: String,
  department: { 
    type: String, 
    enum: ['Traffic Police', 'General Police', 'Special Task Force', 'Criminal Investigation'],
    default: 'Traffic Police'
  },
  jurisdiction: String, // Area of responsibility
  
  // Officer Status
  isActive: { type: Boolean, default: true },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'suspended'],
    default: 'pending'
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who verified
  verificationDate: Date,
  
  // Performance Metrics
  totalConfirmations: { type: Number, default: 0 },
  totalViolationsProcessed: { type: Number, default: 0 },
  lastActiveDate: Date,
  
  // Permissions
  permissions: {
    canConfirmViolations: { type: Boolean, default: true },
    canAccessAnalytics: { type: Boolean, default: false },
    canManageDrivers: { type: Boolean, default: false },
    canViewSystemStats: { type: Boolean, default: false }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
officerProfileSchema.index({ userId: 1 });
officerProfileSchema.index({ policeIdNumber: 1 });
officerProfileSchema.index({ policeStation: 1 });
officerProfileSchema.index({ verificationStatus: 1 });
officerProfileSchema.index({ isActive: 1 });

// Middleware to update timestamps
officerProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to record violation confirmation
officerProfileSchema.methods.recordViolationConfirmation = function() {
  this.totalConfirmations += 1;
  this.totalViolationsProcessed += 1;
  this.lastActiveDate = new Date();
  return this.save();
};

// Method to check if officer can perform action
officerProfileSchema.methods.canPerformAction = function(action) {
  if (!this.isActive || this.verificationStatus !== 'verified') {
    return false;
  }
  
  switch (action) {
    case 'confirmViolation':
      return this.permissions.canConfirmViolations;
    case 'accessAnalytics':
      return this.permissions.canAccessAnalytics;
    case 'manageDrivers':
      return this.permissions.canManageDrivers;
    case 'viewSystemStats':
      return this.permissions.canViewSystemStats;
    default:
      return false;
  }
};

module.exports = mongoose.model("OfficerProfile", officerProfileSchema);