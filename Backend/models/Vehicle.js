const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true },
  
  // Vehicle Type (NEW - matches user vehicle type)
  vehicleType: {
    type: String,
    enum: ["motorcycle", "light_vehicle", "three_wheeler", "heavy_vehicle"],
    required: true
  },
  
  make: String,
  model: String,
  year: String,
  color: String,
  status: { type: String, default: "active" },
  registrationExpiry: Date,
  insuranceExpiry: Date,
  violations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Violation" }],
  lastViolation: Date,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  iotDeviceId: { type: String, unique: true, sparse: true }, // IoT device identifier
  currentSpeed: { type: Number, default: 0 }, // Real-time speed from IoT
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  lastUpdated: { type: Date, default: Date.now }, // Last IoT data update
  
  // Speed limit based on vehicle type (NEW)
  speedLimit: {
    type: Number,
    default: function() {
      const limits = {
        motorcycle: 70,
        light_vehicle: 70,
        three_wheeler: 50,
        heavy_vehicle: 50
      };
      return limits[this.vehicleType] || 70;
    }
  }
});

// Method to get applicable speed limit
vehicleSchema.methods.getSpeedLimit = function() {
  const speedLimits = {
    motorcycle: 70,
    light_vehicle: 70,
    three_wheeler: 50,
    heavy_vehicle: 50
  };
  return speedLimits[this.vehicleType] || 70;
};

module.exports = mongoose.model("Vehicle", vehicleSchema);
