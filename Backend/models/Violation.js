const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true }, // <-- Change from ObjectId to String
  location: {
    lat: Number,
    lng: Number,
  },
  speed: Number,
  timestamp: Date,
  fine: Number,
  status: String,
});

module.exports = mongoose.model("Violation", violationSchema);
