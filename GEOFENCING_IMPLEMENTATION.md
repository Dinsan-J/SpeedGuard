# Geofencing Implementation for Vehicle Monitoring System

## Overview

This implementation adds intelligent geofencing capabilities to the vehicle monitoring system, automatically detecting when speed violations occur near sensitive locations in Sri Lanka and adjusting fines accordingly.

## Features

### 🎯 Core Functionality
- **OpenStreetMap Integration**: Fetches real-time data for sensitive locations across Sri Lanka
- **Intelligent Geofencing**: Uses Haversine formula for accurate distance calculations
- **Dynamic Fine Calculation**: Adjusts fines based on proximity to sensitive zones
- **Real-time Processing**: Processes violations instantly as IoT data arrives
- **Scalable Architecture**: Modular design suitable for research and production use

### 📍 Sensitive Location Types
- **Hospitals** (500m radius, 3x fine multiplier)
- **Schools** (300m radius, 3x fine multiplier)
- **Universities** (800m radius, 2x fine multiplier)
- **Towns** (1000m radius, 2x fine multiplier)
- **Cities** (2000m radius, 2x fine multiplier)

## Database Schema

### SensitiveLocation Model
```javascript
{
  name: String,           // Location name
  type: String,           // hospital, school, university, town, city
  latitude: Number,       // GPS latitude
  longitude: Number,      // GPS longitude
  radius: Number,         // Geofence radius in meters
  osmId: String,          // OpenStreetMap ID (unique)
  address: String,        // Human-readable address
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

### Enhanced Violation Model
```javascript
{
  // Existing fields...
  speedLimit: Number,     // Speed limit at violation location (50 or 70 km/h)
  baseFine: Number,       // Original fine before zone multiplier
  zoneMultiplier: Number, // Fine multiplier (1.0 = normal, 2.0 = 2x, 3.0 = 3x)
  sensitiveZone: {
    isInZone: Boolean,    // Whether violation occurred in sensitive zone
    zoneType: String,     // Type of zone (hospital, school, etc.)
    zoneName: String,     // Name of the sensitive location
    distanceFromZone: Number, // Distance from zone center (meters)
    zoneRadius: Number    // Zone radius (meters)
  }
}
```

## API Endpoints

### Sensitive Locations Management

#### GET `/api/sensitive-locations`
Get all sensitive locations with optional filtering
```javascript
// Query parameters
{
  type: 'hospital|school|university|town|city',
  limit: 100,
  page: 1
}
```

#### GET `/api/sensitive-locations/stats`
Get statistics about sensitive locations
```javascript
// Response
{
  total: 1250,
  byType: [
    { _id: 'school', count: 500, avgRadius: 300 },
    { _id: 'hospital', count: 200, avgRadius: 500 }
  ],
  lastUpdated: "2024-01-15T10:30:00Z"
}
```

#### POST `/api/sensitive-locations/update-from-osm`
Fetch and update locations from OpenStreetMap
```javascript
// Response
{
  success: true,
  data: {
    savedCount: 150,
    updatedCount: 50
  }
}
```

#### POST `/api/sensitive-locations/analyze-location`
Analyze a specific location for geofencing
```javascript
// Request body
{
  latitude: 6.9271,
  longitude: 79.8612,
  speed: 80
  // speedLimit is optional - system auto-detects based on location
}

// Response
{
  baseFine: 2000,
  finalFine: 6000,
  isViolation: true,
  speedLimit: 50,        // Auto-detected: 50 km/h in sensitive zone
  speedViolation: 30,    // 80 - 50 = 30 km/h over
  geofencing: {
    isInZone: true,
    zoneType: "hospital",
    zoneName: "Colombo General Hospital",
    distanceFromZone: 150,
    zoneRadius: 500,
    multiplier: 3.0
  }
}
```

#### GET `/api/sensitive-locations/nearby`
Find sensitive locations near a point
```javascript
// Query parameters
{
  latitude: 6.9271,
  longitude: 79.8612,
  radius: 5000  // Search radius in meters
}
```

### Enhanced Violation Endpoints

#### GET `/api/violation`
Enhanced violation listing with geofencing filters
```javascript
// Query parameters
{
  minSpeed: 70,
  zoneType: 'hospital',
  isInZone: true,
  limit: 100,
  page: 1,
  sortBy: 'timestamp',
  sortOrder: 'desc'
}
```

#### GET `/api/violation/stats`
Violation statistics including geofencing data
```javascript
// Response
{
  overall: {
    totalViolations: 1500,
    avgSpeed: 85.5,
    avgFine: 8500,
    violationsInZones: 450
  },
  byZoneType: [
    { _id: 'hospital', count: 200, avgFine: 15000, avgSpeed: 88 },
    { _id: 'school', count: 150, avgFine: 12000, avgSpeed: 82 }
  ]
}
```

## Fine Calculation Logic

### Base Fine Structure (LKR)
- **All violations**: 2,000 LKR (flat rate regardless of speed difference)

### Zone Multipliers
- **Normal road**: 1.0x (no change)
- **Near hospital/school**: 3.0x (highest penalty)
- **Near university/town/city**: 2.0x (medium penalty)

### Dynamic Speed Limits
- **Normal Roads**: 70 km/h speed limit
- **Sensitive Zones**: 50 km/h speed limit (hospitals, schools, universities, towns, cities)

### Example Calculations
```javascript
// Example 1: 80 km/h near hospital (50 km/h limit in sensitive zone)
Speed violation: 30 km/h over limit
Base fine: 2,000 LKR (flat rate for any violation)
Zone multiplier: 3.0x (hospital zone)
Final fine: 6,000 LKR

// Example 2: 80 km/h on normal road (70 km/h limit)
Speed violation: 10 km/h over limit  
Base fine: 2,000 LKR (flat rate for any violation)
Zone multiplier: 1.0x (normal road)
Final fine: 2,000 LKR

// Example 3: 65 km/h on normal road (70 km/h limit)
No violation - within speed limit
Fine: 0 LKR
```

## Services Architecture

### OSMService (`services/osmService.js`)
- Fetches sensitive location data from OpenStreetMap Overpass API
- Parses and normalizes location data
- Handles data updates and synchronization
- Manages default radius settings for different location types

### GeofencingService (`services/geofencingService.js`)
- Implements Haversine distance calculations
- Analyzes violation locations against sensitive zones
- Calculates dynamic fines with zone multipliers
- Provides geospatial analysis and statistics

## Installation & Setup

### 1. Install Dependencies
```bash
cd Backend
npm install axios
```

### 2. Initialize Sensitive Locations
```bash
# Run the initialization script
node scripts/initializeSensitiveLocations.js
```

### 3. Test Geofencing
```bash
# Run the test script
node test-geofencing.js
```

### 4. Update Location Data (Optional)
```bash
# Update locations from OSM (can be run periodically)
curl -X POST http://localhost:5000/api/sensitive-locations/update-from-osm
```

## Usage Examples

### Processing IoT Data with Geofencing
```javascript
// IoT device sends data
POST /api/iot/data
{
  "iotDeviceId": "ESP32_001",
  "speed": 85,
  "location": {
    "lat": 6.9271,
    "lng": 79.8612
  },
  "speedLimit": 60
}

// System automatically:
// 1. Checks for speed violation (85 > 60)
// 2. Analyzes location for sensitive zones
// 3. Calculates appropriate fine
// 4. Stores violation with geofencing data
// 5. Emits real-time alerts via Socket.IO
```

### Real-time Monitoring
The system emits Socket.IO events for real-time monitoring:
- `vehicleUpdate`: Real-time vehicle position and speed
- `violationAlert`: Immediate violation notifications with geofencing details

## Research Applications

### Data Collection
- **Violation Patterns**: Analyze where violations occur most frequently
- **Zone Effectiveness**: Measure if sensitive zones reduce violations
- **Fine Impact**: Study correlation between fine amounts and behavior change
- **Geographic Analysis**: Identify high-risk areas and road segments

### Analytics Queries
```javascript
// Violations by zone type
db.violations.aggregate([
  { $match: { "sensitiveZone.isInZone": true } },
  { $group: { _id: "$sensitiveZone.zoneType", count: { $sum: 1 } } }
])

// Average fine by location type
db.violations.aggregate([
  { $group: { 
    _id: "$sensitiveZone.zoneType", 
    avgFine: { $avg: "$fine" },
    count: { $sum: 1 }
  }}
])
```

## Performance Considerations

### Optimization Strategies
- **Database Indexing**: Geospatial indexes on location coordinates
- **Caching**: Cache sensitive location data in memory for faster lookups
- **Batch Processing**: Process multiple violations efficiently
- **API Rate Limiting**: Respect OpenStreetMap API usage limits

### Scalability Features
- **Modular Architecture**: Services can be deployed independently
- **Async Processing**: Non-blocking violation processing
- **Error Handling**: Graceful degradation when geofencing fails
- **Data Validation**: Comprehensive input validation and sanitization

## Monitoring & Maintenance

### Health Checks
- Monitor OSM API availability
- Track geofencing calculation performance
- Validate location data accuracy
- Monitor fine calculation consistency

### Data Updates
- Periodic OSM data synchronization
- Location accuracy verification
- Radius adjustment based on research findings
- Fine structure updates based on policy changes

## Future Enhancements

### Planned Features
- **Machine Learning**: Predict violation likelihood based on location patterns
- **Dynamic Zones**: Adjust zone sizes based on traffic patterns
- **Weather Integration**: Factor weather conditions into fine calculations
- **Time-based Zones**: Different rules for school hours vs. after hours
- **Mobile App**: Real-time zone notifications for drivers

### Research Extensions
- **Behavioral Analysis**: Study driver behavior changes over time
- **Policy Impact**: Measure effectiveness of different fine structures
- **Geographic Modeling**: Advanced spatial analysis of violation patterns
- **Predictive Analytics**: Forecast violation hotspots

## Conclusion

This geofencing implementation provides a robust, scalable foundation for intelligent traffic violation management. The system combines real-time IoT data processing with sophisticated geospatial analysis to create a fair and effective enforcement mechanism that prioritizes safety in sensitive areas while maintaining research-grade data collection capabilities.