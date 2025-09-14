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
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  violations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Violation" }], // <-- change here
  lastViolation: Date,
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
