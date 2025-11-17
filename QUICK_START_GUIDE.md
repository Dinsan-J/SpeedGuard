# Quick Start Guide - Multi-Vehicle IoT System

## 🚀 Getting Started

### Step 1: Update Your Database
The system will automatically handle the new fields when you add vehicles. No manual database migration needed.

### Step 2: Start the Backend
```bash
cd Backend
npm install  # If you haven't already
npm start
```

### Step 3: Start the Frontend
```bash
cd Frontend
npm install  # If you haven't already
npm run dev
```

### Step 4: Add Your First Vehicle

1. Open the app in your browser
2. Login to your account
3. Go to Dashboard
4. Click "Add Vehicle" button (or go to My Vehicles page)
5. Fill in the form:
   - Plate Number: e.g., "ABC123"
   - Make: e.g., "Toyota"
   - Model: e.g., "Corolla"
   - Year: e.g., "2020"
   - Color: e.g., "White"
   - Registration Expiry: Select date
   - Insurance Expiry: Select date
   - **IoT Device ID** (Optional): e.g., "IOT-DEVICE-12345"
6. Click "Add"

### Step 5: Add More Vehicles
Repeat Step 4 for each vehicle. Each vehicle should have a unique IoT Device ID if you want to track it.

### Step 6: View Vehicle Violations

1. Go to Dashboard
2. You'll see all your vehicles in the "My Vehicles" section
3. Click on any vehicle to select it
4. The "Recent Violations" section will show violations for that vehicle only
5. Stats at the top will update to show data for the selected vehicle

## 🔌 Testing IoT Integration

### Option 1: Use the Simulator (Recommended for Testing)

```bash
cd Backend
node test-iot-device.js
```

This will simulate an IoT device sending data every 5 seconds. You'll see:
- ✅ Success messages when data is received
- ⚠️ Violation alerts when speed exceeds 70 km/h
- Current speed and location data

**Important**: Make sure the `IOT_DEVICE_ID` in the script matches the one you entered when adding the vehicle!

Edit `test-iot-device.js` and change:
```javascript
const IOT_DEVICE_ID = 'IOT-DEVICE-12345'; // Change to your device ID
```

### Option 2: Use cURL for Manual Testing

```bash
# Send a single data point
curl -X POST http://localhost:5000/api/iot/data \
  -H "Content-Type: application/json" \
  -d '{
    "iotDeviceId": "IOT-DEVICE-12345",
    "speed": 85.5,
    "location": {"lat": 6.9271, "lng": 79.8612},
    "timestamp": "2025-11-17T10:30:00Z"
  }'
```

### Option 3: Real IoT Device

See `Backend/IOT_INTEGRATION_GUIDE.md` for complete instructions on setting up a real ESP32 or Arduino device.

## 📱 Using the Dashboard

### Selecting Vehicles
- Click on any vehicle card in the "My Vehicles" section
- Selected vehicle will be highlighted with a blue border
- Checkmark icon appears on selected vehicle

### Viewing Violations
- Violations are automatically filtered for the selected vehicle
- Each violation shows:
  - Speed and speed limit
  - Location (click map icon to view on map)
  - Date and time
  - Fine amount (calculated by ML model)

### IoT Status
- Vehicles with IoT devices show a green "IoT Connected" badge
- Device ID is displayed under the vehicle name
- Current speed is shown if device is actively sending data

## 🔧 Configuration

### Change User ID
In `Frontend/src/pages/user/UserDashboard.tsx` and `UserVehicles.tsx`, update:
```typescript
const userId = "YOUR_ACTUAL_USER_ID_HERE";
```

Get your user ID from MongoDB or your authentication system.

### Change API URL
In `Frontend/src/pages/user/UserDashboard.tsx`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

In `Frontend/src/pages/user/UserVehicles.tsx`:
```typescript
const response = await fetch("http://localhost:5000/api/vehicle/add", {
```

### Change Speed Limit
In `Backend/controllers/iotController.js`:
```javascript
const speedLimit = 70; // Change this value
```

## 🐛 Troubleshooting

### Problem: Vehicles not showing on dashboard
**Solution**: 
- Check that userId matches your actual user ID
- Open browser console (F12) and check for errors
- Verify backend is running and accessible

### Problem: IoT data not being received
**Solution**:
- Verify IoT Device ID matches exactly (case-sensitive)
- Check backend logs for errors
- Ensure backend is running on correct port
- Test with the simulator first

### Problem: Violations not showing for selected vehicle
**Solution**:
- Make sure vehicle is selected (highlighted)
- Check that violations exist in database
- Verify violation.vehicleId matches vehicle.plateNumber
- Check browser console for errors

### Problem: "IoT device already assigned" error
**Solution**:
- Each IoT device can only be assigned to one vehicle
- Use a different device ID for each vehicle
- Remove the device from the other vehicle first

## 📊 What's New

### Dashboard Changes
- ✅ Multiple vehicles displayed in sidebar
- ✅ Click to select vehicle
- ✅ Violations filtered by selected vehicle
- ✅ Stats update based on selected vehicle
- ✅ IoT connection status badges
- ✅ Device ID displayed for connected vehicles

### Vehicle Management
- ✅ IoT Device ID field in add vehicle form
- ✅ Device ID validation (prevents duplicates)
- ✅ IoT status shown in vehicle list
- ✅ Current speed displayed for active devices

### Backend
- ✅ New IoT endpoints for receiving device data
- ✅ Automatic violation detection
- ✅ Real-time speed and location tracking
- ✅ Support for multiple devices per user

## 📚 Additional Resources

- **Complete IoT Guide**: `Backend/IOT_INTEGRATION_GUIDE.md`
- **Implementation Details**: `MULTI_VEHICLE_IOT_IMPLEMENTATION.md`
- **IoT Simulator**: `Backend/test-iot-device.js`

## 🎯 Next Steps

1. ✅ Add your vehicles
2. ✅ Test with IoT simulator
3. ✅ View violations on dashboard
4. 📱 Set up real IoT device (optional)
5. 🚗 Start tracking your vehicles!

## 💡 Tips

- Start with the simulator to understand how it works
- Add test vehicles with different IoT device IDs
- Generate test violations by setting speed > 70 km/h in simulator
- Monitor backend logs to see data flow
- Use browser dev tools to debug frontend issues

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify all services are running
5. Test with the IoT simulator first

Happy tracking! 🚗💨
