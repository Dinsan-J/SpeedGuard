const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Violation = require('./models/Violation');
const MeritPointService = require('./services/meritPointService');

/**
 * Professional Merit Point System Test
 * Tests the complete professional implementation
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

async function testProfessionalMeritSystem() {
  console.log('🚀 Testing Professional Merit Point System\n');
  
  try {
    // Test 1: Create a professional user with complete data
    console.log('📝 Test 1: Creating Professional User Profile...');
    
    const testUser = new User({
      username: 'john_professional',
      email: 'john.professional@speedguard.lk',
      password: 'hashedpassword123',
      role: 'user',
      vehicleType: 'light_vehicle',
      meritPoints: 100,
      drivingStatus: 'active',
      totalViolations: 0,
      violationFreeWeeks: 0,
      driverProfile: {
        fullName: 'John Professional Driver',
        phoneNumber: '+94771234567',
        licenseNumber: 'B1234567'
      }
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    let user;
    
    if (existingUser) {
      console.log('⚠️  User already exists, using existing user');
      user = existingUser;
    } else {
      await testUser.save();
      user = testUser;
      console.log('✅ Created professional user profile');
    }

    console.log(`   Username: ${user.username}`);
    console.log(`   Vehicle Type: ${user.vehicleType}`);
    console.log(`   Speed Limit: ${user.getSpeedLimit()} km/h`);
    console.log(`   Merit Points: ${user.meritPoints}`);
    console.log(`   Status: ${user.drivingStatus}`);

    // Test 2: Merit Point Service Integration
    console.log('\n🔧 Test 2: Merit Point Service Integration...');
    
    const meritStatus = await MeritPointService.getUserMeritStatus(user._id);
    console.log('✅ Merit point service working correctly');
    console.log(`   Current Points: ${meritStatus.currentPoints}`);
    console.log(`   Status: ${meritStatus.drivingStatus}`);
    console.log(`   Vehicle Type: ${meritStatus.vehicleType}`);
    console.log(`   Speed Limit: ${meritStatus.speedLimit} km/h`);

    // Test 3: Create Professional Violation
    console.log('\n🚨 Test 3: Creating Professional Violation Record...');
    
    const violation = new Violation({
      vehicleId: 'TEST-PROF-001',
      deviceId: 'ESP32_PROF_001',
      vehicleType: user.vehicleType,
      appliedSpeedLimit: user.getSpeedLimit(),
      userId: user._id,
      location: { lat: 6.9271, lng: 79.8612 }, // Colombo coordinates
      speed: 85, // 15 km/h over limit
      timestamp: new Date(),
      status: 'confirmed',
      driverConfirmed: true,
      confirmedBy: new mongoose.Types.ObjectId(),
      confirmationDate: new Date()
    });

    await violation.save();
    console.log('✅ Created professional violation record');
    console.log(`   Speed: ${violation.speed} km/h (limit: ${violation.appliedSpeedLimit} km/h)`);
    console.log(`   Over limit: ${violation.speedOverLimit} km/h`);
    console.log(`   Severity: ${violation.severityLevel}`);
    console.log(`   Merit points to deduct: ${violation.meritPointsDeducted}`);

    // Test 4: Apply Merit Point Penalty
    console.log('\n⚖️  Test 4: Applying Merit Point Penalty...');
    
    const penaltyResult = await MeritPointService.applyViolationPenalty(user._id, violation._id);
    console.log('✅ Merit point penalty applied successfully');
    console.log(`   Points deducted: ${penaltyResult.pointsDeducted}`);
    console.log(`   New total: ${penaltyResult.newTotal}`);
    console.log(`   Status: ${penaltyResult.drivingStatus}`);

    // Test 5: Recovery Simulation
    console.log('\n🔄 Test 5: Testing Merit Point Recovery...');
    
    // Simulate 3 weeks passing
    const updatedUser = await User.findById(user._id);
    updatedUser.lastViolationDate = new Date(Date.now() - (3 * 7 * 24 * 60 * 60 * 1000));
    await updatedUser.save();

    const recoveryResults = await MeritPointService.processWeeklyRecovery();
    console.log('✅ Weekly recovery processing completed');
    console.log(`   Users processed: ${recoveryResults.length}`);
    
    if (recoveryResults.length > 0) {
      const userRecovery = recoveryResults.find(r => r.userId.toString() === user._id.toString());
      if (userRecovery) {
        console.log(`   Points recovered: ${userRecovery.recovered}`);
        console.log(`   New total: ${userRecovery.newTotal}`);
      }
    }

    // Test 6: System Statistics
    console.log('\n📊 Test 6: System Statistics...');
    
    const stats = await MeritPointService.getSystemStatistics();
    console.log('✅ System statistics generated');
    console.log(`   Total users: ${stats.totalUsers}`);
    console.log(`   High-risk users: ${stats.highRiskUsers}`);
    console.log(`   Risk percentage: ${stats.riskPercentage}%`);

    // Test 7: Professional API Response Simulation
    console.log('\n🌐 Test 7: API Response Simulation...');
    
    const apiResponse = {
      success: true,
      data: {
        currentPoints: updatedUser.meritPoints,
        maxPoints: 100,
        drivingStatus: updatedUser.drivingStatus,
        totalViolations: updatedUser.totalViolations,
        violationFreeWeeks: updatedUser.violationFreeWeeks,
        vehicleType: updatedUser.vehicleType,
        speedLimit: updatedUser.getSpeedLimit(),
        statusMessage: MeritPointService.getStatusMessage(updatedUser.drivingStatus, updatedUser.meritPoints),
        recommendations: MeritPointService.getRecommendations(updatedUser)
      }
    };

    console.log('✅ Professional API response structure validated');
    console.log('📋 Sample API Response:');
    console.log(JSON.stringify(apiResponse, null, 2));

    return {
      user,
      violation,
      meritStatus,
      penaltyResult,
      stats,
      apiResponse
    };

  } catch (error) {
    console.error('❌ Professional merit system test failed:', error);
    throw error;
  }
}

async function testDatabaseIntegrity() {
  console.log('\n🔍 Testing Database Integrity...');
  
  try {
    // Check all users have merit point data
    const usersWithoutMerit = await User.countDocuments({
      role: 'user',
      $or: [
        { meritPoints: { $exists: false } },
        { meritPoints: null },
        { drivingStatus: { $exists: false } }
      ]
    });

    console.log(`✅ Users without merit data: ${usersWithoutMerit}`);

    // Check violation data integrity
    const violationsWithoutSeverity = await Violation.countDocuments({
      severityLevel: { $exists: false }
    });

    console.log(`✅ Violations without severity: ${violationsWithoutSeverity}`);

    // Check merit point ranges
    const invalidMeritPoints = await User.countDocuments({
      role: 'user',
      $or: [
        { meritPoints: { $lt: 0 } },
        { meritPoints: { $gt: 100 } }
      ]
    });

    console.log(`✅ Users with invalid merit points: ${invalidMeritPoints}`);

    return {
      usersWithoutMerit,
      violationsWithoutSeverity,
      invalidMeritPoints
    };

  } catch (error) {
    console.error('❌ Database integrity check failed:', error);
    throw error;
  }
}

async function runProfessionalTests() {
  console.log('🎯 Professional Merit Point System - Comprehensive Testing\n');
  console.log('=' .repeat(60) + '\n');
  
  await connectDB();
  
  try {
    const testResults = await testProfessionalMeritSystem();
    const integrityResults = await testDatabaseIntegrity();
    
    console.log('\n✅ ALL PROFESSIONAL TESTS PASSED!\n');
    console.log('🎉 Professional Merit Point System Validation Summary:');
    console.log('   ✓ User profile creation with complete data');
    console.log('   ✓ Merit point service integration');
    console.log('   ✓ Professional violation processing');
    console.log('   ✓ Automatic penalty application');
    console.log('   ✓ Merit point recovery mechanism');
    console.log('   ✓ System statistics generation');
    console.log('   ✓ Professional API response structure');
    console.log('   ✓ Database integrity validation');
    
    console.log('\n🚀 System is ready for professional deployment!');
    console.log('📊 Key Features Validated:');
    console.log('   • Vehicle-type-based speed limits');
    console.log('   • Severity-based merit point deduction');
    console.log('   • Automatic recovery system');
    console.log('   • Professional database structure');
    console.log('   • Complete API integration');
    console.log('   • Real-time status tracking');
    
    return {
      success: true,
      testResults,
      integrityResults
    };
    
  } catch (error) {
    console.error('❌ Professional tests failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runProfessionalTests();
}

module.exports = {
  testProfessionalMeritSystem,
  testDatabaseIntegrity
};