require("dotenv").config();
const mongoose = require("mongoose");
const SensitiveLocation = require("./models/SensitiveLocation");
const geofencingService = require("./services/geofencingService");

/**
 * Add University of Vavuniya manually to the database
 */
async function addUniversityVavuniya() {
  try {
    console.log("🏫 Adding University of Vavuniya to database...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // University of Vavuniya coordinates (user provided)
    const universityData = {
      name: "University of Vavuniya",
      type: "university",
      latitude: 8.758910343111971,
      longitude: 80.41069101388995,
      radius: 500, // 500m radius for universities
      address: "Vavuniya, Sri Lanka",
      source: "manual_addition"
    };

    console.log(`\n📍 University details:`);
    console.log(`   Name: ${universityData.name}`);
    console.log(`   Location: ${universityData.latitude}, ${universityData.longitude}`);
    console.log(`   Radius: ${universityData.radius}m`);
    console.log(`   Type: ${universityData.type}`);

    // Check if it already exists
    const existing = await SensitiveLocation.findOne({
      name: universityData.name,
      type: universityData.type
    });

    if (existing) {
      console.log(`⚠️ University of Vavuniya already exists in database!`);
      console.log(`   Existing location: ${existing.latitude}, ${existing.longitude}`);
      console.log(`   Distance from user coordinates: ${Math.round(geofencingService.calculateDistance(
        universityData.latitude, universityData.longitude,
        existing.latitude, existing.longitude
      ))}m`);
      
      // Update the existing one with correct coordinates
      existing.latitude = universityData.latitude;
      existing.longitude = universityData.longitude;
      existing.radius = universityData.radius;
      existing.address = universityData.address;
      existing.source = universityData.source;
      
      await existing.save();
      console.log(`✅ Updated existing University of Vavuniya with correct coordinates`);
    } else {
      // Create new university location
      const university = new SensitiveLocation(universityData);
      await university.save();
      console.log(`✅ Added University of Vavuniya to database: ${university._id}`);
    }

    // Now test the user coordinates again
    console.log(`\n🧪 Testing user coordinates with new university data...`);
    
    const testResult = await geofencingService.analyzeViolationLocation(
      universityData.latitude, 
      universityData.longitude
    );

    console.log(`\n📊 Geofencing analysis result:`);
    if (testResult.isInZone) {
      console.log(`🚨 SUCCESS! Location IS now within a sensitive zone`);
      console.log(`🏢 Zone: ${testResult.zoneName} (${testResult.zoneType})`);
      console.log(`📏 Distance from zone center: ${Math.round(testResult.distanceFromZone)}m`);
      console.log(`🔵 Zone radius: ${testResult.zoneRadius}m`);
      console.log(`🔄 Fine multiplier: ${testResult.multiplier}x`);
    } else {
      console.log(`❌ Still not detected as sensitive zone`);
      console.log(`📍 Closest zone: ${testResult.closestZone?.name} (${Math.round(testResult.closestZone?.distance)}m away)`);
    }

    // Test a violation at this location
    console.log(`\n🚗 Testing violation calculation at university location...`);
    const violationTest = await geofencingService.calculateViolationFine(
      85, // 85 km/h speed
      universityData.latitude,
      universityData.longitude
    );

    console.log(`\n📊 Violation test results:`);
    console.log(`🚦 Speed Limit: ${violationTest.speedLimit} km/h (${violationTest.geofencing.isInZone ? 'Sensitive Zone' : 'Normal Road'})`);
    console.log(`📊 Speed Violation: +${violationTest.speedViolation} km/h`);
    console.log(`💰 Base Fine: LKR ${violationTest.baseFine}`);
    console.log(`💰 Final Fine: LKR ${violationTest.finalFine}`);
    console.log(`🔄 Zone Multiplier: ${violationTest.geofencing.multiplier}x`);
    
    if (violationTest.geofencing.isInZone) {
      console.log(`🚨 IN SENSITIVE ZONE: ${violationTest.geofencing.zoneName} (${violationTest.geofencing.zoneType})`);
      console.log(`📏 Distance from zone center: ${Math.round(violationTest.geofencing.distanceFromZone)}m`);
    } else {
      console.log(`❌ Still showing as normal road`);
    }

    // Get updated stats
    const stats = await SensitiveLocation.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`\n📊 Updated database stats:`);
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} locations`);
    });

    console.log(`\n🎉 University of Vavuniya has been added to the database!`);
    console.log(`Now create a new violation to test the updated geofencing.`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error adding university:", error.message);
    console.error(error.stack);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the addition
if (require.main === module) {
  addUniversityVavuniya();
}

module.exports = addUniversityVavuniya;