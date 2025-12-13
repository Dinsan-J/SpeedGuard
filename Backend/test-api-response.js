require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");

/**
 * Test what the API is returning for violations
 */
async function testApiResponse() {
  try {
    console.log("🔍 Testing API response for violations...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get violations like the API does
    const violations = await Violation.find({ speed: { $gt: 70 } }).sort({
      timestamp: -1,
    }).limit(10);

    console.log(`\n📊 Found ${violations.length} violations (speed > 70):\n`);

    violations.forEach((violation, index) => {
      console.log(`${index + 1}. Violation ${violation._id}`);
      console.log(`   Vehicle: ${violation.vehicleId}`);
      console.log(`   Speed: ${violation.speed} km/h`);
      console.log(`   Speed Limit: ${violation.speedLimit || 'NOT SET'} km/h`);
      console.log(`   Location: ${violation.location.lat}, ${violation.location.lng}`);
      console.log(`   Base Fine: LKR ${violation.baseFine || 'NOT SET'}`);
      console.log(`   Final Fine: LKR ${violation.fine || 'NOT SET'}`);
      console.log(`   Zone Multiplier: ${violation.zoneMultiplier || 'NOT SET'}x`);
      console.log(`   Status: ${violation.status || 'NOT SET'}`);
      console.log(`   Timestamp: ${violation.timestamp}`);
      
      if (violation.sensitiveZone) {
        console.log(`   🚨 SENSITIVE ZONE:`);
        console.log(`      In Zone: ${violation.sensitiveZone.isInZone}`);
        console.log(`      Zone Type: ${violation.sensitiveZone.zoneType || 'NOT SET'}`);
        console.log(`      Zone Name: ${violation.sensitiveZone.zoneName || 'NOT SET'}`);
        console.log(`      Distance: ${violation.sensitiveZone.distanceFromZone ? Math.round(violation.sensitiveZone.distanceFromZone) + 'm' : 'NOT SET'}`);
        console.log(`      Radius: ${violation.sensitiveZone.zoneRadius ? violation.sensitiveZone.zoneRadius + 'm' : 'NOT SET'}`);
      } else {
        console.log(`   ❌ NO SENSITIVE ZONE DATA`);
      }
      console.log("");
    });

    // Check specifically for violations at the coordinates we're interested in
    const targetViolations = await Violation.find({
      "location.lat": { $gte: 8.760, $lte: 8.762 },
      "location.lng": { $gte: 80.440, $lte: 80.442 }
    }).sort({ timestamp: -1 });

    console.log(`\n🎯 Found ${targetViolations.length} violations near target coordinates (8.7611, 80.4416):`);
    
    targetViolations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation._id}`);
      console.log(`   Location: ${violation.location.lat}, ${violation.location.lng}`);
      console.log(`   Speed: ${violation.speed} km/h`);
      console.log(`   Speed Limit: ${violation.speedLimit || 'NOT SET'} km/h`);
      console.log(`   Fine: LKR ${violation.fine || 'NOT SET'}`);
      console.log(`   In Sensitive Zone: ${violation.sensitiveZone?.isInZone || 'NOT SET'}`);
      if (violation.sensitiveZone?.isInZone) {
        console.log(`   Zone: ${violation.sensitiveZone.zoneName} (${violation.sensitiveZone.zoneType})`);
      }
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error testing API response:", error.message);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testApiResponse();
}

module.exports = testApiResponse;