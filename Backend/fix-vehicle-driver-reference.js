require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Driver = require('./models/Driver');
const DriverProfile = require('./models/DriverProfile');
const Vehicle = require('./models/Vehicle');
const Violation = require('./models/Violation');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/speedguard');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB\n');
  
  try {
    const email = 'deenu1835@gmail.com';
    
    // Find the User account
    const user = await User.findOne({ email }).populate('driverProfile');
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    console.log(`✅ Found User: ${user.email}`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   DriverProfile ID: ${user.driverProfile._id}`);
    
    // Find the old Driver account
    const driver = await Driver.findOne({ email });
    if (!driver) {
      console.error('Driver not found');
      process.exit(1);
    }
    console.log(`✅ Found Driver: ${driver.fullName}`);
    console.log(`   Driver ID: ${driver._id}`);
    
    // Find vehicles linked to the old Driver ID
    const vehicles = await Vehicle.find({ driverId: driver._id });
    console.log(`\n📝 Found ${vehicles.length} vehicle(s) linked to old Driver ID`);
    
    if (vehicles.length > 0) {
      // Update vehicles to use DriverProfile ID
      const result = await Vehicle.updateMany(
        { driverId: driver._id },
        { $set: { driverId: user.driverProfile._id } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} vehicle(s) to use DriverProfile ID`);
      
      // Verify the update
      const updatedVehicles = await Vehicle.find({ driverId: user.driverProfile._id });
      console.log(`\n✅ Verification: ${updatedVehicles.length} vehicle(s) now linked to DriverProfile`);
      
      updatedVehicles.forEach((v, index) => {
        console.log(`   ${index + 1}. ${v.vehicleNumber} - ${v.vehicleType}`);
      });
    }
    
    // Find violations linked to the old Driver ID
    const violations = await Violation.find({ driverId: driver._id });
    console.log(`\n📝 Found ${violations.length} violation(s) linked to old Driver ID`);
    
    if (violations.length > 0) {
      // Update violations to use DriverProfile ID
      const result = await Violation.updateMany(
        { driverId: driver._id },
        { $set: { driverId: user.driverProfile._id } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} violation(s) to use DriverProfile ID`);
      
      // Verify the update
      const updatedViolations = await Violation.find({ driverId: user.driverProfile._id });
      console.log(`\n✅ Verification: ${updatedViolations.length} violation(s) now linked to DriverProfile`);
    }
    
    console.log('\n✅ All data has been migrated to use DriverProfile references!');
    console.log('\nSummary:');
    console.log(`- User ID: ${user._id}`);
    console.log(`- DriverProfile ID: ${user.driverProfile._id}`);
    console.log(`- Old Driver ID: ${driver._id} (no longer used for vehicles/violations)`);
    console.log(`- Vehicles migrated: ${vehicles.length}`);
    console.log(`- Violations migrated: ${violations.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
});
