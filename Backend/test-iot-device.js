/**
 * IoT Device Simulator
 * This script simulates an IoT device sending real-time speed and location data
 * Usage: node test-iot-device.js
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api/iot/data';
const IOT_DEVICE_ID = 'IOT-DEVICE-12345'; // Change this to your device ID

// Simulate vehicle movement
const simulateVehicleData = () => {
  // Random speed between 40-100 km/h
  const speed = Math.random() * 60 + 40;
  
  // Simulate location in Colombo, Sri Lanka area
  const lat = 6.9271 + (Math.random() - 0.5) * 0.1;
  const lng = 79.8612 + (Math.random() - 0.5) * 0.1;
  
  return {
    iotDeviceId: IOT_DEVICE_ID,
    speed: parseFloat(speed.toFixed(2)),
    location: {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6))
    },
    timestamp: new Date().toISOString()
  };
};

// Send data to server
const sendData = async () => {
  try {
    const data = simulateVehicleData();
    console.log('\n📡 Sending data:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(API_URL, data);
    
    if (response.data.success) {
      console.log('✅ Success:', response.data.message);
      
      if (response.data.violation) {
        console.log('⚠️  VIOLATION DETECTED!');
        console.log('   Speed:', response.data.violation.speed, 'km/h');
        console.log('   Fine:', response.data.violation.fine || 'Pending calculation');
      } else {
        console.log('✓  Normal speed - No violation');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

// Main execution
console.log('🚗 IoT Device Simulator Started');
console.log('Device ID:', IOT_DEVICE_ID);
console.log('API URL:', API_URL);
console.log('Sending data every 5 seconds...\n');

// Send data immediately
sendData();

// Send data every 5 seconds
setInterval(sendData, 5000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping IoT device simulator...');
  process.exit(0);
});
