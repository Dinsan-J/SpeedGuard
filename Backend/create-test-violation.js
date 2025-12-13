require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

/**
 * Create a test violation at the hospital coordinates to verify geofencing
 */
async function createTestViolation() {
  try {
    console.log("🧪 Creating test violation at hospital coordinates...");
    
    // Test coordinates (hospital zone)
    const testData = {
      iotDeviceId: "TEST_HOSPITAL_ZONE",
      speed: 80,
      location: {
        lat: 8.7611,
        lng: 80.4410
      }
    };

    console.log("📍 Test location:", testData.location);
    console.log("🚗 Test speed:", testData.speed, "km/h");
    console.log("📡 Sending to IoT endpoint...");

    // Send to IoT endpoint
    const response = await axios.post('http://localhost:5000/api/iot/data', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log("✅ Test violation created successfully!");
      console.log("\n📊 Response data:");
      console.log("─".repeat(50));
      
      if (response.data.violation) {
        const violation = response.data.violation;
        console.log("🆔 Violation ID:", violation._id);
        console.log("🚗 Speed:", violation.speed, "km/h");
        console.log("🚦 Speed Limit:", violation.speedLimit, "km/h");
        console.log("💰 Base Fine: LKR", violation.baseFine);
        console.log("💰 Final Fine: LKR", violation.fine);
        console.log("🔄 Zone Multiplier:", violation.zoneMultiplier + "x");
        
        if (violation.sensitiveZone) {
          console.log("\n🚨 SENSITIVE ZONE INFO:");
          console.log("   In Zone:", violation.sensitiveZone.isInZone ? "YES" : "NO");
          if (violation.sensitiveZone.isInZone) {
            console.log("   Zone Type:", violation.sensitiveZone.zoneType);
            console.log("   Zone Name:", violation.sensitiveZone.zoneName);
            console.log("   Distance:", Math.round(violation.sensitiveZone.distanceFromZone) + "m");
            console.log("   Radius:", violation.sensitiveZone.zoneRadius + "m");
          }
        }
      }

      if (response.data.analysis) {
        console.log("\n📈 GEOFENCING ANALYSIS:");
        console.log("   Speed Limit:", response.data.analysis.speedLimit, "km/h");
        console.log("   Speed Violation:", response.data.analysis.speedViolation, "km/h over");
        console.log("   Is Violation:", response.data.analysis.isViolation);
        
        if (response.data.analysis.geofencing) {
          const geo = response.data.analysis.geofencing;
          console.log("   In Sensitive Zone:", geo.isInZone);
          if (geo.isInZone) {
            console.log("   Zone:", geo.zoneName, "(" + geo.zoneType + ")");
            console.log("   Distance:", Math.round(geo.distanceFromZone) + "m");
            console.log("   Multiplier:", geo.multiplier + "x");
          }
        }
      }

      console.log("\n🎉 Test completed! Check your dashboard to see the violation.");
      console.log("🌐 Dashboard URL: http://localhost:8080/user/dashboard");
      
    } else {
      console.error("❌ Failed to create test violation:", response.data.message);
    }

  } catch (error) {
    console.error("❌ Error creating test violation:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
if (require.main === module) {
  createTestViolation();
}

module.exports = createTestViolation;