require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./models/Driver');
const Vehicle = require('./models/Vehicle');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/speedguard');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB\n');
  
  try {
    // Find all drivers
    const drivers = await Driver.find({});
    console.log(`Found ${drivers.length} drivers:\n`);
    
    drivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.fullName}`);
      console.log(`   Email: ${driver.email}`);
      console.log(`   License: ${driver.licenseNumber}`);
      console.log(`   Merit Points: ${driver.meritPoints}`);
      console.log('');
    });
    
    // Find the vehicle BHZ-9638
    console.log('\n--- Checking for vehicle BHZ-9638 ---');
    const vehicle = await Vehicle.findOne({ vehicleNumber: 'BHZ-9638' }).populate('driverId');
    
    if (vehicle) {
      console.log(`✅ Found vehicle: ${vehicle.vehicleNumber}`);
      console.log(`   Type: ${vehicle.vehicleType}`);
      console.log(`   Speed Limit: ${vehicle.speedLimit} km/h`);
      if (vehicle.driverId) {
        console.log(`   Owner: ${vehicle.driverId.fullName}`);
        console.log(`   Owner Email: ${vehicle.driverId.email}`);
      } else {
        console.log(`   Owner: Not assigned`);
      }
    } else {
      console.log('❌ Vehicle BHZ-9638 not found');
      
      // List all vehicles
      const allVehicles = await Vehicle.find({}).populate('driverId');
      console.log(`\nFound ${allVehicles.length} vehicles in database:`);
      allVehicles.forEach((v, index) => {
        console.log(`${index + 1}. ${v.vehicleNumber} - ${v.vehicleType} - Owner: ${v.driverId ? v.driverId.fullName : 'None'}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
});
