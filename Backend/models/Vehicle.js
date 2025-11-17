const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true },
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
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
