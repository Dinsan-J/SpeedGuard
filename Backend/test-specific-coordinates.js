require("dotenv").config();
const mongoose = require("mongoose");
const SensitiveLocation = require("./models/SensitiveLocation");
const geofencingService = require("./services/geofencingService");

/**
 * Test script to check specific coordinates for geofencing
 */
async function testSpecificCoordinates() {
  try {
    console.log("🔍 Testing specific coordinates for geofencing...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Test coordinates
    const testLat = 8.7611;
    const testLng = 80.4410;
    
    console.log(`\n📍 Testing location: ${testLat}, ${testLng}`);
    console.log("─".repeat(60));

    // Find nearby sensitive locations
    const allLocations = await SensitiveLocation.find({});
    const nearbyLocations = [];
    
    for (const location of allLocations) {
      const distance = geofencingService.calculateDistance(
        testLat, testLng,
        location.latitude, location.longitude
      );

      // Show locations within 5km
      if (distance <= 5000) {
        nearbyLocations.push({
          ...location.toObject(),
          distanceFromTest: Math.round(distance)
        });
      }
    }

    // Sort by distance
    nearbyLocations.sort((a, b) => a.distanceFromTest - b.distanceFromTest);

    console.log(`🏢 Found ${nearbyLocations.length} sensitive locations within 5km:\n`);

    // Show closest 10 locations
    nearbyLocations.slice(0, 10).forEach((loc, index) => {
      console.log(`${index + 1}. ${loc.name} (${loc.type})`);
      console.log(`   📍 Location: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`);
      console.log(`   📏 Distance: ${loc.distanceFromTest}m`);
      console.log(`   🔵 Geofence radius: ${loc.radius}m`);
      console.log(`   ${loc.distanceFromTest <= loc.radius ? '🚨 WITHIN GEOFENCE' : '✅ Outside geofence'}`);
      if (loc.address) {
        console.log(`   🏠 Address: ${loc.address}`);
      }
      console.log("");
    });

    // Test different speed scenarios at this location
    const speedTests = [60, 70, 80, 90, 100];
    
    console.log("\n🧪 Testing different speeds at this location:");
    console.log("─".repeat(60));

    for (const speed of speedTests) {
      console.log(`\n🚗 Speed: ${speed} km/h`);
      
      const result = await geofencingService.calculateViolationFine(
        speed, testLat, testLng
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
        if (result.geofencing.isInZone) {
          console.log(`📍 Location is in sensitive zone: ${result.geofencing.zoneName} (${result.geofencing.zoneType})`);
        }
      }
    }

    // Detailed analysis of the location
    console.log("\n📊 Location Analysis:");
    console.log("─".repeat(40));
    
    const analysis = await geofencingService.analyzeViolationLocation(testLat, testLng);
    
    if (analysis.isInZone) {
      console.log(`🚨 This location IS within a sensitive zone`);
      console.log(`🏢 Zone: ${analysis.zoneName} (${analysis.zoneType})`);
      console.log(`📏 Distance from zone center: ${Math.round(analysis.distanceFromZone)}m`);
      console.log(`🔵 Zone radius: ${analysis.zoneRadius}m`);
      console.log(`🔄 Fine multiplier: ${analysis.multiplier}x`);
    } else {
      console.log(`✅ This location is NOT within any sensitive zone`);
      if (analysis.closestZone) {
        console.log(`📍 Closest sensitive zone: ${analysis.closestZone.name} (${analysis.closestZone.type})`);
        console.log(`📏 Distance to closest zone: ${Math.round(analysis.closestZone.distance)}m`);
      }
    }

    // Check if this is in Vavuniya area
    const vavuniyaLat = 8.7514;
    const vavuniyaLng = 80.4971;
    const distanceFromVavuniya = geofencingService.calculateDistance(
      testLat, testLng, vavuniyaLat, vavuniyaLng
    );
    
    console.log(`\n📍 Distance from Vavuniya city center: ${Math.round(distanceFromVavuniya)}m (${(distanceFromVavuniya/1000).toFixed(1)}km)`);

    console.log("\n🎉 Coordinate analysis completed!");
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error testing coordinates:", error.message);
    console.error(error.stack);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testSpecificCoordinates();
}

module.exports = testSpecificCoordinates;