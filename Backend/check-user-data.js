require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./models/Driver');
const Vehicle = require('./models/Vehicle');
const Violation = require('./models/Violation');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/speedguard');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB\n');
  
  try {
    // Check if there's a User account with this email
    console.log('=== Checking User Account ===');
    const user = await User.findOne({ email: 'deenu1835@gmail.com' });
    if (user) {
      console.log(`✅ User found: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   User ID: ${user._id}`);
    } else {
      console.log('❌ No User account found with email deenu1835@gmail.com');
    }
    
    // Check Driver account
    console.log('\n=== Checking Driver Account ===');
    const driver = await Driver.findOne({ email: 'deenu1835@gmail.com' });
    if (driver) {
      console.log(`✅ Driver found: ${driver.fullName}`);
      console.log(`   Email: ${driver.email}`);
      console.log(`   License: ${driver.licenseNumber}`);
      console.log(`   Driver ID: ${driver._id}`);
      console.log(`   Merit Points: ${driver.meritPoints}`);
      console.log(`   Total Violations: ${driver.totalViolations}`);
      
      // Find vehicles for this driver
      console.log('\n=== Checking Vehicles for this Driver ===');
      const vehicles = await Vehicle.find({ driverId: driver._id });
      console.log(`Found ${vehicles.length} vehicle(s):`);
      
      vehicles.forEach((v, index) => {
        console.log(`\n${index + 1}. Vehicle: ${v.vehicleNumber}`);
        console.log(`   Type: ${v.vehicleType}`);
        console.log(`   Speed Limit: ${v.speedLimit} km/h`);
        console.log(`   Total Violations: ${v.totalViolations || 0}`);
        console.log(`   Status: ${v.status}`);
        console.log(`   Vehicle ID: ${v._id}`);
      });
      
      // Find violations for this driver
      console.log('\n=== Checking Violations for this Driver ===');
      const violations = await Violation.find({ driverId: driver._id })
        .populate('vehicleId')
        .sort({ timestamp: -1 });
      
      console.log(`Found ${violations.length} violation(s):`);
      
      violations.forEach((v, index) => {
        console.log(`\n${index + 1}. ${v.severity.toUpperCase()} - ${v.speedOverLimit} km/h over limit`);
        console.log(`   Date: ${v.timestamp.toLocaleString()}`);
        console.log(`   Vehicle: ${v.vehicleId ? v.vehicleId.vehicleNumber : 'Unknown'}`);
        console.log(`   Location: ${v.location.address}`);
        console.log(`   Merit Points: ${v.meritPointsToDeduct}`);
        console.log(`   Status: ${v.status}`);
        if (v.sensitiveZone && v.sensitiveZone.isInZone) {
          console.log(`   ⚠️  Sensitive Zone: ${v.sensitiveZone.zoneName}`);
        }
      });
      
    } else {
      console.log('❌ No Driver account found with email deenu1835@gmail.com');
    }
    
    // Check all vehicles with BHZ-963X pattern
    console.log('\n=== Checking all BHZ-963X Vehicles ===');
    const bhzVehicles = await Vehicle.find({ 
      vehicleNumber: { $regex: /^BHZ-963/i } 
    }).populate('driverId');
    
    console.log(`Found ${bhzVehicles.length} vehicle(s) matching BHZ-963X:`);
    bhzVehicles.forEach((v, index) => {
      console.log(`\n${index + 1}. ${v.vehicleNumber}`);
      console.log(`   Owner: ${v.driverId ? v.driverId.fullName + ' (' + v.driverId.email + ')' : 'Not assigned'}`);
      console.log(`   Type: ${v.vehicleType}`);
      console.log(`   Total Violations: ${v.totalViolations || 0}`);
      console.log(`   Vehicle ID: ${v._id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n\nDatabase connection closed');
  }
});
