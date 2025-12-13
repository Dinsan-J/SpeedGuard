# Geofencing Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Initialize Sensitive Locations Database
```bash
# This will fetch sensitive locations from OpenStreetMap and populate your database
npm run init-locations
```

### 3. Test the Geofencing System
```bash
# Run comprehensive tests to verify everything works
npm run test-geofencing
```

### 4. Start the Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Testing

### Test Violation Processing
```bash
# Test a violation near Colombo General Hospital
curl -X POST http://localhost:5000/api/iot/data \
  -H "Content-Type: application/json" \
  -d '{
    "iotDeviceId": "TEST_DEVICE_001",
    "speed": 80,
    "location": {
      "lat": 6.9271,
      "lng": 79.8612
    }
  }'
```

### Check Sensitive Locations
```bash
# Get all hospitals
curl "http://localhost:5000/api/sensitive-locations?type=hospital&limit=10"

# Get location statistics
curl "http://localhost:5000/api/sensitive-locations/stats"
```

### Analyze Specific Location
```bash
# Test geofencing for a specific coordinate
curl -X POST http://localhost:5000/api/sensitive-locations/analyze-location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 6.9271,
    "longitude": 79.8612,
    "speed": 80
  }'
```

## Expected Results

### After Initialization
- Database populated with 1000+ sensitive locations across Sri Lanka
- Locations include hospitals, schools, universities, towns, and cities
- Each location has appropriate geofence radius

### After Testing Violation
- Violation record created with geofencing analysis
- Fine calculated based on zone type (3x for hospitals, 2x for universities/towns)
- Real-time Socket.IO events emitted

### Sample Response for Hospital Zone Violation
```json
{
  "success": true,
  "message": "Speed violation detected and processed",
  "violation": {
    "vehicleId": "TEST_DEVICE_001",
    "speed": 80,
    "speedLimit": 50,
    "baseFine": 2000,
    "fine": 6000,
    "zoneMultiplier": 3,
    "sensitiveZone": {
      "isInZone": true,
      "zoneType": "hospital",
      "zoneName": "National Hospital of Sri Lanka",
      "distanceFromZone": 150,
      "zoneRadius": 500
    }
  },
  "analysis": {
    "speedLimit": 50,
    "speedViolation": 30,
    "isViolation": true
  }
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file

2. **OSM API Timeout**
   - OpenStreetMap API can be slow
   - Increase timeout in osmService.js if needed
   - Try running init-locations again

3. **No Sensitive Locations Found**
   - Run `npm run init-locations` first
   - Check database connection
   - Verify locations were saved: `curl http://localhost:5000/api/sensitive-locations/stats`

4. **Geofencing Not Working**
   - Ensure locations are initialized
   - Check coordinates are valid (Sri Lanka bounds: lat 5.9-9.8, lng 79.6-81.9)
   - Run test script: `npm run test-geofencing`

### Verification Commands
```bash
# Check if locations are loaded
curl "http://localhost:5000/api/sensitive-locations/stats"

# Test geofencing calculation
curl -X POST http://localhost:5000/api/sensitive-locations/analyze-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 6.9271, "longitude": 79.8612, "speed": 80}'

# Check violation processing
curl "http://localhost:5000/api/violation/stats"
```

## Next Steps

1. **Frontend Integration**: Update React dashboard to display geofencing data
2. **Real-time Monitoring**: Implement Socket.IO listeners for live violation alerts
3. **Data Analysis**: Use the violation statistics for research insights
4. **Fine Tuning**: Adjust zone radii and multipliers based on research needs

## Support

For issues or questions:
1. Check the logs for error messages
2. Run the test script to verify functionality
3. Review the GEOFENCING_IMPLEMENTATION.md for detailed documentation