require("dotenv").config();
const mongoose = require("mongoose");
const osmService = require("../services/osmService");

/**
 * Script to initialize sensitive locations from OpenStreetMap
 * Run this script to populate the database with Sri Lankan sensitive locations
 */
async function initializeSensitiveLocations() {
  try {
    console.log("🚀 Starting sensitive locations initialization...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Fetch and save sensitive locations
    console.log("📡 Fetching sensitive locations from OpenStreetMap...");
    const result = await osmService.updateSensitiveLocations();
    
    console.log("🎉 Initialization completed successfully!");
    console.log(`📊 Results: ${result.savedCount} new locations, ${result.updatedCount} updated locations`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Initialization failed:", error.message);
    console.error(error.stack);
    
    // Disconnect from MongoDB
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting from MongoDB:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initializeSensitiveLocations();
}

module.exports = initializeSensitiveLocations;