const mongoose = require("mongoose");

const sensitiveLocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['hospital', 'school', 'university', 'town', 'city']
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  radius: { type: Number, required: true }, // in meters
  osmId: { type: String, unique: true }, // OpenStreetMap ID for reference
  address: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for geospatial queries
sensitiveLocationSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model("SensitiveLocation", sensitiveLocationSchema);