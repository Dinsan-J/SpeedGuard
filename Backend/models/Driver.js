const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  drivingLicenseId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  licenseIssueDate: { type: Date, required: true },
  licenseExpiryDate: { type: Date, required: true },
  licenseClass: { 
    type: String, 
    required: true,
    enum: ['A', 'A1', 'B', 'B1', 'C', 'C1', 'D', 'D1', 'G'] // Sri Lankan license classes
  },
  
  // Merit Point System
  meritPoints: { 
    type: Number, 
    default: 100, // Start with 100 merit points
    min: 0,
    max: 100
  },
  
  // Status based on merit points
  status: {
    type: String,
    enum: ['active', 'warning', 'suspended', 'revoked'],
    default: 'active'
  },
  
  // Violation History
  totalViolations: { type: Number, default: 0 },
  confirmedViolations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Violation" 
  }],
  
  // Risk Profile
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  averageRiskScore: { type: Number, default: 0.2 }, // 0-1 scale
  
  // Contact Information
  address: String,
  phoneNumber: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastViolationDate: Date,
  
  // Training and Rehabilitation
  mandatoryTrainingRequired: { type: Boolean, default: false },
  trainingCompletedDate: Date,
  rehabilitationPrograms: [{
    programName: String,
    completedDate: Date,
    certificateNumber: String
  }]
});

// Middleware to update status based on merit points
driverSchema.pre('save', function(next) {
  if (this.meritPoints >= 80) {
    this.status = 'active';
  } else if (this.meritPoints >= 50) {
    this.status = 'warning';
  } else if (this.meritPoints >= 20) {
    this.status = 'suspended';
    this.mandatoryTrainingRequired = true;
  } else {
    this.status = 'revoked';
    this.mandatoryTrainingRequired = true;
  }
  
  this.updatedAt = new Date();
  next();
});

// Methods
driverSchema.methods.deductMeritPoints = function(points, reason) {
  this.meritPoints = Math.max(0, this.meritPoints - points);
  return this.save();
};

driverSchema.methods.addMeritPoints = function(points, reason) {
  this.meritPoints = Math.min(100, this.meritPoints + points);
  return this.save();
};

driverSchema.methods.updateRiskProfile = function(newRiskScore) {
  // Update average risk score (weighted average)
  const totalViolations = this.totalViolations || 1;
  this.averageRiskScore = ((this.averageRiskScore * (totalViolations - 1)) + newRiskScore) / totalViolations;
  
  // Update risk level
  if (this.averageRiskScore >= 0.7) {
    this.riskLevel = 'high';
  } else if (this.averageRiskScore >= 0.4) {
    this.riskLevel = 'medium';
  } else {
    this.riskLevel = 'low';
  }
  
  return this.save();
};

// Static methods
driverSchema.statics.findByLicenseId = function(licenseId) {
  return this.findOne({ drivingLicenseId: licenseId });
};

driverSchema.statics.getHighRiskDrivers = function() {
  return this.find({ 
    $or: [
      { riskLevel: 'high' },
      { meritPoints: { $lt: 50 } },
      { status: { $in: ['suspended', 'revoked'] } }
    ]
  }).sort({ averageRiskScore: -1 });
};

module.exports = mongoose.model("Driver", driverSchema);