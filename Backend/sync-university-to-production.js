require("dotenv").config();
const axios = require("axios");

/**
 * Sync University of Vavuniya to production backend
 */
async function syncUniversityToProduction() {
  try {
    console.log("🌐 Syncing University of Vavuniya to production backend...");
    
    const productionUrl = "https://speedguard-gz70.onrender.com";
    
    // University data to add
    const universityData = {
      name: "University of Vavuniya",
      type: "university",
      latitude: 8.758910343111971,
      longitude: 80.41069101388995,
      radius: 500,
      address: "Vavuniya, Sri Lanka",
      source: "manual_addition"
    };

    console.log(`📍 Adding university to production:`);
    console.log(`   Name: ${universityData.name}`);
    console.log(`   Location: ${universityData.latitude}, ${universityData.longitude}`);
    console.log(`   Radius: ${universityData.radius}m`);

    try {
      // Try to add the university to production
      const response = await axios.post(`${productionUrl}/api/sensitive-locations`, universityData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Successfully added University of Vavuniya to production!`);
        console.log(`   Response: ${response.data.message || 'Success'}`);
      } else {
        console.log(`⚠️ Unexpected response status: ${response.status}`);
      }
    } catch (apiError) {
      if (apiError.response) {
        console.log(`⚠️ API responded with error: ${apiError.response.status}`);
        console.log(`   Message: ${apiError.response.data?.message || 'Unknown error'}`);
        
        if (apiError.response.status === 409) {
          console.log(`ℹ️ University might already exist in production database`);
        }
      } else {
        console.log(`❌ Network error: ${apiError.message}`);
        console.log(`ℹ️ This might be because the production API doesn't have an endpoint to add locations`);
        console.log(`   The university was added to your local database successfully.`);
      }
    }

    // Test the production backend to see current stats
    console.log(`\n🔍 Checking production backend stats...`);
    
    try {
      const statsResponse = await axios.get(`${productionUrl}/api/sensitive-locations/stats`, {
        timeout: 10000
      });

      if (statsResponse.status === 200) {
        console.log(`✅ Production backend stats:`);
        const stats = statsResponse.data.data;
        console.log(`   Total locations: ${stats.total}`);
        
        if (stats.byType) {
          stats.byType.forEach(type => {
            console.log(`   ${type._id}: ${type.count} locations`);
          });
        }
      }
    } catch (statsError) {
      console.log(`⚠️ Could not fetch production stats: ${statsError.message}`);
    }

    // Test geofencing at the university coordinates
    console.log(`\n🧪 Testing geofencing at university coordinates on production...`);
    
    try {
      const testResponse = await axios.post(`${productionUrl}/api/geofencing/analyze`, {
        latitude: universityData.latitude,
        longitude: universityData.longitude,
        speed: 85
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (testResponse.status === 200) {
        const result = testResponse.data;
        console.log(`✅ Production geofencing test result:`);
        console.log(`   Speed Limit: ${result.speedLimit} km/h`);
        console.log(`   Base Fine: LKR ${result.baseFine}`);
        console.log(`   Final Fine: LKR ${result.finalFine}`);
        console.log(`   In Zone: ${result.geofencing.isInZone ? 'YES' : 'NO'}`);
        
        if (result.geofencing.isInZone) {
          console.log(`   Zone: ${result.geofencing.zoneName} (${result.geofencing.zoneType})`);
          console.log(`   Multiplier: ${result.geofencing.multiplier}x`);
        }
      }
    } catch (testError) {
      console.log(`⚠️ Could not test geofencing on production: ${testError.message}`);
      console.log(`ℹ️ This might be because the production API doesn't have this endpoint`);
    }

    console.log(`\n🎉 Sync process completed!`);
    console.log(`📱 Check your dashboard to see the updated violation with university geofencing.`);
    
  } catch (error) {
    console.error("❌ Error syncing to production:", error.message);
  }
}

// Run the sync
if (require.main === module) {
  syncUniversityToProduction();
}

module.exports = syncUniversityToProduction;