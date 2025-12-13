require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");

/**
 * Check existing violations in the database
 */
async function checkViolations() {
  try {
    console.log("🔍 Checking existing violations in database...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all violations
    const violations = await Violation.find({}).sort({ timestamp: -1 }).limit(10);
    
    console.log(`\n📊 Found ${violations.length} recent violations:\n`);

    violations.forEach((violation, index) => {
      console.log(`${index + 1}. Violation ID: ${violation._id}`);
      console.log(`   Vehicle: ${violation.vehicleId}`);
      console.log(`   Speed: ${violation.speed} km/h`);
      console.log(`   Speed Limit: ${violation.speedLimit || 'Not set'} km/h`);
      console.log(`   Location: ${violation.location.lat}, ${violation.location.lng}`);
      console.log(`   Timestamp: ${violation.timestamp}`);
      console.log(`   Base Fine: LKR ${violation.baseFine || 'Not set'}`);
      console.log(`   Final Fine: LKR ${violation.fine || 'Not set'}`);
      console.log(`   Zone Multiplier: ${violation.zoneMultiplier || 'Not set'}x`);
      console.log(`   Status: ${violation.status || 'Not set'}`);
      
      if (violation.sensitiveZone) {
        console.log(`   🚨 SENSITIVE ZONE:`);
        console.log(`      In Zone: ${violation.sensitiveZone.isInZone}`);
        console.log(`      Zone Type: ${violation.sensitiveZone.zoneType || 'Not set'}`);
        console.log(`      Zone Name: ${violation.sensitiveZone.zoneName || 'Not set'}`);
        console.log(`      Distance: ${violation.sensitiveZone.distanceFromZone ? Math.round(violation.sensitiveZone.distanceFromZone) + 'm' : 'Not set'}`);
        console.log(`      Radius: ${violation.sensitiveZone.zoneRadius ? violation.sensitiveZone.zoneRadius + 'm' : 'Not set'}`);
      } else {
        console.log(`   ❌ No sensitive zone data`);
      }
      console.log("");
    });

    // Check if any violations have geofencing data
    const violationsWithGeofencing = await Violation.countDocuments({
      "sensitiveZone.isInZone": { $exists: true }
    });
    
    const violationsInZones = await Violation.countDocuments({
      "sensitiveZone.isInZone": true
    });

    console.log("📈 Summary:");
    console.log(`   Total violations: ${violations.length}`);
    console.log(`   With geofencing data: ${violationsWithGeofencing}`);
    console.log(`   In sensitive zones: ${violationsInZones}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error checking violations:", error.message);
    
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
  checkViolations();
}

module.exports = checkViolations;