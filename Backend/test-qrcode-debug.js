require("dotenv").config();
const mongoose = require("mongoose");
const Vehicle = require("./models/Vehicle");
const Driver = require("./models/Driver");

/**
 * Debug test to understand when _id is assigned
 */
async function debugQRCodeGeneration() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    // Clean up
    await Vehicle.deleteMany({ vehicleNumber: /^DEBUG-/ });
    await Driver.deleteMany({ licenseNumber: /^D1234567/ });
    
    // Create test driver
    const testDriver = new Driver({
      licenseNumber: "D1234567",
      fullName: "Debug Driver",
      nicNumber: "199012345678",
      phoneNumber: "0771234567",
      email: "debug@test.com",
      address: "Test Address",
      licenseClass: "B",
      licenseIssueDate: new Date("2015-01-01"),
      licenseExpiryDate: new Date("2030-01-01"),
      meritPoints: 100
    });
    await testDriver.save();
    console.log(`✅ Created test driver with _id: ${testDriver._id}`);
    
    // Create vehicle and check _id before save
    const vehicle = new Vehicle({
      vehicleNumber: "DEBUG-001",
      vehicleType: "light_vehicle",
      speedLimit: 70,
      make: "Toyota",
      model: "Corolla",
      year: 2020,
      color: "Blue",
      driverId: testDriver._id,
      iotDeviceId: new mongoose.Types.ObjectId()
    });
    
    console.log("\n📊 Before save:");
    console.log(`   vehicle._id: ${vehicle._id}`);
    console.log(`   vehicle.isNew: ${vehicle.isNew}`);
    console.log(`   vehicle.qrCode: ${vehicle.qrCode}`);
    
    // Save the vehicle
    await vehicle.save();
    
    console.log("\n📊 After save:");
    console.log(`   vehicle._id: ${vehicle._id}`);
    console.log(`   vehicle.isNew: ${vehicle.isNew}`);
    console.log(`   vehicle.qrCode: ${vehicle.qrCode ? vehicle.qrCode.substring(0, 50) + '...' : 'null'}`);
    
    // Decode QR code
    if (vehicle.qrCode) {
      const decoded = Vehicle.decodeQRCode(vehicle.qrCode);
      console.log("\n📊 Decoded QR Code:");
      console.log(`   vehicleId: ${decoded.vehicleId}`);
      console.log(`   vehicleNumber: ${decoded.vehicleNumber}`);
      console.log(`   timestamp: ${decoded.timestamp}`);
      console.log(`   nonce: ${decoded.nonce}`);
      
      // Check if vehicleId is "undefined"
      if (decoded.vehicleId === "undefined" || decoded.vehicleId === undefined) {
        console.log("\n❌ BUG CONFIRMED: vehicleId is 'undefined' in QR code");
      } else {
        console.log("\n✅ vehicleId is valid (not 'undefined')");
      }
    }
    
    // Cleanup
    await Vehicle.deleteMany({ vehicleNumber: /^DEBUG-/ });
    await Driver.deleteMany({ licenseNumber: /^D1234567/ });
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

debugQRCodeGeneration();
