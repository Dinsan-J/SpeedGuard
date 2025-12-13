require("dotenv").config();
const mongoose = require("mongoose");
const geofencingService = require("./services/geofencingService");
const osmService = require("./services/osmService");

/**
 * Test script for geofencing functionality
 * Tests various scenarios with different locations and speeds
 */
async function testGeofencing() {
  try {
    console.log("🧪 Starting geofencing tests...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Test locations in Sri Lanka
    const testCases = [
      {
        name: "Colombo General Hospital area",
        latitude: 6.9271,
        longitude: 79.8612,
        speed: 80,
        description: "High speed near major hospital (should be 50 km/h limit)"
      },
      {
        name: "University of Colombo area", 
        latitude: 6.9022,
        longitude: 79.8607,
        speed: 75,
        description: "Moderate violation near university (should be 50 km/h limit)"
      },
      {
        name: "Kandy city center",
        latitude: 7.2906,
        longitude: 80.6337,
        speed: 90,
        description: "High speed in city center (should be 50 km/h limit)"
      },
      {
        name: "Rural road (no sensitive zones)",
        latitude: 7.5000,
        longitude: 80.0000,
        speed: 85,
        description: "High speed on normal road (should be 70 km/h limit)"
      },
      {
        name: "School zone test",
        latitude: 6.9147,
        longitude: 79.8731,
        speed: 65,
        description: "Moderate speed near school (should be 50 km/h limit)"
      },
      {
        name: "Normal road - no violation",
        latitude: 7.5000,
        longitude: 80.0000,
        speed: 65,
        description: "Normal speed on normal road (should be 70 km/h limit - no violation)"
      },
      {
        name: "Sensitive zone - no violation",
        latitude: 6.9271,
        longitude: 79.8612,
        speed: 45,
        description: "Normal speed near hospital (should be 50 km/h limit - no violation)"
      }
    ];

    console.log("\n📊 Running test cases...\n");

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`🔍 Test ${i + 1}: ${testCase.name}`);
      console.log(`📍 Location: ${testCase.latitude}, ${testCase.longitude}`);
      console.log(`🚗 Speed: ${testCase.speed} km/h`);
      console.log(`📝 Description: ${testCase.description}`);

      try {
        const result = await geofencingService.calculateViolationFine(
          testCase.speed,
          testCase.latitude,
          testCase.longitude
        );

        console.log(`🚦 Speed Limit: ${result.speedLimit} km/h (${result.geofencing.isInZone ? 'Sensitive Zone' : 'Normal Road'})`);
        console.log(`📊 Speed Violation: ${result.isViolation ? '+' + result.speedViolation + ' km/h' : 'No violation'}`);
        
        if (result.isViolation) {
          console.log(`💰 Base Fine: LKR ${result.baseFine}`);
          console.log(`💰 Final Fine: LKR ${result.finalFine}`);
        } else {
          console.log(`✅ No violation - within speed limit`);
        }
        
        if (result.geofencing.isInZone) {
          console.log(`🚨 IN SENSITIVE ZONE: ${result.geofencing.zoneName} (${result.geofencing.zoneType})`);
          console.log(`📏 Distance from zone center: ${Math.round(result.geofencing.distanceFromZone)}m`);
          console.log(`🔄 Fine multiplier: ${result.geofencing.multiplier}x`);
        } else {
          console.log(`✅ Not in sensitive zone`);
          if (result.geofencing.closestZone) {
            console.log(`📍 Closest zone: ${result.geofencing.closestZone.name} (${Math.round(result.geofencing.closestZone.distance)}m away)`);
          }
        }
        
        console.log("─".repeat(60));
      } catch (error) {
        console.error(`❌ Error in test case: ${error.message}`);
        console.log("─".repeat(60));
      }
    }

    // Get statistics
    console.log("\n📈 Getting sensitive location statistics...");
    const stats = await geofencingService.getSensitiveLocationStats();
    
    if (stats) {
      console.log(`📊 Total sensitive locations: ${stats.total}`);
      console.log("📋 Breakdown by type:");
      stats.byType.forEach(type => {
        console.log(`   ${type._id}: ${type.count} locations (avg radius: ${Math.round(type.avgRadius)}m)`);
      });
      
      if (stats.lastUpdated) {
        console.log(`🕒 Last updated: ${stats.lastUpdated.updatedAt}`);
      }
    }

    console.log("\n🎉 Geofencing tests completed successfully!");
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testGeofencing();
}

module.exports = testGeofencing;