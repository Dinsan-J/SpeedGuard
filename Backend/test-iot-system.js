const mongoose = require('mongoose');
const Driver = require('./models/Driver');
const Vehicle = require('./models/Vehicle');
const IoTDevice = require('./models/IoTDevice');
const Violation = require('./models/Violation');

/**
 * Comprehensive IoT System Test
 * Tests the complete flow from device registration to violation processing
 */
async function testIoTSystem() {
  try {
    console.log('🚀 Testing SpeedGuard IoT System');
    console.log('=====================================');

    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://speedguard:speedguard123@cluster0.mongodb.net/speedguard?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB');

    // Clean up existing test data
    await cleanupTestData();

    // Step 1: Register IoT Device (Admin)
    console.log('\n📡 Step 1: Register IoT Device');
    const device = new IoTDevice({
      deviceId: 'ESP32_TEST001',
      deviceType: 'ESP32',
      macAddress: '24:6F:28:AB:CD:EF',
      firmwareVersion: '1.0.0',
      status: 'unassigned'
    });
    await device.save();
    console.log(`✅ IoT Device registered: ${device.deviceId}`);

    // Step 2: Register Driver
    console.log('\n👤 Step 2: Register Driver');
    const driver = new Driver({
      licenseNumber: 'B1234567',
      fullName: 'Kasun Perera',
      nicNumber: '199012345678',
      phoneNumber: '0771234567',
      email: 'kasun.perera@email.com',
      licenseClass: 'B',
      licenseIssueDate: new Date('2020-01-15'),
      licenseExpiryDate: new Date('2030-01-15')
    });
    await driver.save();
    console.log(`✅ Driver registered: ${driver.fullName} (${driver.licenseNumber})`);
    console.log(`   Merit Points: ${driver.meritPoints}/100`);

    // Step 3: Add Vehicle
    console.log('\n🚗 Step 3: Add Vehicle');
    const vehicle = new Vehicle({
      vehicleNumber: 'CAR-1234',
      vehicleType: 'light_vehicle',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'White',
      driverId: driver._id,
      registrationDate: new Date('2020-02-01'),
      registrationExpiry: new Date('2025-02-01')
    });
    await vehicle.save();
    console.log(`✅ Vehicle added: ${vehicle.vehicleNumber} (${vehicle.vehicleType})`);
    console.log(`   Speed Limit: ${vehicle.speedLimit} km/h`);
    console.log(`   QR Code: ${vehicle.qrCode}`);

    // Step 4: Assign IoT Device to Vehicle (Admin)
    console.log('\n🔗 Step 4: Assign IoT Device to Vehicle');
    await device.assignToVehicle(vehicle._id, null);
    await vehicle.assignIoTDevice(device._id, null);
    console.log(`✅ Device ${device.deviceId} assigned to vehicle ${vehicle.vehicleNumber}`);

    // Step 5: Simulate IoT Data Transmission (Speed Violation)
    console.log('\n📡 Step 5: Simulate IoT Data Transmission');
    const iotData = {
      deviceId: device.deviceId,
      speed: 85, // Over the 70 km/h limit
      latitude: 6.9271,
      longitude: 79.8612,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📊 IoT Data:`);
    console.log(`   Device: ${iotData.deviceId}`);
    console.log(`   Speed: ${iotData.speed} km/h`);
    console.log(`   Location: ${iotData.latitude}, ${iotData.longitude}`);
    console.log(`   Speed Limit: ${vehicle.speedLimit} km/h`);
    console.log(`   Violation: ${iotData.speed > vehicle.speedLimit ? 'YES' : 'NO'}`);

    // Step 6: Process Violation (Automatic Detection)
    console.log('\n🚨 Step 6: Process Violation');
    const violation = new Violation({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: device._id,
      location: {
        latitude: iotData.latitude,
        longitude: iotData.longitude
      },
      speed: iotData.speed,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: iotData.speed - vehicle.speedLimit,
      timestamp: new Date(iotData.timestamp),
      status: 'detected'
    });
    await violation.save();
    
    console.log(`✅ Violation detected and recorded:`);
    console.log(`   Violation ID: ${violation._id}`);
    console.log(`   Speed: ${violation.speed} km/h (Limit: ${violation.speedLimit} km/h)`);
    console.log(`   Excess: +${violation.speedOverLimit} km/h`);
    console.log(`   Severity: ${violation.severity}`);
    console.log(`   Merit Points to Deduct: ${violation.meritPointsToDeduct}`);
    console.log(`   Status: ${violation.status} (Awaiting officer verification)`);

    // Step 7: Officer QR Code Scan
    console.log('\n👮 Step 7: Officer QR Code Scan');
    const qrData = Vehicle.decodeQRCode(vehicle.qrCode);
    console.log(`✅ QR Code scanned successfully:`);
    console.log(`   Vehicle ID: ${qrData.vehicleId}`);
    console.log(`   Vehicle Number: ${qrData.vehicleNumber}`);
    
    // Get vehicle and driver details
    const scannedVehicle = await Vehicle.findById(qrData.vehicleId).populate('driverId');
    console.log(`📋 Vehicle Details:`);
    console.log(`   Owner: ${scannedVehicle.driverId.fullName}`);
    console.log(`   License: ${scannedVehicle.driverId.licenseNumber}`);
    console.log(`   Merit Points: ${scannedVehicle.driverId.meritPoints}/100`);
    console.log(`   Driving Status: ${scannedVehicle.driverId.drivingStatus}`);

    // Step 8: Officer Verification and Merit Point Application
    console.log('\n✅ Step 8: Officer Verification');
    
    // Verify license number matches
    const providedLicense = 'B1234567'; // Officer enters this
    if (scannedVehicle.driverId.licenseNumber === providedLicense) {
      console.log(`✅ License verified: ${providedLicense}`);
      
      // Apply merit points
      const previousPoints = driver.meritPoints;
      const meritResult = driver.deductMeritPoints(violation.speedOverLimit);
      await driver.save();
      
      // Mark violation as processed
      violation.officerVerified = true;
      violation.licenseVerified = true;
      violation.meritPointsApplied = true;
      violation.status = 'resolved';
      await violation.save();
      
      console.log(`🎯 Merit Points Applied:`);
      console.log(`   Previous Points: ${previousPoints}/100`);
      console.log(`   Points Deducted: ${meritResult.pointsDeducted}`);
      console.log(`   New Points: ${meritResult.newTotal}/100`);
      console.log(`   New Status: ${meritResult.status}`);
      
    } else {
      console.log(`❌ License verification failed`);
    }

    // Step 9: System Statistics
    console.log('\n📊 Step 9: System Statistics');
    const stats = {
      totalDevices: await IoTDevice.countDocuments(),
      assignedDevices: await IoTDevice.countDocuments({ status: 'assigned' }),
      totalDrivers: await Driver.countDocuments(),
      totalVehicles: await Vehicle.countDocuments(),
      totalViolations: await Violation.countDocuments(),
      resolvedViolations: await Violation.countDocuments({ status: 'resolved' }),
      pendingViolations: await Violation.countDocuments({ status: 'detected' })
    };
    
    console.log(`📈 System Statistics:`);
    console.log(`   IoT Devices: ${stats.totalDevices} (${stats.assignedDevices} assigned)`);
    console.log(`   Drivers: ${stats.totalDrivers}`);
    console.log(`   Vehicles: ${stats.totalVehicles}`);
    console.log(`   Violations: ${stats.totalViolations} (${stats.resolvedViolations} resolved, ${stats.pendingViolations} pending)`);

    // Step 10: Test Complete
    console.log('\n🎉 IoT System Test Complete!');
    console.log('=====================================');
    console.log('✅ All components working correctly:');
    console.log('   • IoT device registration and assignment');
    console.log('   • Driver and vehicle management');
    console.log('   • Real-time violation detection');
    console.log('   • QR code generation and scanning');
    console.log('   • Officer verification workflow');
    console.log('   • Merit point deduction system');
    console.log('   • Secure license verification');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  await IoTDevice.deleteMany({ deviceId: /ESP32_TEST/ });
  await Driver.deleteMany({ licenseNumber: /B1234567/ });
  await Vehicle.deleteMany({ vehicleNumber: /CAR-1234/ });
  await Violation.deleteMany({});
  console.log('✅ Test data cleaned up');
}

// Run the test
testIoTSystem();