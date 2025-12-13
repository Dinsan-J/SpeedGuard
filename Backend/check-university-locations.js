require("dotenv").config();
const mongoose = require("mongoose");
const SensitiveLocation = require("./models/SensitiveLocation");
const geofencingService = require("./services/geofencingService");

/**
 * Check university locations around Vavuniya and the specific coordinates
 */
async function checkUniversityLocations() {
  try {
    console.log("🏫 Checking university locations in Vavuniya area...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const userCoordinates = {
      lat: 8.758910343111971,
      lng: 80.41069101388995
    };

    console.log(`\n📍 User coordinates: ${userCoordinates.lat}, ${userCoordinates.lng}`);
    console.log("─".repeat(60));

    // Find all universities in the database
    const universities = await SensitiveLocation.find({ type: 'university' });
    console.log(`\n🏫 Found ${universities.length} universities in database:`);

    if (universities.length === 0) {
      console.log("❌ No universities found in database!");
      console.log("This might be why the coordinates are not showing as sensitive.");
    }

    // Check universities in Vavuniya area (within 20km)
    const vavuniyaUniversities = [];
    
    for (const uni of universities) {
      const distance = geofencingService.calculateDistance(
        8.7514, 80.4971, // Vavuniya center
        uni.latitude, uni.longitude
      );

      if (distance <= 20000) { // Within 20km of Vavuniya
        vavuniyaUniversities.push({
          ...uni.toObject(),
          distanceFromVavuniya: Math.round(distance)
        });
      }
    }

    console.log(`\n🎓 Universities within 20km of Vavuniya: ${vavuniyaUniversities.length}`);
    
    vavuniyaUniversities.forEach((uni, index) => {
      console.log(`\n${index + 1}. ${uni.name}`);
      console.log(`   📍 Location: ${uni.latitude}, ${uni.longitude}`);
      console.log(`   📏 Distance from Vavuniya center: ${uni.distanceFromVavuniya}m`);
      console.log(`   🔵 Geofence radius: ${uni.radius}m`);
      
      // Check distance from user coordinates
      const distanceFromUser = geofencingService.calculateDistance(
        userCoordinates.lat, userCoordinates.lng,
        uni.latitude, uni.longitude
      );
      
      console.log(`   📏 Distance from user coordinates: ${Math.round(distanceFromUser)}m`);
      console.log(`   ${distanceFromUser <= uni.radius ? '🚨 USER IS WITHIN THIS UNIVERSITY ZONE!' : '✅ User outside this zone'}`);
    });

    // Search for "University of Vavuniya" specifically
    console.log(`\n🔍 Searching for 'University of Vavuniya' or similar...`);
    const vavuniyaUniSearch = await SensitiveLocation.find({
      type: 'university',
      name: { $regex: /vavuniya/i }
    });

    if (vavuniyaUniSearch.length > 0) {
      console.log(`✅ Found ${vavuniyaUniSearch.length} university(ies) with 'Vavuniya' in name:`);
      
      vavuniyaUniSearch.forEach((uni, index) => {
        console.log(`\n${index + 1}. ${uni.name}`);
        console.log(`   📍 Location: ${uni.latitude}, ${uni.longitude}`);
        console.log(`   🔵 Radius: ${uni.radius}m`);
        
        const distanceFromUser = geofencingService.calculateDistance(
          userCoordinates.lat, userCoordinates.lng,
          uni.latitude, uni.longitude
        );
        
        console.log(`   📏 Distance from user coordinates: ${Math.round(distanceFromUser)}m`);
        console.log(`   ${distanceFromUser <= uni.radius ? '🚨 USER IS WITHIN THIS ZONE!' : '✅ User outside this zone'}`);
      });
    } else {
      console.log(`❌ No universities found with 'Vavuniya' in the name!`);
      console.log(`This could be why the coordinates are not detected as sensitive.`);
    }

    // Check if we need to add University of Vavuniya manually
    console.log(`\n💡 Possible solutions:`);
    console.log(`1. University of Vavuniya might not be in OpenStreetMap data`);
    console.log(`2. It might be named differently in OSM`);
    console.log(`3. We might need to add it manually to the database`);

    // Let's also check what the closest locations are to the user coordinates
    console.log(`\n🔍 Checking what's closest to user coordinates...`);
    const allLocations = await SensitiveLocation.find({});
    const nearbyLocations = [];
    
    for (const location of allLocations) {
      const distance = geofencingService.calculateDistance(
        userCoordinates.lat, userCoordinates.lng,
        location.latitude, location.longitude
      );

      if (distance <= 2000) { // Within 2km
        nearbyLocations.push({
          ...location.toObject(),
          distanceFromUser: Math.round(distance)
        });
      }
    }

    nearbyLocations.sort((a, b) => a.distanceFromUser - b.distanceFromUser);

    console.log(`\n📍 Locations within 2km of user coordinates:`);
    nearbyLocations.slice(0, 5).forEach((loc, index) => {
      console.log(`${index + 1}. ${loc.name} (${loc.type}) - ${loc.distanceFromUser}m away`);
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error checking universities:", error.message);
    console.error(error.stack);
    
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
  checkUniversityLocations();
}

module.exports = checkUniversityLocations;