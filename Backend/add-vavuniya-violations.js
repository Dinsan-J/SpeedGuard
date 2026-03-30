require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./models/Driver');
const Vehicle = require('./models/Vehicle');
const IoTDevice = require('./models/IoTDevice');
const Violation = require('./models/Violation');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/speedguard');

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
  console.log('Connected to MongoDB\n');
  
  try {
    // Find the driver by email
    const driver = await Driver.findOne({ email: 'deenu1835@gmail.com' });
    if (!driver) {
      console.error('Driver with email deenu1835@gmail.com not found');
      process.exit(1);
    }
    console.log(`Found driver: ${driver.fullName} (${driver.licenseNumber})`);
    
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
      await Vehicle.updateOne(
        { _id: vehicle._id },
        { $set: { driverId: driver._id } }
      );
      console.log('Driver assigned to vehicle');
    }
    
    // Check if vehicle has an IoT device assigned
    let iotDevice = await IoTDevice.findOne({ _id: vehicle.iotDeviceId });
    if (!iotDevice) {
      console.log('No IoT device assigned to vehicle, finding or creating one...');
      
      // Try to find an existing device for this vehicle
      iotDevice = await IoTDevice.findOne({ assignedVehicleId: vehicle._id });
      
      if (!iotDevice) {
        // Create a new IoT device
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
        
        // Update vehicle with IoT device
        await Vehicle.updateOne(
          { _id: vehicle._id },
          { 
            $set: { 
              iotDeviceId: iotDevice._id,
              deviceAssignmentDate: new Date()
            }
          }
        );
        console.log('IoT device assigned to vehicle');
      } else {
        console.log(`Found existing IoT device: ${iotDevice.deviceId}`);
      }
    } else {
      console.log(`Using IoT device: ${iotDevice.deviceId}`);
    }
    
    // Vavuniya coordinates: approximately 8.7514° N, 80.4971° E
    // University of Vavuniya coordinates: approximately 8.7542° N, 80.4989° E
    
    // Create dummy violations in Vavuniya area
    const violations = [];
    const now = new Date();
    
    // Violation 1: Moderate speeding in Vavuniya town - 3 days ago
    const timestamp1 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 8.7514 + (Math.random() - 0.5) * 0.005,
        longitude: 80.4971 + (Math.random() - 0.5) * 0.005,
        accuracy: 5,
        address: 'Vavuniya Town, Northern Province'
      },
      speed: vehicle.speedLimit + 18,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 18,
      timestamp: timestamp1,
      violationType: 'speed',
      status: 'detected',
      riskScore: 0.55,
      riskLevel: 'medium',
      severity: 'moderate',
      timeOfDay: getTimeOfDay(timestamp1)
    });
    
    // Violation 2: Serious speeding near University of Vavuniya (university zone) - 4 days ago
    const timestamp2 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 8.7542 + (Math.random() - 0.5) * 0.002,
        longitude: 80.4989 + (Math.random() - 0.5) * 0.002,
        accuracy: 5,
        address: 'Near University of Vavuniya, Vavuniya'
      },
      speed: vehicle.speedLimit + 28,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 28,
      timestamp: timestamp2,
      violationType: 'speed',
      status: 'detected',
      sensitiveZone: {
        isInZone: true,
        zoneType: 'university',
        zoneName: 'University of Vavuniya',
        distanceFromZone: 80,
        zoneRadius: 500
      },
      riskScore: 0.8,
      riskLevel: 'high',
      severity: 'serious',
      timeOfDay: getTimeOfDay(timestamp2)
    });
    
    // Violation 3: Minor speeding on Vavuniya-Mannar Road - 6 days ago
    const timestamp3 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 8.7480 + (Math.random() - 0.5) * 0.005,
        longitude: 80.4920 + (Math.random() - 0.5) * 0.005,
        accuracy: 5,
        address: 'Vavuniya-Mannar Road, Vavuniya'
      },
      speed: vehicle.speedLimit + 8,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 8,
      timestamp: timestamp3,
      violationType: 'speed',
      status: 'detected',
      riskScore: 0.35,
      riskLevel: 'low',
      severity: 'minor',
      timeOfDay: getTimeOfDay(timestamp3)
    });
    
    // Violation 4: Severe speeding near University of Vavuniya (morning rush) - 1 week ago
    const timestamp4 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    timestamp4.setHours(8, 30, 0, 0); // Set to 8:30 AM
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 8.7545 + (Math.random() - 0.5) * 0.002,
        longitude: 80.4992 + (Math.random() - 0.5) * 0.002,
        accuracy: 5,
        address: 'University Road, Near University of Vavuniya'
      },
      speed: vehicle.speedLimit + 32,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 32,
      timestamp: timestamp4,
      violationType: 'speed',
      status: 'detected',
      sensitiveZone: {
        isInZone: true,
        zoneType: 'university',
        zoneName: 'University of Vavuniya',
        distanceFromZone: 120,
        zoneRadius: 500
      },
      riskScore: 0.85,
      riskLevel: 'high',
      severity: 'severe',
      timeOfDay: getTimeOfDay(timestamp4)
    });
    
    // Violation 5: Moderate speeding in Vavuniya market area - 2 days ago
    const timestamp5 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 8.7520 + (Math.random() - 0.5) * 0.003,
        longitude: 80.4965 + (Math.random() - 0.5) * 0.003,
        accuracy: 5,
        address: 'Market Area, Vavuniya Town'
      },
      speed: vehicle.speedLimit + 14,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 14,
      timestamp: timestamp5,
      violationType: 'speed',
      status: 'detected',
      riskScore: 0.48,
      riskLevel: 'medium',
      severity: 'moderate',
      timeOfDay: getTimeOfDay(timestamp5)
    });
    
    // Violation 6: Serious speeding near University entrance - yesterday
    const timestamp6 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    violations.push({
      vehicleId: vehicle._id,
      driverId: driver._id,
      deviceId: iotDevice._id,
      location: {
        latitude: 8.7540 + (Math.random() - 0.5) * 0.002,
        longitude: 80.4985 + (Math.random() - 0.5) * 0.002,
        accuracy: 5,
        address: 'University Entrance, University of Vavuniya'
      },
      speed: vehicle.speedLimit + 22,
      speedLimit: vehicle.speedLimit,
      speedOverLimit: 22,
      timestamp: timestamp6,
      violationType: 'speed',
      status: 'detected',
      sensitiveZone: {
        isInZone: true,
        zoneType: 'university',
        zoneName: 'University of Vavuniya',
        distanceFromZone: 50,
        zoneRadius: 500
      },
      riskScore: 0.72,
      riskLevel: 'high',
      severity: 'serious',
      timeOfDay: getTimeOfDay(timestamp6)
    });
    
    // Insert all violations
    console.log(`\nCreating ${violations.length} violations in Vavuniya area...`);
    const createdViolations = [];
    
    for (const violationData of violations) {
      const violation = new Violation(violationData);
      await violation.save();
      createdViolations.push(violation);
    }
    
    console.log(`\n✅ Successfully created ${createdViolations.length} violations for vehicle ${vehicle.vehicleNumber} in Vavuniya`);
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
    console.log(`Updated vehicle total violation count: ${updatedVehicle.totalViolations}`);
    
  } catch (error) {
    console.error('Error creating violations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
});
