require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Driver = require('./models/Driver');
const DriverProfile = require('./models/DriverProfile');
const Vehicle = require('./models/Vehicle');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/speedguard');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB\n');
  
  try {
    const email = 'deenu1835@gmail.com';
    
    // Find the User account
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    console.log(`✅ Found User: ${user.email} (Role: ${user.role})`);
    
    // Find the Driver account
    const driver = await Driver.findOne({ email });
    if (!driver) {
      console.error('Driver not found');
      process.exit(1);
    }
    console.log(`✅ Found Driver: ${driver.fullName}`);
    
    // Check if DriverProfile exists
    let driverProfile = await DriverProfile.findOne({ userId: user._id });
    
    if (!driverProfile) {
      console.log('\n📝 Creating DriverProfile...');
      
      // Create DriverProfile from Driver data
      driverProfile = new DriverProfile({
        userId: user._id,
        fullName: driver.fullName,
        nicNumber: driver.nicNumber,
        phoneNumber: driver.phoneNumber,
        drivingLicenseNumber: driver.licenseNumber,
        licenseClass: driver.licenseClass,
        licenseIssueDate: driver.licenseIssueDate,
        licenseExpiryDate: driver.licenseExpiryDate,
        meritPoints: driver.meritPoints,
        drivingStatus: driver.drivingStatus,
        totalViolations: driver.totalViolations,
        lastViolationDate: driver.lastViolationDate,
        violationFreeWeeks: driver.violationFreeWeeks,
        lastMeritRecovery: driver.lastMeritRecovery,
        isVerified: driver.isVerified,
        verificationDate: driver.verificationDate,
        verifiedBy: driver.verifiedBy
      });
      
      await driverProfile.save();
      console.log(`✅ Created DriverProfile: ${driverProfile._id}`);
      
      // Link DriverProfile to User
      user.driverProfile = driverProfile._id;
      await user.save();
      console.log(`✅ Linked DriverProfile to User`);
      
    } else {
      console.log(`✅ DriverProfile already exists: ${driverProfile._id}`);
      
      // Make sure it's linked to the user
      if (!user.driverProfile || user.driverProfile.toString() !== driverProfile._id.toString()) {
        user.driverProfile = driverProfile._id;
        await user.save();
        console.log(`✅ Linked DriverProfile to User`);
      }
    }
    
    // Update vehicles to use the correct driverId
    console.log('\n📝 Updating vehicles...');
    const vehicles = await Vehicle.find({ driverId: driver._id });
    console.log(`Found ${vehicles.length} vehicle(s) for this driver`);
    
    // The vehicles are already correctly linked to the Driver model
    // which is what the Violation model expects
    
    console.log('\n✅ All data is now properly linked!');
    console.log('\nSummary:');
    console.log(`- User ID: ${user._id}`);
    console.log(`- DriverProfile ID: ${driverProfile._id}`);
    console.log(`- Driver ID: ${driver._id}`);
    console.log(`- Vehicles: ${vehicles.length}`);
    console.log(`- Total Violations: ${driver.totalViolations}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
});
