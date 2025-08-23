const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({
  vehicleId: String,
  location: { lat: Number, lng: Number },
  speed: Number,
  timestamp: Date,
});

module.exports = mongoose.model("Violation", violationSchema, "violations");