const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "officer"], default: "user" },
  policeId: { type: String }, // Only required for officers
  
  // Vehicle Type Selection (NEW)
  vehicleType: {
    type: String,
    enum: ["motorcycle", "light_vehicle", "three_wheeler", "heavy_vehicle"],
    required: function() {
      return this.role === "user"; // Only required for regular users
    }
  },
  
  // Driver Profile (NEW)
  driverProfile: {
    fullName: String,
    dateOfBirth: Date,
    phoneNumber: String,
    address: String,
    licenseNumber: String,
    licenseClass: String,
    licenseIssueDate: Date,
    licenseExpiryDate: Date
  },
  
  // Merit Point System (NEW)
  meritPoints: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  
  // Status based on merit points (NEW)
  drivingStatus: {
    type: String,
    enum: ['active', 'warning', 'review', 'suspended'],
    default: 'active'
  },
  
  // Violation tracking (NEW)
  totalViolations: { type: Number, default: 0 },
  lastViolationDate: Date,
  violationFreeWeeks: { type: Number, default: 0 },
  lastMeritRecovery: Date,
  
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update driving status based on merit points
userSchema.pre('save', function(next) {
  if (this.role === 'user') {
    if (this.meritPoints >= 50) {
      this.drivingStatus = 'active';
    } else if (this.meritPoints >= 30) {
      this.drivingStatus = 'warning';
    } else if (this.meritPoints > 0) {
      this.drivingStatus = 'review';
    } else {
      this.drivingStatus = 'suspended';
    }
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to get speed limit based on vehicle type
userSchema.methods.getSpeedLimit = function() {
  const speedLimits = {
    motorcycle: 70,
    light_vehicle: 70,
    three_wheeler: 50,
    heavy_vehicle: 50
  };
  return speedLimits[this.vehicleType] || 70;
};

// Method to deduct merit points with severity calculation
userSchema.methods.deductMeritPoints = function(speedOverLimit) {
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
userSchema.methods.recoverMeritPoints = function() {
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

module.exports = mongoose.model("User", userSchema);
