require("dotenv").config();
const mongoose = require("mongoose");
const Vehicle = require("./models/Vehicle");
const Driver = require("./models/Driver");
const Violation = require("./models/Violation");
const User = require("./models/User");

/**
 * Simple test to create data for QR Scanner testing
 */
async function createTestData() {
  try {
    console.log("🚀 Creating test data for QR Scanner...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clean up any existing test data
    await User.deleteMany({ email: /test.*@qr\.com/ });
    await Vehicle.deleteMany({ plateNumber: /QR-/ });
    await Driver.deleteMany({ drivingLicenseId: /QR-/ });
    await Violation.deleteMany({ vehicleId: /QR-/ });

    // Create test user
    const testUser = new User({
      username: "qr.test.user",
      email: "qrtest@qr.com",
      password: "hashedpassword123",
      role: "user"
    });
    await testUser.save();
    console.log(`✅ Created test user: ${testUser.username}`);

    // Create test vehicle
    const testVehicle = new Vehicle({
      plateNumber: "QR-ABC-123",
      make: "Honda",
      model: "Civic",
      year: "2022",
      color: "Blue",
      status: "active",
      owner: testUser._id,
      iotDeviceId: "ESP32-QR-TEST",
      currentSpeed: 55,
      currentLocation: {
        lat: 8.758910343111971,
        lng: 80.41069101388995
      },
      lastUpdated: new Date()
    });
    await testVehicle.save();
    console.log(`✅ Created test vehicle: ${testVehicle.plateNumber}`);

    // Create test driver
    const testDriver = new Driver({
      drivingLicenseId: "QR-B1234567",
      fullName: "Test Driver QR",
      dateOfBirth: new Date("1985-06-20"),
      licenseIssueDate: new Date("2010-01-01"),
      licenseExpiryDate: new Date("2030-01-01"),
      licenseClass: "B",
      meritPoints: 80, // Active status
      totalViolations: 1,
      averageRiskScore: 0.3,
      riskLevel: 'low'
    });
    await testDriver.save();
    console.log(`✅ Created test driver: ${testDriver.fullName} (${testDriver.drivingLicenseId})`);

    // Create pending violation
    const pendingViolation = new Violation({
      vehicleId: testVehicle.plateNumber,
      deviceId: testVehicle.iotDeviceId,
      location: { lat: 8.758910343111971, lng: 80.41069101388995 },
      speed: 85,
      speedLimit: 50,
      timestamp: new Date(),
      status: "pending",
      baseFine: 2000,
      finalFine: 6000,
      zoneMultiplier: 2.0,
      riskMultiplier: 1.5,
      riskScore: 0.75,
      riskLevel: 'high',
      meritPointsDeducted: 12,
      sensitiveZone: {
        isInZone: true,
        zoneType: 'university',
        zoneName: 'University of Vavuniya',
        distanceFromZone: 0,
        zoneRadius: 500
      },
      driverConfirmed: false,
      meritPointsApplied: false
    });
    await pendingViolation.save();
    console.log(`✅ Created pending violation: ${pendingViolation._id}`);

    console.log("\n🎯 Test Data Created Successfully!");
    console.log("=" .repeat(50));
    console.log("📱 QR Code Content:");
    console.log(`   {"vehicleId": "${testVehicle.plateNumber}"}`);
    console.log("\n🔗 API Endpoints to Test:");
    console.log(`   GET /api/police/scan/${testVehicle.plateNumber}`);
    console.log(`   POST /api/police/violations/${pendingViolation._id}/quick-confirm`);
    console.log("\n👤 Driver License ID for Testing:");
    console.log(`   ${testDriver.drivingLicenseId}`);
    console.log("\n📊 Expected Results:");
    console.log(`   - Vehicle: ${testVehicle.plateNumber} (${testVehicle.make} ${testVehicle.model})`);
    console.log(`   - Driver: ${testDriver.fullName} (${testDriver.meritPoints}/100 points)`);
    console.log(`   - Violation: 85 km/h in 50 km/h zone (HIGH risk)`);
    console.log(`   - Fine: LKR 6,000, Merit: -12 points`);
    console.log(`   - Zone: University of Vavuniya`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error creating test data:", error.message);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the test data creation
if (require.main === module) {
  createTestData();
}

module.exports = createTestData;