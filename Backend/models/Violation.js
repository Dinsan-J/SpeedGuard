const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({
  // Vehicle and Driver Information
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vehicle", 
    required: true 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Driver", 
    required: true 
  },
  
  // IoT Device Information
  deviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "IoTDevice", 
    required: true 
  },
  
  // Location Data (from IoT device)
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: Number, // GPS accuracy in meters
    address: String // Reverse geocoded address (optional)
  },
  
  // Speed Violation Data
  speed: { type: Number, required: true }, // Actual speed in km/h
  speedLimit: { type: Number, required: true }, // Applied speed limit
  speedOverLimit: { type: Number, required: true }, // How much over the limit
  
  // Violation Classification
  violationType: {
    type: String,
    enum: ['speed', 'reckless_driving', 'zone_violation'],
    default: 'speed'
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'serious', 'severe'],
    required: true
  },
  
  // Timestamp Information
  timestamp: { type: Date, required: true }, // When violation occurred
  detectedAt: { type: Date, default: Date.now }, // When system detected it
  
  // Geofencing Information
  sensitiveZone: {
    isInZone: { type: Boolean, default: false },
    zoneType: { 
      type: String, 
      enum: ['hospital', 'school', 'university', 'town', 'city', null] 
    },
    zoneName: String,
    distanceFromZone: Number, // in meters
    zoneRadius: Number // in meters
  },
  
  // ML Risk Assessment
  riskScore: { type: Number, min: 0, max: 1 }, // 0-1 scale from ML model
  riskLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  riskFactors: [{
    factor: String,
    weight: Number,
    description: String
  }],
  
  // Merit Points Impact (NOT automatically applied)
  meritPointsToDeduct: { type: Number, default: 0 },
  meritPointsApplied: { type: Boolean, default: false },
  meritPointsAppliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Officer
  meritPointsAppliedAt: Date,
  
  // Officer Verification (Required for merit point deduction)
  officerVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Police officer
  verificationDate: Date,
  verificationNotes: String,
  licenseVerified: { type: Boolean, default: false }, // License-vehicle mapping verified
  
  // Violation Status
  status: {
    type: String,
    enum: ['detected', 'pending_verification', 'verified', 'disputed', 'resolved'],
    default: 'detected'
  },
  
  // Additional Context
  timeOfDay: { 
    type: String, 
    enum: ['morning', 'afternoon', 'evening', 'night'],
    required: true
  },
  weatherConditions: String,
  trafficDensity: { 
    type: String, 
    enum: ['light', 'moderate', 'heavy'] 
  },
  
  // Evidence and Documentation
  hasPhoto: { type: Boolean, default: false },
  photoUrl: String,
  evidenceNotes: String,
  
  // Legal Processing
  disputeReason: String,
  disputeDate: Date,
  courtDate: Date,
  legalStatus: {
    type: String,
    enum: ['none', 'pending', 'court_summons', 'resolved'],
    default: 'none'
  },
  
  // System Metadata
  processingTime: Number, // Time taken to process violation (ms)
  dataQuality: {
    gpsAccuracy: Number,
    speedAccuracy: Number,
    timestampAccuracy: Number
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
violationSchema.index({ vehicleId: 1, timestamp: -1 });
violationSchema.index({ driverId: 1, timestamp: -1 });
violationSchema.index({ deviceId: 1, timestamp: -1 });
violationSchema.index({ status: 1 });
violationSchema.index({ severity: 1 });
violationSchema.index({ timestamp: -1 });
violationSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
violationSchema.index({ meritPointsApplied: 1 });

// Middleware to calculate severity and merit points
violationSchema.pre('save', function(next) {
  // Calculate severity based on speed over limit
  if (this.speedOverLimit <= 10) {
    this.severity = 'minor';
    this.meritPointsToDeduct = 5;
  } else if (this.speedOverLimit <= 20) {
    this.severity = 'moderate';
    this.meritPointsToDeduct = 10;
  } else if (this.speedOverLimit <= 30) {
    this.severity = 'serious';
    this.meritPointsToDeduct = 20;
  } else {
    this.severity = 'severe';
    this.meritPointsToDeduct = 30;
  }
  
  // Adjust merit points for sensitive zones
  if (this.sensitiveZone && this.sensitiveZone.isInZone) {
    this.meritPointsToDeduct = Math.round(this.meritPointsToDeduct * 1.5);
  }
  
  // Adjust merit points for high risk violations
  if (this.riskLevel === 'high' && this.riskScore > 0.7) {
    this.meritPointsToDeduct = Math.round(this.meritPointsToDeduct * 1.3);
  }
  
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
  
  this.updatedAt = new Date();
  next();
});

// Method to verify violation by officer
violationSchema.methods.verifyByOfficer = function(officerId, licenseNumber, notes) {
  this.officerVerified = true;
  this.verifiedBy = officerId;
  this.verificationDate = new Date();
  this.verificationNotes = notes;
  this.status = 'verified';
  
  // Verify license-vehicle mapping
  return this.populate('vehicleId')
    .then(violation => {
      return violation.populate('vehicleId.driverId');
    })
    .then(violation => {
      if (violation.vehicleId.driverId.licenseNumber === licenseNumber.toUpperCase()) {
        this.licenseVerified = true;
        return this.save();
      } else {
        throw new Error('License number does not match vehicle owner');
      }
    });
};

// Method to apply merit points (only after officer verification)
violationSchema.methods.applyMeritPoints = function(officerId) {
  if (!this.officerVerified || !this.licenseVerified) {
    throw new Error('Violation must be verified by officer before applying merit points');
  }
  
  if (this.meritPointsApplied) {
    throw new Error('Merit points already applied for this violation');
  }
  
  this.meritPointsApplied = true;
  this.meritPointsAppliedBy = officerId;
  this.meritPointsAppliedAt = new Date();
  this.status = 'resolved';
  
  return this.save();
};

// Static method to find unverified violations
violationSchema.statics.findPendingVerification = function() {
  return this.find({ 
    status: 'detected',
    officerVerified: false 
  })
  .populate('vehicleId')
  .populate('driverId')
  .populate('deviceId')
  .sort({ timestamp: -1 });
};

// Static method to find violations by driver
violationSchema.statics.findByDriver = function(driverId) {
  return this.find({ driverId })
    .populate('vehicleId')
    .populate('deviceId')
    .sort({ timestamp: -1 });
};

// Static method to find violations by vehicle
violationSchema.statics.findByVehicle = function(vehicleId) {
  return this.find({ vehicleId })
    .populate('driverId')
    .populate('deviceId')
    .sort({ timestamp: -1 });
};

// Static method to find violations in location radius
violationSchema.statics.findInRadius = function(latitude, longitude, radiusKm) {
  const radiusRadians = radiusKm / 6371; // Earth's radius in km
  
  return this.find({
    'location.latitude': {
      $gte: latitude - (radiusRadians * 180 / Math.PI),
      $lte: latitude + (radiusRadians * 180 / Math.PI)
    },
    'location.longitude': {
      $gte: longitude - (radiusRadians * 180 / Math.PI / Math.cos(latitude * Math.PI / 180)),
      $lte: longitude + (radiusRadians * 180 / Math.PI / Math.cos(latitude * Math.PI / 180))
    }
  }).populate('vehicleId').populate('driverId').sort({ timestamp: -1 });
};

module.exports = mongoose.model("Violation", violationSchema);