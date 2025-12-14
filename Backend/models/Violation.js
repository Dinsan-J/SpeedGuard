const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({
  // Vehicle Information
  vehicleId: { type: String, required: true }, // Vehicle plate number
  deviceId: { type: String, required: true }, // ESP32 device ID
  
  // Driver Information (filled after police confirmation)
  drivingLicenseId: { type: String }, // Confirmed by police officer
  driverConfirmed: { type: Boolean, default: false },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Police officer
  confirmationDate: Date,
  
  // Location and Speed Data
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  speed: { type: Number, required: true },
  speedLimit: { type: Number, default: 70 },
  timestamp: { type: Date, default: Date.now },
  
  // Geofencing Analysis
  sensitiveZone: {
    isInZone: { type: Boolean, default: false },
    zoneType: { type: String, enum: ['hospital', 'school', 'university', 'town', 'city', null] },
    zoneName: String,
    distanceFromZone: Number, // in meters
    zoneRadius: Number // in meters
  },
  
  // ML Risk Assessment
  riskScore: { type: Number, min: 0, max: 1 }, // 0-1 scale from ML model
  riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
  riskFactors: [{
    factor: String,
    weight: Number,
    description: String
  }],
  
  // Fine Calculation
  baseFine: { type: Number, required: true }, // Base fine before any adjustments
  zoneMultiplier: { type: Number, default: 1 }, // Geofencing multiplier
  riskMultiplier: { type: Number, default: 1 }, // ML risk multiplier
  finalFine: { type: Number, required: true }, // Final calculated fine
  fineBreakdown: {
    base: Number,
    zoneAdjustment: Number,
    riskAdjustment: Number,
    total: Number
  },
  
  // Status and Processing
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'disputed', 'paid', 'cancelled'],
    default: 'pending' 
  },
  
  // Merit Points Impact
  meritPointsDeducted: { type: Number, default: 0 },
  meritPointsApplied: { type: Boolean, default: false },
  
  // Additional Context
  timeOfDay: { type: String }, // morning, afternoon, evening, night
  weatherConditions: String,
  trafficDensity: { type: String, enum: ['light', 'moderate', 'heavy'] },
  
  // Legal and Administrative
  disputeReason: String,
  disputeDate: Date,
  courtDate: Date,
  paymentDate: Date,
  
  // Audit Trail
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
violationSchema.index({ vehicleId: 1, timestamp: -1 });
violationSchema.index({ drivingLicenseId: 1, timestamp: -1 });
violationSchema.index({ status: 1 });
violationSchema.index({ driverConfirmed: 1 });
violationSchema.index({ riskLevel: 1 });

// Middleware to update timestamps
violationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set time of day based on timestamp
  const hour = this.timestamp.getHours();
  if (hour >= 6 && hour < 12) {
    this.timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 18) {
    this.timeOfDay = 'afternoon';
  } else if (hour >= 18 && hour < 22) {
    this.timeOfDay = 'evening';
  } else {
    this.timeOfDay = 'night';
  }
  
  next();
});

// Methods
violationSchema.methods.confirmDriver = function(drivingLicenseId, officerId) {
  this.drivingLicenseId = drivingLicenseId;
  this.driverConfirmed = true;
  this.confirmedBy = officerId;
  this.confirmationDate = new Date();
  this.status = 'confirmed';
  return this.save();
};

violationSchema.methods.calculateFineBreakdown = function() {
  this.fineBreakdown = {
    base: this.baseFine,
    zoneAdjustment: this.baseFine * (this.zoneMultiplier - 1),
    riskAdjustment: this.baseFine * this.zoneMultiplier * (this.riskMultiplier - 1),
    total: this.finalFine
  };
  return this.fineBreakdown;
};

// Static methods
violationSchema.statics.getPendingConfirmations = function() {
  return this.find({ driverConfirmed: false, status: 'pending' })
    .sort({ timestamp: -1 });
};

violationSchema.statics.getDriverViolations = function(drivingLicenseId) {
  return this.find({ 
    drivingLicenseId: drivingLicenseId,
    driverConfirmed: true 
  }).sort({ timestamp: -1 });
};

violationSchema.statics.getHighRiskViolations = function() {
  return this.find({ 
    riskLevel: 'high',
    status: { $in: ['pending', 'confirmed'] }
  }).sort({ riskScore: -1 });
};

module.exports = mongoose.model("Violation", violationSchema);
