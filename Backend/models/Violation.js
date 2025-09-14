const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }, // <-- link to Vehicle
  location: { lat: Number, lng: Number },
  speed: Number,
  timestamp: { type: Date, default: Date.now },
  fine: Number,
  status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
  type: String, // e.g., "Speeding"
});

module.exports = mongoose.model("Violation", violationSchema);
