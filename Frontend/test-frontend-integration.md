# Frontend Integration Test Guide

## Testing the Enhanced Geofencing Display

### 1. Start the Backend Server
```bash
cd Backend
npm start
```

### 2. Start the Frontend Development Server
```bash
cd Frontend
npm run dev
```

### 3. Create Test Violations
Use the IoT endpoint to create violations with geofencing data:

```bash
# Test violation in sensitive zone (hospital)
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

# Test violation on normal road
curl -X POST http://localhost:5000/api/iot/data \
  -H "Content-Type: application/json" \
  -d '{
    "iotDeviceId": "TEST_DEVICE_002", 
    "speed": 85,
    "location": {
      "lat": 7.5000,
      "lng": 80.0000
    }
  }'
```

### 4. View Results in Frontend

Navigate to:
- **User Dashboard**: `http://localhost:8080/user/dashboard`
- **User Violations**: `http://localhost:8080/user/violations`

### Expected Display Features

#### Dashboard Recent Violations:
- 🚨 **Sensitive Zone Alert** for violations in hospitals/schools/etc.
- 🚗 **Speed**: Actual speed with icon
- 🚦 **Limit**: Speed limit with zone type (Sensitive/Normal)
- 📊 **Excess**: Speed over limit
- 💰 **Fine Breakdown**: Base fine × multiplier = total
- **Zone Details**: Zone name, type, distance from center

#### Violations Page:
- **Detailed Cards** with all geofencing information
- **Zone Information Panel** for sensitive zone violations
- **Speed Breakdown** with visual indicators
- **Fine Calculation** showing base fine and multipliers
- **Location Details** with coordinates and zone info

### Sample Expected Output

For a violation at Colombo General Hospital:
```
🚨 IN SENSITIVE ZONE: Colombo (city)
📍 Distance from center: 1519m
🔄 Fine multiplier: 2x

🚗 Speed: 80 km/h
🚦 Speed Limit: 50 km/h (Sensitive Zone)  
📊 Speed Violation: +30 km/h

💰 Base Fine: LKR 2,000
💰 Final Fine: LKR 4,000
```

### Troubleshooting

1. **No violations showing**: Ensure backend is running and violations exist
2. **Missing geofencing data**: Run `npm run init-locations` in Backend
3. **API errors**: Check console for network errors and API responses
4. **Styling issues**: Ensure all Tailwind classes are available

### API Endpoints Used

- `GET /api/violation` - Fetch violations with geofencing data
- `POST /api/iot/data` - Create new violations
- `GET /api/sensitive-locations/stats` - Location statistics