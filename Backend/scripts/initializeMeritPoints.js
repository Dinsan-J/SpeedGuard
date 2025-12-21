const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

/**
 * Initialize Merit Points for Existing Users
 * This script ensures all existing users have proper merit point data
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

async function initializeMeritPoints() {
  console.log('🚀 Initializing Merit Points for Existing Users...\n');
  
  try {
    // Find all users who don't have merit point data or have incomplete data
    const usersToUpdate = await User.find({
      role: 'user',
      $or: [
        { meritPoints: { $exists: false } },
        { meritPoints: null },
        { drivingStatus: { $exists: false } },
        { totalViolations: { $exists: false } },
        { violationFreeWeeks: { $exists: false } }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users requiring merit point initialization`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of usersToUpdate) {
      try {
        // Initialize merit point data
        const updates = {};
        
        if (user.meritPoints === undefined || user.meritPoints === null) {
          updates.meritPoints = 100;
        }
        
        if (!user.drivingStatus) {
          updates.drivingStatus = 'active';
        }
        
        if (user.totalViolations === undefined) {
          updates.totalViolations = 0;
        }
        
        if (user.violationFreeWeeks === undefined) {
          updates.violationFreeWeeks = 0;
        }

        // Set default vehicle type if not present
        if (!user.vehicleType) {
          updates.vehicleType = 'light_vehicle'; // Default to light vehicle
        }

        // Initialize driver profile if not present
        if (!user.driverProfile) {
          updates.driverProfile = {
            fullName: user.username || 'Unknown Driver',
            phoneNumber: '',
            licenseNumber: ''
          };
        }

        // Update the user
        await User.findByIdAndUpdate(user._id, updates);
        
        console.log(`✅ Updated user: ${user.username || user.email}`);
        console.log(`   Merit Points: ${updates.meritPoints || user.meritPoints}`);
        console.log(`   Status: ${updates.drivingStatus || user.drivingStatus}`);
        console.log(`   Vehicle Type: ${updates.vehicleType || user.vehicleType}`);
        
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating user ${user.username || user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Initialization Summary:');
    console.log(`   ✅ Successfully updated: ${updatedCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📈 Total processed: ${usersToUpdate.length} users`);

    // Verify the updates
    const verificationCount = await User.countDocuments({
      role: 'user',
      meritPoints: { $exists: true, $ne: null },
      drivingStatus: { $exists: true },
      vehicleType: { $exists: true }
    });

    console.log(`\n🔍 Verification: ${verificationCount} users now have complete merit point data`);

  } catch (error) {
    console.error('❌ Error during initialization:', error);
  }
}

async function generateMeritPointReport() {
  console.log('\n📋 Merit Point System Report:\n');
  
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    const statusBreakdown = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: '$drivingStatus',
          count: { $sum: 1 },
          avgMeritPoints: { $avg: '$meritPoints' }
        }
      }
    ]);

    const vehicleTypeBreakdown = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 },
          avgMeritPoints: { $avg: '$meritPoints' }
        }
      }
    ]);

    console.log(`📊 Total Users: ${totalUsers}`);
    console.log('\n🚦 Driving Status Breakdown:');
    statusBreakdown.forEach(status => {
      console.log(`   ${status._id || 'undefined'}: ${status.count} users (avg: ${Math.round(status.avgMeritPoints)} points)`);
    });

    console.log('\n🚗 Vehicle Type Breakdown:');
    vehicleTypeBreakdown.forEach(type => {
      console.log(`   ${type._id || 'undefined'}: ${type.count} users (avg: ${Math.round(type.avgMeritPoints)} points)`);
    });

    // High-risk users
    const highRiskUsers = await User.countDocuments({
      role: 'user',
      $or: [
        { meritPoints: { $lt: 30 } },
        { drivingStatus: { $in: ['review', 'suspended'] } }
      ]
    });

    console.log(`\n⚠️  High-Risk Users: ${highRiskUsers} (${((highRiskUsers / totalUsers) * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Error generating report:', error);
  }
}

async function runInitialization() {
  await connectDB();
  
  try {
    await initializeMeritPoints();
    await generateMeritPointReport();
    
    console.log('\n✅ Merit Point Initialization Complete!');
    console.log('\n🎯 System is now ready for professional merit point tracking');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  runInitialization();
}

module.exports = {
  initializeMeritPoints,
  generateMeritPointReport
};