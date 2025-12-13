require("dotenv").config();
const mongoose = require("mongoose");
const SensitiveLocation = require("./models/SensitiveLocation");
const geofencingService = require("./services/geofencingService");

/**
 * Test script to check sensitive locations in Vavuniya area
 * Vavuniya coordinates: approximately 8.7514° N, 80.4971° E
 */
async function checkVavuniyaLocations() {
  try {
    console.log("🔍 Checking sensitive locations in Vavuniya area...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Vavuniya coordinates (approximate city center)
    const vavuniyaLat = 8.7514;
    const vavuniyaLng = 80.4971;
    const searchRadius = 20000; // 20km radius around Vavuniya

    console.log(`\n📍 Searching within ${searchRadius/1000}km of Vavuniya (${vavuniyaLat}, ${vavuniyaLng})\n`);

    // Find all sensitive locations
    const allLocations = await SensitiveLocation.find({});
    console.log(`📊 Total locations in database: ${allLocations.length}`);

    // Filter locations within Vavuniya area
    const vavuniyaLocations = [];
    
    for (const location of allLocations) {
      const distance = geofencingService.calculateDistance(
        vavuniyaLat, vavuniyaLng,
        location.latitude, location.longitude
      );

      if (distance <= searchRadius) {
        vavuniyaLocations.push({
          ...location.toObject(),
          distanceFromVavuniya: Math.round(distance)
        });
      }
    }

    // Sort by distance from Vavuniya center
    vavuniyaLocations.sort((a, b) => a.distanceFromVavuniya - b.distanceFromVavuniya);

    console.log(`🏢 Found ${vavuniyaLocations.length} sensitive locations in Vavuniya area:\n`);

    // Group by type
    const locationsByType = {};
    vavuniyaLocations.forEach(loc => {
      if (!locationsByType[loc.type]) {
        locationsByType[loc.type] = [];
      }
      locationsByType[loc.type].push(loc);
    });

    // Display results by type
    Object.keys(locationsByType).forEach(type => {
      const locations = locationsByType[type];
      console.log(`\n🏷️  ${type.toUpperCase()} (${locations.length} locations):`);
      console.log("─".repeat(80));
      
      locations.slice(0, 10).forEach((loc, index) => { // Show top 10 per type
        console.log(`${index + 1}. ${loc.name}`);
        console.log(`   📍 Location: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`);
        console.log(`   📏 Distance from Vavuniya: ${loc.distanceFromVavuniya}m`);
        console.log(`   🔵 Geofence radius: ${loc.radius}m`);
        if (loc.address) {
          console.log(`   🏠 Address: ${loc.address}`);
        }
        console.log("");
      });

      if (locations.length > 10) {
        console.log(`   ... and ${locations.length - 10} more ${type}s\n`);
      }
    });

    // Test geofencing for Vavuniya city center
    console.log("\n🧪 Testing geofencing at Vavuniya city center:");
    console.log("─".repeat(60));
    
    const testCases = [
      {
        name: "Vavuniya city center",
        lat: 8.7514,
        lng: 80.4971,
        speed: 80,
        description: "High speed in Vavuniya center"
      },
      {
        name: "Vavuniya Hospital area",
        lat: 8.7500,
        lng: 80.4980,
        speed: 75,
        description: "Moderate speed near hospital"
      },
      {
        name: "Vavuniya outskirts",
        lat: 8.7600,
        lng: 80.5100,
        speed: 85,
        description: "High speed on outskirts"
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Test: ${testCase.name}`);
      console.log(`📍 Location: ${testCase.lat}, ${testCase.lng}`);
      console.log(`🚗 Speed: ${testCase.speed} km/h`);
      
      const result = await geofencingService.calculateViolationFine(
        testCase.speed,
        testCase.lat,
        testCase.lng
      );

      console.log(`🚦 Speed Limit: ${result.speedLimit} km/h (${result.geofencing.isInZone ? 'Sensitive Zone' : 'Normal Road'})`);
      
      if (result.isViolation) {
        console.log(`📊 Speed Violation: +${result.speedViolation} km/h`);
        console.log(`💰 Base Fine: LKR ${result.baseFine}`);
        console.log(`💰 Final Fine: LKR ${result.finalFine}`);
        
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
      } else {
        console.log(`✅ No violation - within speed limit`);
      }
    }

    // Summary statistics for Vavuniya
    console.log("\n📈 Vavuniya Area Summary:");
    console.log("─".repeat(40));
    console.log(`🏢 Total sensitive locations: ${vavuniyaLocations.length}`);
    Object.keys(locationsByType).forEach(type => {
      console.log(`   ${type}: ${locationsByType[type].length} locations`);
    });

    if (vavuniyaLocations.length > 0) {
      const avgDistance = Math.round(
        vavuniyaLocations.reduce((sum, loc) => sum + loc.distanceFromVavuniya, 0) / vavuniyaLocations.length
      );
      console.log(`📏 Average distance from city center: ${avgDistance}m`);
      
      const closestLocation = vavuniyaLocations[0];
      console.log(`📍 Closest sensitive location: ${closestLocation.name} (${closestLocation.distanceFromVavuniya}m)`);
    }

    console.log("\n🎉 Vavuniya location check completed!");
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error checking Vavuniya locations:", error.message);
    console.error(error.stack);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkVavuniyaLocations();
}

module.exports = checkVavuniyaLocations;