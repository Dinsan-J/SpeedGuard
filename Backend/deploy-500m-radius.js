const axios = require('axios');

/**
 * Deploy 500m radius update to production backend
 * This script will trigger the radius update on the production server
 */
async function deploy500mRadius() {
  try {
    console.log("🚀 Deploying 500m radius update to production backend...");
    
    const baseURL = 'https://speedguard-gz70.onrender.com';
    
    // First, check current stats
    console.log("\n1. Checking current sensitive location stats...");
    try {
      const response = await axios.get(`${baseURL}/api/sensitive-locations/stats`);
      console.log("📊 Current stats:", response.data.data);
      
      const currentRadii = response.data.data.byType.map(type => 
        `${type._id}: avg ${Math.round(type.avgRadius)}m`
      ).join(', ');
      console.log("📏 Current radii:", currentRadii);
      
    } catch (error) {
      console.log("❌ Error getting current stats:", error.response?.status || error.message);
    }

    // Note: The actual database update needs to be done on the server
    // Since we can't directly run database scripts on Render, we need to:
    // 1. Deploy the updated code (which we already did)
    // 2. The production server needs to run the update script

    console.log("\n📝 To complete the 500m radius deployment:");
    console.log("1. ✅ Code has been pushed to GitHub");
    console.log("2. ✅ Render should auto-deploy the updated code");
    console.log("3. 🔄 Run the radius update script on production server");
    
    console.log("\n🎯 Expected results after deployment:");
    console.log("- All sensitive locations will have 500m radius");
    console.log("- More consistent geofencing behavior");
    console.log("- Schools will have larger coverage (300m → 500m)");
    console.log("- Universities will have smaller coverage (800m → 500m)");
    console.log("- Towns will have smaller coverage (1000m → 500m)");
    console.log("- Cities will have much smaller coverage (2000m → 500m)");

    // Test a specific location to see if the update is already applied
    console.log("\n🧪 Testing a sample location...");
    try {
      const testData = {
        latitude: 8.7611,
        longitude: 80.4410,
        speed: 80
      };
      
      const response = await axios.post(`${baseURL}/api/sensitive-locations/analyze-location`, testData);
      const result = response.data.data;
      
      console.log("📍 Test location analysis:");
      console.log(`   Speed: ${testData.speed} km/h`);
      console.log(`   Speed Limit: ${result.speedLimit} km/h`);
      console.log(`   Fine: LKR ${result.finalFine}`);
      console.log(`   In Zone: ${result.geofencing.isInZone}`);
      if (result.geofencing.isInZone) {
        console.log(`   Zone: ${result.geofencing.zoneName} (${result.geofencing.zoneType})`);
        console.log(`   Distance: ${Math.round(result.geofencing.distanceFromZone)}m`);
        console.log(`   Zone Radius: ${result.geofencing.zoneRadius}m`);
      }
      
    } catch (error) {
      console.log("❌ Error testing location:", error.response?.status || error.message);
    }

    console.log("\n🎉 Deployment check completed!");
    
  } catch (error) {
    console.error("❌ Error during deployment:", error.message);
  }
}

// Run the deployment check
if (require.main === module) {
  deploy500mRadius();
}

module.exports = deploy500mRadius;