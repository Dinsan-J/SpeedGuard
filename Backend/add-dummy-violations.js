require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./models/Driver');
const Vehicle = require('./models/Vehicle');
const IoTDevice = require('./models/IoTDevice');
const Violation = require('./models/Violation');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/speedguard', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

// Helper function to determine time of day
function getTimeOfDay(timestamp) {
  const hour = timestamp.getHours();
  if (hour >= 6 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else if (hour >= 18 && hour < 22) {
    return 'evening';
  } else {
    return 'night';
  }
}

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find or create the driver
    let driver = await Driver.findOne({ email: 'deenu1835@gmail.com' });
    
    if (!driver) {
      console.log('Driver with email deenu1835@gmail.com not found, creating new driver...');
      driver = new Driver({
        licenseNumber: 'B1234567',
        fullName: 'Deenu Driver',
        nicNumber: '199512345678',
        phoneNumber: '0771234567',
        email: 'deenu1835@gmail.com',
        address: 'Colombo, Sri Lanka',
        licenseClass: 'B',
        licenseIssueDate: new Date('2020-01-01'),
        licenseExpiryDate: new Date('2030-01-01'),
        meritPoints: 100,
        isActive: true,
        isVerified: true
      });
      await driver.save();
      console.log(`Created new driver: ${driver.fullName} (${driver.licenseNumber})`);
    } else {
      console.log(`Found driver: ${driver.fullName} (${driver.licenseNumber || 'No license'})`);
    }
    
    // Find the vehicle by vehicle number
    const vehicle = await Vehicle.findOne({ vehicleNumber: 'BHZ-9638' });
    if (!vehicle) {
      console.error('Vehicle BHZ-9638 not found');
      process.exit(1);
    }
    console.log(`Found vehicle: ${vehicle.vehicleNumber} (${vehicle.vehicleType})`);
    
    // Assign driver to vehicle if not already assigned
    if (!vehicle.driverId || vehicle.driverId.toString() !== driver._id.toString()) {
      console.log('Assigning driver to vehicle...');
      // Use updateOne to avoid triggering pre-save middleware that might cause issues
      await Vehicle.updateOne(
        { _id: vehicle._id },
        { $set: { driverId: driver._id } }
      );
      // Reload the vehicle
      const updatedVehicle = await Vehicle.findById(vehicle._id);
      Object.assign(vehicle, updatedVehicle.toObject());
      console.log('Driver assigned to vehicle');
    }
    
    // Check if vehicle has an IoT device assigned
    let iotDevice = await IoTDevice.findOne({ _id: vehicle.iotDeviceId });
    if (!iotDevice) {
      console.log('No IoT device assigned to vehicle, creating a dummy device...');
      
      // Create a dummy IoT device
      iotDevice = new IoTDevice({
        deviceId: `ESP32_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        deviceType: 'ESP32',
        status: 'active',
        assignedVehicleId: vehicle._id,
        assignmentDate: new Date(),
        isOnline: true,
        lastSeen: new Date(),
        lastHeartbeat: new Date()
      });
      
      await iotDevice.save();
      console.log(`Created IoT device: ${iotDevice.deviceId}`);
      
      // Update vehicle with IoT device using updateOne to avoid pre-save middleware
      await Vehicle.updateOne(
        { _id: vehicle._id },
        { 
          $set: { 
            iotDeviceId: iotDevice._id,
            deviceAssignmentDate: new Date()
          }
        }
      );
      // Reload vehicle
      const updatedVehicle = await Vehicle.findById(vehicle._id);
      Object.assign(vehicle, updatedVehicle.toObject());
      console.log('IoT device assigned to vehicle');
    } else {
      console.log(`Using existing IoT device: ${iotDevice.deviceId}`);
    }
    
    // Create dummy violations
    const violations = [];
    const now = new Date();
    
    // Violation 1: Minor speeding (5 km/h over limit) - 2 days ago
    const timestamp1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 6.9271 + (Math.random() - 0.5) * 0.01,
        longitude: 79.8612 + (Math.random() - 0.5) * 0.01,
        accuracy: 5,
        address: 'Colombo, Sri Lanka'
      },
      speed: vehicle.speedLimit + 5,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 5,
      timestamp: timestamp1,
      violationType: 'speed',
      status: 'detected',
      riskScore: 0.3,
      riskLevel: 'low',
      severity: 'minor',
      timeOfDay: getTimeOfDay(timestamp1)
    });
    
    // Violation 2: Moderate speeding (15 km/h over limit) - 5 days ago
    const timestamp2 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 6.9271 + (Math.random() - 0.5) * 0.01,
        longitude: 79.8612 + (Math.random() - 0.5) * 0.01,
        accuracy: 5,
        address: 'Galle Road, Colombo'
      },
      speed: vehicle.speedLimit + 15,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 15,
      timestamp: timestamp2,
      violationType: 'speed',
      status: 'detected',
      riskScore: 0.5,
      riskLevel: 'medium',
      severity: 'moderate',
      timeOfDay: getTimeOfDay(timestamp2)
    });
    
    // Violation 3: Serious speeding (25 km/h over limit) - 1 week ago
    const timestamp3 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 6.9271 + (Math.random() - 0.5) * 0.01,
        longitude: 79.8612 + (Math.random() - 0.5) * 0.01,
        accuracy: 5,
        address: 'Kandy Road, Colombo'
      },
      speed: vehicle.speedLimit + 25,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 25,
      timestamp: timestamp3,
      violationType: 'speed',
      status: 'detected',
      riskScore: 0.7,
      riskLevel: 'high',
      severity: 'serious',
      timeOfDay: getTimeOfDay(timestamp3)
    });
    
    // Violation 4: Severe speeding (35 km/h over limit) in sensitive zone - 10 days ago
    const timestamp4 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 6.9271 + (Math.random() - 0.5) * 0.01,
        longitude: 79.8612 + (Math.random() - 0.5) * 0.01,
        accuracy: 5,
        address: 'Near Royal College, Colombo 7'
      },
      speed: vehicle.speedLimit + 35,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 35,
      timestamp: timestamp4,
      violationType: 'speed',
      status: 'detected',
      sensitiveZone: {
        isInZone: true,
        zoneType: 'school',
        zoneName: 'Royal College',
        distanceFromZone: 50,
        zoneRadius: 500
      },
      riskScore: 0.9,
      riskLevel: 'high',
      severity: 'severe',
      timeOfDay: getTimeOfDay(timestamp4)
    });
    
    // Violation 5: Moderate speeding (12 km/h over limit) - yesterday
    const timestamp5 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 6.9271 + (Math.random() - 0.5) * 0.01,
        longitude: 79.8612 + (Math.random() - 0.5) * 0.01,
        accuracy: 5,
        address: 'Baseline Road, Colombo'
      },
      speed: vehicle.speedLimit + 12,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 12,
      timestamp: timestamp5,
      violationType: 'speed',
      status: 'detected',
      riskScore: 0.45,
      riskLevel: 'medium',
      severity: 'moderate',
      timeOfDay: getTimeOfDay(timestamp5)
    });
    
    // Insert all violations
    console.log(`\nCreating ${violations.length} dummy violations...`);
    const createdViolations = [];
    
    for (const violationData of violations) {
      const violation = new Violation(violationData);
      await violation.save();
      createdViolations.push(violation);
    }
    
    console.log(`\n✅ Successfully created ${createdViolations.length} violations for vehicle ${vehicle.vehicleNumber}`);
    console.log('\nViolation Summary:');
    createdViolations.forEach((v, index) => {
      console.log(`${index + 1}. ${v.severity.toUpperCase()} - ${v.speedOverLimit} km/h over limit - ${v.timestamp.toLocaleDateString()}`);
      console.log(`   Merit Points to Deduct: ${v.meritPointsToDeduct}`);
      console.log(`   Location: ${v.location.address}`);
      if (v.sensitiveZone && v.sensitiveZone.isInZone) {
        console.log(`   ⚠️  In Sensitive Zone: ${v.sensitiveZone.zoneName}`);
      }
      console.log('');
    });
    
    // Update vehicle violation count
    await Vehicle.updateOne(
      { _id: vehicle._id },
      { 
        $inc: { totalViolations: violations.length },
        $set: { lastViolationDate: now }
      }
    );
    
    const updatedVehicle = await Vehicle.findById(vehicle._id);
    console.log(`Updated vehicle violation count: ${updatedVehicle.totalViolations}`);
    
  } catch (error) {
    console.error('Error creating violations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
});
