const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  }, // <- updated
  location: { lat: Number, lng: Number },
  speed: Number,
  timestamp: { type: Date, default: Date.now },
  type: { type: String, default: "Speeding" },
  fine: Number,
  status: { type: String, default: "Pending" }, // Paid or Pending
});

module.exports = mongoose.model("Violation", violationSchema);
