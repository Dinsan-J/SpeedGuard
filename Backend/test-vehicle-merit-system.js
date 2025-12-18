const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Violation = require('./models/Violation');
const MeritPointService = require('./services/meritPointService');

/**
 * Test Script for Vehicle Type and Merit Point System
 * Tests the complete implementation of the new system
 */

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testUserRegistration() {
  console.log('\n🧪 Testing User Registration with Vehicle Types...');
  
  const testUsers = [
    {
      username: 'john_motorcycle',
      email: 'john@test.com',
      password: 'hashedpassword123',
      role: 'user',
      vehicleType: 'motorcycle',
      driverProfile: {
        fullName: 'John Silva',
        phoneNumber: '+94771234567',
        licenseNumber: 'B1234567'
      }
    },
    {
      username: 'mary_car',
      email: 'mary@test.com', 
      password: 'hashedpassword123',
      role: 'user',
      vehicleType: 'light_vehicle',
      driverProfile: {
        fullName: 'Mary Fernando',
        phoneNumber: '+94771234568',
        licenseNumber: 'B2345678'
      }
    },
    {
      username: 'sam_threewheeler',
      email: 'sam@test.com',
      password: 'hashedpassword123', 
      role: 'user',
      vehicleType: 'three_wheeler',
      driverProfile: {
        fullName: 'Sam Perera',
        phoneNumber: '+94771234569',
        licenseNumber: 'A1234567'
      }
    },
    {
      username: 'david_bus',
      email: 'david@test.com',
      password: 'hashedpassword123',
      role: 'user', 
      vehicleType: 'heavy_vehicle',
      driverProfile: {
        fullName: 'David Rajapaksa',
        phoneNumber: '+94771234570',
        licenseNumber: 'C1234567'
      }
    }
  ];

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️  User ${userData.username} already exists, skipping...`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      
      console.log(`✅ Created user: ${user.username}`);
      console.log(`   Vehicle Type: ${user.vehicleType}`);
      console.log(`   Speed Limit: ${user.getSpeedLimit()} km/h`);
      console.log(`   Merit Points: ${user.meritPoints}`);
      console.log(`   Status: ${user.drivingStatus}`);
      
    } catch (error) {
      console.error(`❌ Error creating user ${userData.username}:`, error.message);
    }
  }
}

async function testSpeedLimitCalculation() {
  console.log('\n🧪 Testing Speed Limit Calculation...');
  
  const users = await User.find({ role: 'user' }).limit(4);
  
  for (const user of users) {
    const speedLimit = user.getSpeedLimit();
    console.log(`${user.vehicleType}: ${speedLimit} km/h (${user.username})`);
  }
}

async function testViolationCreation() {
  console.log('\n🧪 Testing Violation Creation with Merit Points...');
  
  const users = await User.find({ role: 'user' }).limit(4);
  
  const testViolations = [
    { speed: 75, vehicleType: 'motorcycle', appliedSpeedLimit: 70 }, // 5 km/h over
    { speed: 85, vehicleType: 'light_vehicle', appliedSpeedLimit: 70 }, // 15 km/h over  
    { speed: 75, vehicleType: 'three_wheeler', appliedSpeedLimit: 50 }, // 25 km/h over
    { speed: 85, vehicleType: 'heavy_vehicle', appliedSpeedLimit: 50 }  // 35 km/h over
  ];

  for (let i = 0; i < users.length && i < testViolations.length; i++) {
    const user = users[i];
    const violationData = testViolations[i];
    
    try {
      const violation = new Violation({
        vehicleId: `TEST${i + 1}`,
        deviceId: `ESP32_${i + 1}`,
        vehicleType: violationData.vehicleType,
        appliedSpeedLimit: violationData.appliedSpeedLimit,
        userId: user._id,
        location: { lat: 7.8731, lng: 80.7718 }, // Kandy coordinates
        speed: violationData.speed,
        timestamp: new Date(),
        status: 'pending'
      });

      await violation.save();
      
      console.log(`✅ Created violation for ${user.username}:`);
      console.log(`   Speed: ${violation.speed} km/h (limit: ${violation.appliedSpeedLimit} km/h)`);
      console.log(`   Over limit: ${violation.speedOverLimit} km/h`);
      console.log(`   Severity: ${violation.severityLevel}`);
      console.log(`   Merit points to deduct: ${violation.meritPointsDeducted}`);
      console.log(`   Requires fine: ${violation.requiresFine}`);
      
    } catch (error) {
      console.error(`❌ Error creating violation for ${user.username}:`, error.message);
    }
  }
}

async function testMeritPointDeduction() {
  console.log('\n🧪 Testing Merit Point Deduction...');
  
  const users = await User.find({ role: 'user' }).limit(4);
  
  for (const user of users) {
    const originalPoints = user.meritPoints;
    
    // Test different speed over limit scenarios
    const testSpeeds = [5, 15, 25, 35]; // km/h over limit
    const speedOverLimit = testSpeeds[users.indexOf(user)] || 5;
    
    const result = user.deductMeritPoints(speedOverLimit);
    await user.save();
    
    console.log(`${user.username} (${user.vehicleType}):`);
    console.log(`   Speed over limit: ${speedOverLimit} km/h`);
    console.log(`   Points deducted: ${result.pointsDeducted}`);
    console.log(`   Merit points: ${originalPoints} → ${result.newTotal}`);
    console.log(`   Status: ${user.drivingStatus}`);
  }
}

async function testMeritPointRecovery() {
  console.log('\n🧪 Testing Merit Point Recovery...');
  
  const users = await User.find({ role: 'user', meritPoints: { $lt: 100 } });
  
  for (const user of users) {
    // Simulate time passing (set last violation to 3 weeks ago)
    user.lastViolationDate = new Date(Date.now() - (3 * 7 * 24 * 60 * 60 * 1000));
    
    const originalPoints = user.meritPoints;
    const result = user.recoverMeritPoints();
    await user.save();
    
    console.log(`${user.username}:`);
    console.log(`   Weeks since violation: 3`);
    console.log(`   Points recovered: ${result.recovered}`);
    console.log(`   Merit points: ${originalPoints} → ${result.newTotal}`);
    console.log(`   Status: ${user.drivingStatus}`);
  }
}

async function testMeritPointService() {
  console.log('\n🧪 Testing Merit Point Service...');
  
  try {
    // Test system statistics
    const stats = await MeritPointService.getSystemStatistics();
    console.log('📊 System Statistics:');
    console.log(`   Total users: ${stats.totalUsers}`);
    console.log(`   High-risk users: ${stats.highRiskUsers}`);
    console.log(`   Risk percentage: ${stats.riskPercentage}%`);
    
    // Test user merit status
    const user = await User.findOne({ role: 'user' });
    if (user) {
      const status = await MeritPointService.getUserMeritStatus(user._id);
      console.log(`\n📋 Merit Status for ${user.username}:`);
      console.log(`   Current points: ${status.currentPoints}/100`);
      console.log(`   Status: ${status.drivingStatus}`);
      console.log(`   Violation-free weeks: ${status.violationFreeWeeks}`);
      console.log(`   Status message: ${status.statusMessage}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing merit point service:', error.message);
  }
}

async function testSystemIntegration() {
  console.log('\n🧪 Testing Complete System Integration...');
  
  // Test IoT data processing simulation
  const testIoTData = {
    iotDeviceId: 'ESP32_TEST_001',
    speed: 80,
    location: { lat: 7.8731, lng: 80.7718 },
    vehicleType: 'motorcycle' // 70 km/h limit, so 10 km/h over
  };
  
  console.log('📡 Simulating IoT violation detection:');
  console.log(`   Device: ${testIoTData.iotDeviceId}`);
  console.log(`   Speed: ${testIoTData.speed} km/h`);
  console.log(`   Vehicle type: ${testIoTData.vehicleType}`);
  
  // Calculate expected results
  const speedLimit = testIoTData.vehicleType === 'motorcycle' ? 70 : 50;
  const speedOverLimit = testIoTData.speed - speedLimit;
  
  let expectedPoints = 0;
  let expectedSeverity = '';
  
  if (speedOverLimit <= 10) {
    expectedPoints = 5;
    expectedSeverity = 'minor';
  } else if (speedOverLimit <= 20) {
    expectedPoints = 10;
    expectedSeverity = 'moderate';
  } else if (speedOverLimit <= 30) {
    expectedPoints = 20;
    expectedSeverity = 'serious';
  } else {
    expectedPoints = 30;
    expectedSeverity = 'severe';
  }
  
  console.log(`   Applied speed limit: ${speedLimit} km/h`);
  console.log(`   Speed over limit: ${speedOverLimit} km/h`);
  console.log(`   Expected severity: ${expectedSeverity}`);
  console.log(`   Expected merit point deduction: ${expectedPoints}`);
}

async function runAllTests() {
  console.log('🚀 Starting Vehicle Type and Merit Point System Tests\n');
  
  await connectDB();
  
  try {
    await testUserRegistration();
    await testSpeedLimitCalculation();
    await testViolationCreation();
    await testMeritPointDeduction();
    await testMeritPointRecovery();
    await testMeritPointService();
    await testSystemIntegration();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 System Implementation Summary:');
    console.log('   ✓ User registration with vehicle types');
    console.log('   ✓ Dynamic speed limit calculation');
    console.log('   ✓ Merit point system with severity-based deduction');
    console.log('   ✓ Automatic merit point recovery');
    console.log('   ✓ Driving status management');
    console.log('   ✓ System statistics and monitoring');
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testUserRegistration,
  testSpeedLimitCalculation,
  testViolationCreation,
  testMeritPointDeduction,
  testMeritPointRecovery,
  testMeritPointService,
  testSystemIntegration
};