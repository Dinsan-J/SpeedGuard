require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");

/**
 * Check the specific violation created for user coordinates
 */
async function checkUserViolation() {
  try {
    console.log("🔍 Checking user violation details...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find the user's violation
    const userViolation = await Violation.findOne({ 
      vehicleId: "USER-TEST-001" 
    }).sort({ timestamp: -1 });

    if (!userViolation) {
      console.log("❌ No violation found for USER-TEST-001");
      return;
    }

    console.log("\n📊 User Violation Details:");
    console.log("─".repeat(50));
    console.log(`🆔 Violation ID: ${userViolation._id}`);
    console.log(`🚗 Vehicle ID: ${userViolation.vehicleId}`);
    console.log(`📍 Location: ${userViolation.location.lat}, ${userViolation.location.lng}`);
    console.log(`🏃 Speed: ${userViolation.speed} km/h`);
    console.log(`🚦 Speed Limit: ${userViolation.speedLimit} km/h`);
    console.log(`📊 Speed Violation: +${userViolation.speed - userViolation.speedLimit} km/h`);
    console.log(`💰 Base Fine: LKR ${userViolation.baseFine}`);
    console.log(`💰 Final Fine: LKR ${userViolation.fine}`);
    console.log(`🔄 Zone Multiplier: ${userViolation.zoneMultiplier}x`);
    console.log(`📅 Timestamp: ${userViolation.timestamp}`);
    console.log(`📋 Status: ${userViolation.status}`);

    console.log("\n🌍 Geofencing Details:");
    console.log("─".repeat(30));
    if (userViolation.sensitiveZone.isInZone) {
      console.log(`🚨 IN SENSITIVE ZONE: ${userViolation.sensitiveZone.zoneName}`);
      console.log(`🏢 Zone Type: ${userViolation.sensitiveZone.zoneType}`);
      console.log(`📏 Distance from zone center: ${Math.round(userViolation.sensitiveZone.distanceFromZone)}m`);
      console.log(`🔵 Zone radius: ${userViolation.sensitiveZone.zoneRadius}m`);
    } else {
      console.log(`✅ NOT in sensitive zone (Normal road)`);
      console.log(`📏 Distance from zone: ${userViolation.sensitiveZone.distanceFromZone ? Math.round(userViolation.sensitiveZone.distanceFromZone) + 'm' : 'N/A'}`);
    }

    console.log("\n🎯 Dashboard Display Format:");
    console.log("─".repeat(40));
    console.log(`📍 Location: ${userViolation.location.lat.toFixed(6)}, ${userViolation.location.lng.toFixed(6)}`);
    console.log(`🚗 Speed: ${userViolation.speed} km/h`);
    console.log(`📝 Description: Speed violation on ${userViolation.sensitiveZone.isInZone ? 'sensitive zone' : 'normal road'}`);
    console.log(`🚦 Speed Limit: ${userViolation.speedLimit} km/h (${userViolation.sensitiveZone.isInZone ? 'Sensitive Zone' : 'Normal Road'})`);
    console.log(`📊 Speed Violation: +${userViolation.speed - userViolation.speedLimit} km/h`);
    console.log(`💰 Base Fine: LKR ${userViolation.baseFine}`);
    console.log(`💰 Final Fine: LKR ${userViolation.fine}`);
    
    if (userViolation.sensitiveZone.isInZone) {
      console.log(`🚨 IN SENSITIVE ZONE: ${userViolation.sensitiveZone.zoneName} (${userViolation.sensitiveZone.zoneType})`);
      console.log(`📏 Distance from zone center: ${Math.round(userViolation.sensitiveZone.distanceFromZone)}m`);
      console.log(`🔄 Fine multiplier: ${userViolation.zoneMultiplier}x`);
    } else {
      console.log(`✅ Normal road violation`);
    }

    console.log("\n🌐 This violation should now be visible on your dashboard!");
    console.log("🔗 Check: https://speedguard-gz70.onrender.com (your production backend)");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error checking violation:", error.message);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the check
if (require.main === module) {
  checkUserViolation();
}

module.exports = checkUserViolation;