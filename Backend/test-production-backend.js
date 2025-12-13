const axios = require('axios');

/**
 * Test production backend for geofencing capabilities
 */
async function testProductionBackend() {
  try {
    console.log("🔍 Testing production backend geofencing capabilities...");
    
    const baseURL = 'https://speedguard-gz70.onrender.com';
    
    // Test 1: Check if sensitive locations endpoint exists
    console.log("\n1. Testing sensitive locations endpoint...");
    try {
      const response = await axios.get(`${baseURL}/api/sensitive-locations/stats`);
      console.log("✅ Sensitive locations endpoint available");
      console.log("📊 Stats:", response.data);
    } catch (error) {
      console.log("❌ Sensitive locations endpoint not available:", error.response?.status || error.message);
    }

    // Test 2: Check violations endpoint
    console.log("\n2. Testing violations endpoint...");
    try {
      const response = await axios.get(`${baseURL}/api/violation`);
      console.log("✅ Violations endpoint available");
      console.log(`📊 Found ${response.data.violations?.length || 0} violations`);
      
      // Check if any violations have geofencing data
      const violationsWithGeofencing = response.data.violations?.filter(v => 
        v.sensitiveZone && v.baseFine && v.speedLimit
      ) || [];
      
      console.log(`🎯 Violations with geofencing data: ${violationsWithGeofencing.length}`);
      
      if (violationsWithGeofencing.length > 0) {
        console.log("✅ Production backend has geofencing data!");
        violationsWithGeofencing.slice(0, 3).forEach((v, i) => {
          console.log(`   ${i+1}. ${v.vehicleId}: ${v.speed} km/h, LKR ${v.fine}, Zone: ${v.sensitiveZone.isInZone ? v.sensitiveZone.zoneName : 'Normal'}`);
        });
      } else {
        console.log("⚠️ No violations with geofencing data found");
      }
      
    } catch (error) {
      console.log("❌ Violations endpoint error:", error.response?.status || error.message);
    }

    // Test 3: Check if we can analyze a location
    console.log("\n3. Testing location analysis...");
    try {
      const testData = {
        latitude: 8.7611,
        longitude: 80.4410,
        speed: 80
      };
      
      const response = await axios.post(`${baseURL}/api/sensitive-locations/analyze-location`, testData);
      console.log("✅ Location analysis endpoint available");
      console.log("🎯 Analysis result:", response.data.data);
    } catch (error) {
      console.log("❌ Location analysis endpoint not available:", error.response?.status || error.message);
    }

    // Test 4: Check vehicles endpoint
    console.log("\n4. Testing vehicles endpoint...");
    try {
      const userId = "64f8c2e2a1b2c3d4e5f6a7b8";
      const response = await axios.get(`${baseURL}/api/vehicle/user/${userId}`);
      console.log("✅ Vehicles endpoint available");
      console.log(`📊 Found ${response.data.vehicles?.length || 0} vehicles`);
    } catch (error) {
      console.log("❌ Vehicles endpoint error:", error.response?.status || error.message);
    }

    console.log("\n🎉 Production backend test completed!");
    
  } catch (error) {
    console.error("❌ Error testing production backend:", error.message);
  }
}

// Run the test
if (require.main === module) {
  testProductionBackend();
}

module.exports = testProductionBackend;