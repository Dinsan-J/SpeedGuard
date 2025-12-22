const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Common Authentication Fields
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
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
  
  // Role-Based Access Control
  role: { 
    type: String, 
    enum: ["driver", "officer"], 
    required: true
  },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  
  // Password Reset
  passwordResetToken: String,
  passwordResetExpiry: Date,
  
  // Login Tracking
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  
  // Profile References (populated based on role)
  driverProfile: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "DriverProfile",
    required: function() { return this.role === 'driver'; }
  },
  officerProfile: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "OfficerProfile",
    required: function() { return this.role === 'officer'; }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Static method to find user with populated profile
userSchema.statics.findByIdWithProfile = function(id) {
  return this.findById(id)
    .populate('driverProfile')
    .populate('officerProfile');
};

// Static method to find user by email with populated profile
userSchema.statics.findByEmailWithProfile = function(email) {
  return this.findOne({ email: email.toLowerCase() })
    .populate('driverProfile')
    .populate('officerProfile');
};

module.exports = mongoose.model("User", userSchema);
