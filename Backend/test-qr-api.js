const axios = require('axios');

async function testQRAPI() {
  try {
    console.log("🧪 Testing QR Scanner API...");
    
    const API_URL = "https://speedguard-gz70.onrender.com";
    const vehicleId = "QR-ABC-123";
    
    // Test 1: Scan vehicle QR
    console.log("\n1️⃣ Testing vehicle QR scan...");
    console.log(`📡 GET ${API_URL}/api/police/scan/${vehicleId}`);
    
    try {
      const scanResponse = await axios.get(`${API_URL}/api/police/scan/${vehicleId}`, {
        timeout: 10000
      });
      
      if (scanResponse.status === 200) {
        console.log("✅ QR Scan successful!");
        const data = scanResponse.data.data;
        
        console.log(`🚗 Vehicle: ${data.vehicle.plateNumber} (${data.vehicle.make} ${data.vehicle.model})`);
        console.log(`👤 Owner: ${data.vehicle.owner?.username || 'N/A'}`);
        console.log(`📡 IoT: ${data.vehicle.iotDeviceId} (Speed: ${data.vehicle.currentSpeed} km/h)`);
        console.log(`🚨 Pending Violations: ${data.pendingViolations.length}`);
        
        if (data.recentDriver) {
          console.log(`👮 Recent Driver: ${data.recentDriver.fullName}`);
          console.log(`🎯 Merit Points: ${data.recentDriver.meritPoints}/100 (${data.recentDriver.status.toUpperCase()})`);
        }
        
        data.pendingViolations.forEach((violation, index) => {
          console.log(`   ${index + 1}. ${violation.speed} km/h → LKR ${violation.finalFine.toLocaleString()} (${violation.riskLevel.toUpperCase()} risk)`);
        });
        
        // Test 2: Quick confirm violation if any pending
        if (data.pendingViolations.length > 0) {
          console.log("\n2️⃣ Testing quick violation confirmation...");
          const violationId = data.pendingViolations[0]._id;
          const driverLicenseId = "QR-B1234567";
          
          console.log(`📡 POST ${API_URL}/api/police/violations/${violationId}/quick-confirm`);
          console.log(`👤 Driver License: ${driverLicenseId}`);
          
          try {
            const confirmResponse = await axios.post(`${API_URL}/api/police/violations/${violationId}/quick-confirm`, {
              drivingLicenseId: driverLicenseId,
              quickConfirm: true
            }, {
              timeout: 10000,
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (confirmResponse.status === 200) {
              console.log("✅ Violation confirmation successful!");
              const confirmData = confirmResponse.data;
              console.log(`👤 Driver: ${confirmData.driver?.fullName || 'N/A'}`);
              console.log(`🎯 Merit points deducted: ${confirmData.meritPointsDeducted || 'N/A'}`);
              console.log(`📊 New merit points: ${confirmData.driver?.meritPoints || 'N/A'}`);
              console.log(`📈 Driver status: ${confirmData.driver?.status?.toUpperCase() || 'N/A'}`);
            } else {
              console.log(`⚠️ Confirmation response status: ${confirmResponse.status}`);
            }
          } catch (confirmError) {
            if (confirmError.response) {
              console.log(`❌ Confirmation API error: ${confirmError.response.status}`);
              console.log(`   Message: ${confirmError.response.data?.message || 'Unknown error'}`);
            } else {
              console.log(`❌ Confirmation network error: ${confirmError.message}`);
            }
          }
        } else {
          console.log("\n2️⃣ No pending violations to confirm");
        }
        
      } else {
        console.log(`⚠️ Scan response status: ${scanResponse.status}`);
      }
    } catch (scanError) {
      if (scanError.response) {
        console.log(`❌ Scan API error: ${scanError.response.status}`);
        console.log(`   Message: ${scanError.response.data?.message || 'Unknown error'}`);
      } else {
        console.log(`❌ Scan network error: ${scanError.message}`);
      }
    }
    
    console.log("\n🎉 QR API test completed!");
    
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

// Run the API test
if (require.main === module) {
  testQRAPI();
}

module.exports = testQRAPI;