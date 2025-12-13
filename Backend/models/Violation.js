const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true }, // <-- Change from ObjectId to String
  location: {
    lat: Number,
    lng: Number,
  },
  speed: Number,
  speedLimit: { type: Number, default: 70 }, // Speed limit at violation location
  timestamp: Date,
  fine: Number,
  status: String,
  // Geofencing fields
  sensitiveZone: {
    isInZone: { type: Boolean, default: false },
    zoneType: { type: String, enum: ['hospital', 'school', 'university', 'town', 'city', null] },
    zoneName: String,
    distanceFromZone: Number, // in meters
    zoneRadius: Number // in meters
  },
  baseFine: Number, // Original fine before zone multiplier
  zoneMultiplier: { type: Number, default: 1 } // Fine multiplier based on zone
});

module.exports = mongoose.model("Violation", violationSchema);
