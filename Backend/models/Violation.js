const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  location: { lat: Number, lng: Number },
  speed: Number,
  timestamp: { type: Date, default: Date.now },
  fine: Number,
  type: { type: String, default: "Speed Violation" },
  status: { type: String, default: "Unpaid" },
});

module.exports = mongoose.model("Violation", violationSchema);
