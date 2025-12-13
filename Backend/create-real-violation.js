require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");
const geofencingService = require("./services/geofencingService");

/**
 * Create a real violation directly in the database with proper geofencing
 */
async function createRealViolation() {
  try {
    console.log("🚨 Creating real violation with geofencing data...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Test scenarios
    const testViolations = [
      {
        vehicleId: "TEST-001",
        location: { lat: 8.7611, lng: 80.4410 }, // Hospital zone
        speed: 80,
        description: "Hospital zone violation"
      },
      {
        vehicleId: "TEST-002", 
        location: { lat: 8.7503, lng: 80.4973 }, // School zone (V/Vavuniya Tamil Maha Vidyalayam)
        speed: 75,
        description: "School zone violation"
      },
      {
        vehicleId: "TEST-003",
        location: { lat: 7.5000, lng: 80.0000 }, // Normal road
        speed: 85,
        description: "Normal road violation"
      }
    ];

    for (const testData of testViolations) {
      console.log(`\n🔄 Creating violation: ${testData.description}`);
      console.log(`   Location: ${testData.location.lat}, ${testData.location.lng}`);
      console.log(`   Speed: ${testData.speed} km/h`);

      // Calculate geofencing data
      const analysis = await geofencingService.calculateViolationFine(
        testData.speed,
        testData.location.lat,
        testData.location.lng
      );

      if (analysis.isViolation) {
        // Create violation with complete geofencing data
        const violation = new Violation({
          vehicleId: testData.vehicleId,
          location: testData.location,
          speed: testData.speed,
          speedLimit: analysis.speedLimit,
          timestamp: new Date(),
          status: "pending",
          baseFine: analysis.baseFine,
          fine: analysis.finalFine,
          zoneMultiplier: analysis.geofencing.multiplier,
          sensitiveZone: {
            isInZone: analysis.geofencing.isInZone,
            zoneType: analysis.geofencing.zoneType,
            zoneName: analysis.geofencing.zoneName,
            distanceFromZone: analysis.geofencing.distanceFromZone,
            zoneRadius: analysis.geofencing.zoneRadius
          }
        });

        await violation.save();

        console.log(`   ✅ Created violation ${violation._id}`);
        console.log(`   🚦 Speed Limit: ${analysis.speedLimit} km/h`);
        console.log(`   💰 Base Fine: LKR ${analysis.baseFine}`);
        console.log(`   💰 Final Fine: LKR ${analysis.finalFine}`);
        console.log(`   🔄 Zone Multiplier: ${analysis.geofencing.multiplier}x`);
        
        if (analysis.geofencing.isInZone) {
          console.log(`   🚨 IN SENSITIVE ZONE: ${analysis.geofencing.zoneName} (${analysis.geofencing.zoneType})`);
          console.log(`   📏 Distance: ${Math.round(analysis.geofencing.distanceFromZone)}m`);
        } else {
          console.log(`   ✅ Normal road`);
        }
      } else {
        console.log(`   ⚠️ No violation created (speed within limit)`);
      }
    }

    console.log(`\n🎉 Test violations created! Check your dashboard now.`);
    console.log(`🌐 Dashboard URL: http://localhost:8080/user/dashboard`);

    // Show the created violations
    const newViolations = await Violation.find({
      vehicleId: { $in: ["TEST-001", "TEST-002", "TEST-003"] }
    }).sort({ timestamp: -1 });

    console.log(`\n📊 Created ${newViolations.length} test violations:`);
    newViolations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.vehicleId} - ${violation._id}`);
      console.log(`   Speed: ${violation.speed} km/h (Limit: ${violation.speedLimit} km/h)`);
      console.log(`   Fine: LKR ${violation.fine} (Base: LKR ${violation.baseFine}, ${violation.zoneMultiplier}x)`);
      
      if (violation.sensitiveZone && violation.sensitiveZone.isInZone) {
        console.log(`   🚨 SENSITIVE ZONE: ${violation.sensitiveZone.zoneName} (${violation.sensitiveZone.zoneType})`);
      } else {
        console.log(`   ✅ Normal road`);
      }
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error creating violations:", error.message);
    console.error(error.stack);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the creation
if (require.main === module) {
  createRealViolation();
}

module.exports = createRealViolation;