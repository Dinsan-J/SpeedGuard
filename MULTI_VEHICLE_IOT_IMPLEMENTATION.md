# Multi-Vehicle System with IoT Integration

## Overview
This implementation adds support for users to manage multiple vehicles with individual IoT device tracking for real-time speed and location monitoring.

## Features Implemented

### 1. Multi-Vehicle Support
- ✅ Users can add unlimited vehicles
- ✅ Each vehicle is displayed as a clickable card on the dashboard
- ✅ Selected vehicle shows its specific violations
- ✅ Visual indication of selected vehicle
- ✅ "Add Vehicle" button redirects to vehicle management page

### 2. IoT Device Integration
- ✅ Each vehicle can have a unique IoT device ID
- ✅ Real-time speed and location tracking
- ✅ Automatic violation detection when speed exceeds limit
- ✅ IoT connectivity status displayed on vehicle cards
- ✅ Support for multiple devices per user (one per vehicle)

### 3. Dashboard Updates
- ✅ "My Vehicles" section shows all user vehicles
- ✅ Click on any vehicle to view its violations
- ✅ Stats (violations, fines) filtered by selected vehicle
- ✅ IoT connection badge for connected vehicles
- ✅ Empty state when no vehicles added

### 4. Vehicle Management
- ✅ Add vehicle form includes IoT Device ID field
- ✅ IoT Device ID validation (prevents duplicate assignments)
- ✅ Display IoT connection status in vehicle list
- ✅ Show current speed for IoT-connected vehicles

## Database Schema Changes

### User Model
```javascript
{
  username: String,
  email: String,
  password: String,
  role: String,
  vehicles: [ObjectId] // Array of vehicle references
}
```

### Vehicle Model
```javascript
{
  plateNumber: String,
  make: String,
  model: String,
  year: String,
  color: String,
  status: String,
  registrationExpiry: Date,
  insuranceExpiry: Date,
  violations: [ObjectId],
  lastViolation: Date,
  owner: ObjectId,
  iotDeviceId: String,        // Unique IoT device identifier
  currentSpeed: Number,        // Real-time speed from IoT
  currentLocation: {           // Real-time location from IoT
    lat: Number,
    lng: Number
  },
  lastUpdated: Date           // Last IoT data update timestamp
}
```

## API Endpoints

### Vehicle Management
- `POST /api/vehicle/add` - Add new vehicle (with IoT device ID)
- `GET /api/vehicle/user/:userId` - Get all user vehicles
- `DELETE /api/vehicle/delete/:vehicleId` - Delete vehicle
- `GET /api/vehicle/:vehicleId` - Get vehicle details with violations

### IoT Integration
- `POST /api/iot/data` - Receive real-time data from IoT device
- `GET /api/iot/vehicle/:vehicleId` - Get real-time vehicle data

## How It Works

### Adding a Vehicle with IoT Device

1. User clicks "Add Vehicle" button
2. Fills in vehicle details including optional IoT Device ID
3. System validates IoT Device ID is unique
4. Vehicle is saved and linked to user account

### IoT Device Data Flow

1. **IoT Device** (GPS + Speed Sensor) sends data:
   ```json
   {
     "iotDeviceId": "IOT-DEVICE-12345",
     "speed": 85.5,
     "location": { "lat": 6.9271, "lng": 79.8612 },
     "timestamp": "2025-11-17T10:30:00Z"
   }
   ```

2. **Backend** receives data at `/api/iot/data`:
   - Finds vehicle by IoT device ID
   - Updates current speed and location
   - Checks if speed exceeds limit (70 km/h)
   - Creates violation record if needed
   - Returns response with violation status

3. **Dashboard** displays:
   - Real-time speed (if available)
   - IoT connection status
   - Violations filtered by selected vehicle

### Viewing Vehicle Violations

1. User opens dashboard
2. All vehicles are displayed in "My Vehicles" section
3. First vehicle is auto-selected
4. Click any vehicle to view its specific violations
5. Violations list updates to show only selected vehicle's violations
6. Stats (total violations, fines) update accordingly

## Testing

### Test IoT Device Simulator
```bash
cd Backend
node test-iot-device.js
```

This will simulate an IoT device sending data every 5 seconds with random speeds and locations.

### Manual Testing with cURL
```bash
# Send IoT data
curl -X POST http://localhost:5000/api/iot/data \
  -H "Content-Type: application/json" \
  -d '{
    "iotDeviceId": "IOT-DEVICE-12345",
    "speed": 85.5,
    "location": {"lat": 6.9271, "lng": 79.8612},
    "timestamp": "2025-11-17T10:30:00Z"
  }'

# Get vehicle real-time data
curl http://localhost:5000/api/iot/vehicle/VEHICLE_ID_HERE
```

## IoT Device Setup

### Hardware Requirements
- GPS Module (NEO-6M or similar)
- Speed Sensor or OBD-II Interface
- Microcontroller (ESP32 recommended)
- WiFi/GSM connectivity

### Software Setup
See `Backend/IOT_INTEGRATION_GUIDE.md` for:
- Complete Arduino/ESP32 code examples
- Wiring diagrams
- Configuration instructions
- Troubleshooting guide

## Security Considerations

1. **Device Authentication**: Each IoT device ID is unique and validated
2. **Data Validation**: Speed and location data is validated before processing
3. **User Authorization**: Only vehicle owners can view their data
4. **HTTPS**: All API communications should use HTTPS in production

## Future Enhancements

1. **Real-Time Dashboard Updates**: WebSocket integration for live speed display
2. **Device Management UI**: Add/remove/edit IoT devices from dashboard
3. **Historical Data**: Track speed and location history over time
4. **Geofencing**: Alert when vehicle enters/exits specific areas
5. **Multiple Speed Limits**: Different limits for different road types
6. **Device Health Monitoring**: Battery status, signal strength, etc.
7. **MQTT Support**: More efficient protocol for IoT communication
8. **Offline Mode**: Queue data when device is offline

## Files Modified/Created

### Backend
- ✅ `models/User.js` - Added vehicles array
- ✅ `models/Vehicle.js` - Added IoT fields
- ✅ `controllers/iotController.js` - New IoT controller
- ✅ `routes/iot.js` - New IoT routes
- ✅ `routes/vehicle.js` - Updated to validate IoT device ID
- ✅ `server.js` - Added IoT routes
- ✅ `IOT_INTEGRATION_GUIDE.md` - Complete IoT guide
- ✅ `test-iot-device.js` - IoT simulator script

### Frontend
- ✅ `pages/user/UserDashboard.tsx` - Multi-vehicle display with selection
- ✅ `pages/user/UserVehicles.tsx` - Added IoT device ID field
- ✅ Stats filtering by selected vehicle
- ✅ IoT connection status badges
- ✅ Violation filtering by vehicle

## Usage Instructions

### For Users

1. **Add Your First Vehicle**:
   - Go to Dashboard → Click "Add Vehicle"
   - Fill in vehicle details
   - (Optional) Enter IoT Device ID if you have one
   - Click "Add"

2. **Add More Vehicles**:
   - Click "My Vehicles" → "Add Vehicle"
   - Repeat the process for each vehicle

3. **View Vehicle Violations**:
   - On Dashboard, click any vehicle in "My Vehicles" section
   - Violations for that vehicle appear on the right
   - Stats update to show selected vehicle's data

4. **Connect IoT Device**:
   - Get your IoT device ID from your device
   - Add it when creating vehicle or edit existing vehicle
   - Device will start sending real-time data
   - See "IoT Connected" badge on vehicle card

### For Developers

1. **Setup IoT Device**:
   - Follow `Backend/IOT_INTEGRATION_GUIDE.md`
   - Configure device with unique ID
   - Test with simulator first

2. **Test Integration**:
   ```bash
   # Terminal 1: Start backend
   cd Backend
   npm start

   # Terminal 2: Run IoT simulator
   cd Backend
   node test-iot-device.js
   ```

3. **Monitor Logs**:
   - Backend logs show incoming IoT data
   - Violations are logged when detected
   - Check MongoDB for stored data

## Troubleshooting

### Vehicles Not Showing
- Check userId in UserDashboard.tsx matches your actual user ID
- Verify API endpoint is correct
- Check browser console for errors

### IoT Data Not Received
- Verify IoT device ID matches exactly
- Check network connectivity
- Ensure API endpoint is accessible
- Review backend logs for errors

### Violations Not Filtering
- Ensure vehicle is selected (highlighted)
- Check that violation.vehicleId matches vehicle.plateNumber
- Verify speed > 70 km/h for violation to show

## Support

For issues or questions:
1. Check the IoT Integration Guide
2. Review backend logs
3. Test with the IoT simulator
4. Verify database records in MongoDB
