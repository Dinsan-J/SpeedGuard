require("dotenv").config();
const mongoose = require("mongoose");
const Vehicle = require("./models/Vehicle");
const Driver = require("./models/Driver");
const Violation = require("./models/Violation");
const User = require("./models/User");
const geofencingService = require("./services/geofencingService");
const policeConfirmationService = require("./services/policeConfirmationService");
const mlRiskService = require("./services/mlRiskService");

/**
 * Complete system test - demonstrates the full workflow
 */
async function testCompleteSystem() {
  try {
    console.log("🚀 Testing Complete Traffic Violation System...");
    console.log("=" .repeat(60));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Step 1: Create test data
    console.log("\n📋 Step 1: Setting up test data...");
    
    // Create a police officer
    const officer = new User({
      username: "officer.silva",
      email: "silva@police.lk",
      password: "hashedpassword123",
      role: "officer",
      policeId: "POL001"
    });
    await officer.save();
    console.log(`👮 Created police officer: ${officer.username}`);

    // Create a test driver
    const driver = new Driver({
      drivingLicenseId: "B1234567",
      fullName: "Kasun Perera",
      dateOfBirth: new Date("1985-05-15"),
      licenseIssueDate: new Date("2010-01-01"),
      licenseExpiryDate: new Date("2030-01-01"),
      licenseClass: "B",
      meritPoints: 85, // Good driver with some violations
      totalViolations: 2,
      averageRiskScore: 0.4
    });
    await driver.save();
    console.log(`🚗 Created driver: ${driver.fullName} (${driver.drivingLicenseId})`);

    // Step 2: Simulate IoT violation detection
    console.log("\n🛰️ Step 2: Simulating IoT violation detection...");
    
    const violationData = {
      speed: 85,
      latitude: 8.758910343111971, // University of Vavuniya
      longitude: 80.41069101388995,
      trafficDensity: 'moderate',
      weatherConditions: 'clear'
    };

    console.log(`📍 Location: ${violationData.latitude}, ${violationData.longitude}`);
    console.log(`🏃 Speed: ${violationData.speed} km/h`);

    // Calculate violation with ML risk assessment
    const analysis = await geofencingService.calculateViolationFine(
      violationData.speed,
      violationData.latitude,
      violationData.longitude,
      driver.drivingLicenseId, // Include driver for risk assessment
      null, // Auto-detect speed limit
      {
        trafficDensity: violationData.trafficDensity,
        weatherConditions: violationData.weatherConditions
      }
    );

    console.log("\n📊 Violation Analysis Results:");
    console.log(`🚦 Speed Limit: ${analysis.speedLimit} km/h`);
    console.log(`💰 Base Fine: LKR ${analysis.baseFine}`);
    console.log(`💰 Final Fine: LKR ${analysis.finalFine}`);
    console.log(`🔄 Zone Multiplier: ${analysis.geofencing.multiplier}x`);
    console.log(`🤖 Risk Multiplier: ${analysis.riskAssessment.riskMultiplier}x`);
    console.log(`📈 Risk Level: ${analysis.riskAssessment.riskLevel.toUpperCase()}`);
    console.log(`🎯 Merit Points Deduction: ${analysis.meritPointsDeduction}`);
    
    if (analysis.geofencing.isInZone) {
      console.log(`🚨 SENSITIVE ZONE: ${analysis.geofencing.zoneName} (${analysis.geofencing.zoneType})`);
    }

    // Step 3: Create violation record (as IoT would do)
    console.log("\n📝 Step 3: Creating violation record...");
    
    const violation = new Violation({
      vehicleId: "CAR-123",
      deviceId: "ESP32-001",
      location: { lat: violationData.latitude, lng: violationData.longitude },
      speed: violationData.speed,
      speedLimit: analysis.speedLimit,
      timestamp: new Date(),
      status: "pending",
      
      baseFine: analysis.baseFine,
      finalFine: analysis.finalFine,
      zoneMultiplier: analysis.geofencing.multiplier,
      riskMultiplier: analysis.riskAssessment.riskMultiplier,
      fineBreakdown: analysis.fineBreakdown,
      
      sensitiveZone: {
        isInZone: analysis.geofencing.isInZone,
        zoneType: analysis.geofencing.zoneType,
        zoneName: analysis.geofencing.zoneName,
        distanceFromZone: analysis.geofencing.distanceFromZone,
        zoneRadius: analysis.geofencing.zoneRadius
      },
      
      riskScore: analysis.riskAssessment.riskScore,
      riskLevel: analysis.riskAssessment.riskLevel,
      meritPointsDeducted: analysis.meritPointsDeduction,
      
      trafficDensity: violationData.trafficDensity,
      weatherConditions: violationData.weatherConditions
    });

    await violation.save();
    console.log(`✅ Violation created: ${violation._id}`);

    // Step 4: Police officer confirms driver
    console.log("\n👮 Step 4: Police officer confirms driver...");
    
    const confirmationResult = await policeConfirmationService.confirmDriver(
      violation._id.toString(),
      driver.drivingLicenseId,
      officer._id.toString(),
      {
        driverName: driver.fullName,
        licenseClass: driver.licenseClass
      }
    );

    console.log(`✅ Driver confirmed successfully!`);
    console.log(`📊 Merit points deducted: ${confirmationResult.meritPointsDeducted}`);
    console.log(`🎯 Driver's new merit points: ${confirmationResult.driver.meritPoints}`);
    console.log(`📈 Driver status: ${confirmationResult.driver.status}`);

    // Step 5: Check updated driver profile
    console.log("\n📊 Step 5: Updated driver profile...");
    
    const updatedDriver = await Driver.findByLicenseId(driver.drivingLicenseId);
    console.log(`👤 Driver: ${updatedDriver.fullName}`);
    console.log(`🎯 Merit Points: ${updatedDriver.meritPoints}/100`);
    console.log(`📈 Status: ${updatedDriver.status}`);
    console.log(`⚠️ Risk Level: ${updatedDriver.riskLevel}`);
    console.log(`📊 Total Violations: ${updatedDriver.totalViolations}`);
    console.log(`🔄 Average Risk Score: ${(updatedDriver.averageRiskScore * 100).toFixed(1)}%`);

    // Step 6: Test police dashboard functions
    console.log("\n🚔 Step 6: Testing police dashboard functions...");
    
    // Get violation statistics
    const stats = await policeConfirmationService.getViolationStats();
    console.log(`📊 Violation Statistics:`);
    console.log(`   Pending confirmations: ${stats.pendingConfirmations}`);
    console.log(`   High-risk pending: ${stats.highRiskPending}`);
    console.log(`   Total processed: ${stats.totalProcessed}`);

    // Search for drivers
    const searchResults = await policeConfirmationService.searchDrivers("Kasun");
    console.log(`🔍 Driver search results: ${searchResults.length} found`);

    // Get high-risk drivers
    const highRiskDrivers = await Driver.getHighRiskDrivers();
    console.log(`⚠️ High-risk drivers: ${highRiskDrivers.length} found`);

    // Step 7: Test ML model metrics
    console.log("\n🤖 Step 7: ML Model Information...");
    
    const modelMetrics = mlRiskService.getModelMetrics();
    console.log(`📈 Model Type: ${modelMetrics.modelType}`);
    console.log(`🔧 Version: ${modelMetrics.version}`);
    console.log(`📊 Features: ${modelMetrics.features.join(', ')}`);

    console.log("\n🎉 Complete system test successful!");
    console.log("=" .repeat(60));
    console.log("✅ All components working correctly:");
    console.log("   • OSM-based geofencing");
    console.log("   • ML risk assessment");
    console.log("   • Dynamic fine calculation");
    console.log("   • Merit point system");
    console.log("   • Police confirmation workflow");
    console.log("   • Driver profile management");

    // Cleanup test data
    console.log("\n🧹 Cleaning up test data...");
    await User.findByIdAndDelete(officer._id);
    await Driver.findByIdAndDelete(updatedDriver._id);
    await Violation.findByIdAndDelete(violation._id);
    console.log("✅ Test data cleaned up");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ System test error:", error.message);
    console.error(error.stack);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the complete system test
if (require.main === module) {
  testCompleteSystem();
}

module.exports = testCompleteSystem;