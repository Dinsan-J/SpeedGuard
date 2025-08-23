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
  violations: { type: Number, default: 0 },
  lastViolation: Date,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
