# System Architecture - Multi-Vehicle IoT Integration

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DASHBOARD                          │
│  ┌──────────────────┐              ┌──────────────────────────┐ │
│  │  My Vehicles     │              │  Recent Violations       │ │
│  │  ┌────────────┐  │              │  ┌────────────────────┐ │ │
│  │  │ Vehicle 1  │◄─┼──────────────┼─►│ Violation 1        │ │ │
│  │  │ ABC123     │  │   Selected   │  │ Speed: 85 km/h     │ │ │
│  │  │ IoT: ✓     │  │   Vehicle    │  │ Fine: Rs. 1,800    │ │ │
│  │  └────────────┘  │   Filters    │  └────────────────────┘ │ │
│  │  ┌────────────┐  │  Violations  │  ┌────────────────────┐ │ │
│  │  │ Vehicle 2  │  │              │  │ Violation 2        │ │ │
│  │  │ XYZ789     │  │              │  │ Speed: 78 km/h     │ │ │
│  │  │ IoT: ✓     │  │              │  │ Fine: Rs. 1,500    │ │ │
│  │  └────────────┘  │              │  └────────────────────┘ │ │
│  └──────────────────┘              └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API SERVER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Vehicle Routes                                          │  │
│  │  • GET  /api/vehicle/user/:userId                        │  │
│  │  • POST /api/vehicle/add                                 │  │
│  │  • GET  /api/vehicle/:vehicleId                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  IoT Routes                                              │  │
│  │  • POST /api/iot/data          ◄─── IoT Devices         │  │
│  │  • GET  /api/iot/vehicle/:id                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Violation Routes                                        │  │
│  │  • GET  /api/violation                                   │  │
│  │  • POST /api/violation                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Users      │  │   Vehicles   │  │   Violations         │ │
│  │              │  │              │  │                      │ │
│  │ • username   │  │ • plateNo    │  │ • vehicleId          │ │
│  │ • email      │  │ • make       │  │ • speed              │ │
│  │ • password   │  │ • model      │  │ • location           │ │
│  │ • vehicles[] │  │ • iotDeviceId│  │ • timestamp          │ │
│  │              │  │ • currentSpd │  │ • fine               │ │
│  │              │  │ • location   │  │ • status             │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Real-time Data
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      IoT DEVICES                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  Vehicle 1       │  │  Vehicle 2       │  │  Vehicle 3   │ │
│  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────┐ │ │
│  │  │ ESP32      │  │  │  │ ESP32      │  │  │  │ ESP32  │ │ │
│  │  │ GPS Module │  │  │  │ GPS Module │  │  │  │ GPS    │ │ │
│  │  │ Speed Sens │  │  │  │ Speed Sens │  │  │  │ Module │ │ │
│  │  └────────────┘  │  │  └────────────┘  │  │  └────────┘ │ │
│  │  IOT-DEV-001    │  │  IOT-DEV-002    │  │  IOT-DEV-003 │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Vehicle Registration Flow
```
User → Dashboard → Add Vehicle Form
                        │
                        ├─ Plate Number
                        ├─ Make/Model/Year
                        ├─ Color
                        ├─ Registration/Insurance Dates
                        └─ IoT Device ID (Optional)
                        │
                        ▼
                   POST /api/vehicle/add
                        │
                        ├─ Validate IoT Device ID (unique)
                        ├─ Create Vehicle Document
                        └─ Link to User
                        │
                        ▼
                   MongoDB: Vehicles Collection
                        │
                        ▼
                   Response: Vehicle Created
                        │
                        ▼
                   Dashboard: Show New Vehicle
```

### 2. IoT Data Flow
```
IoT Device (ESP32 + GPS)
        │
        ├─ Read GPS Location
        ├─ Read Speed
        └─ Read Timestamp
        │
        ▼
POST /api/iot/data
{
  iotDeviceId: "IOT-DEVICE-12345",
  speed: 85.5,
  location: { lat: 6.9271, lng: 79.8612 },
  timestamp: "2025-11-17T10:30:00Z"
}
        │
        ▼
Backend: IoT Controller
        │
        ├─ Find Vehicle by iotDeviceId
        ├─ Update currentSpeed
        ├─ Update currentLocation
        ├─ Update lastUpdated
        │
        ├─ Check Speed Limit (70 km/h)
        │
        ├─ If speed > limit:
        │   ├─ Create Violation Record
        │   ├─ Link to Vehicle
        │   └─ Calculate Fine (ML Model)
        │
        └─ Save to Database
        │
        ▼
Response: Success / Violation Detected
        │
        ▼
Dashboard: Real-time Update
```

### 3. Dashboard View Flow
```
User Opens Dashboard
        │
        ▼
GET /api/vehicle/user/:userId
        │
        ▼
Backend: Fetch All User Vehicles
        │
        ▼
Response: Array of Vehicles
        │
        ▼
Dashboard: Display Vehicles
        │
        ├─ Auto-select First Vehicle
        │
        ▼
User Clicks Vehicle
        │
        ├─ Set selectedVehicleId
        │
        ▼
GET /api/violation
        │
        ▼
Backend: Fetch All Violations
        │
        ▼
Frontend: Filter by Selected Vehicle
        │
        ├─ Filter: violation.vehicleId === vehicle.plateNumber
        ├─ Filter: violation.speed > 70
        │
        ▼
Display Filtered Violations
        │
        └─ Update Stats (Total, Pending, Fines)
```

## Component Relationships

### User ↔ Vehicles (One-to-Many)
```
User
  └─ vehicles: [vehicleId1, vehicleId2, vehicleId3, ...]
                    │
                    ▼
              Vehicle Documents
```

### Vehicle ↔ IoT Device (One-to-One)
```
Vehicle
  └─ iotDeviceId: "IOT-DEVICE-12345" (unique)
                    │
                    ▼
              Physical IoT Device
```

### Vehicle ↔ Violations (One-to-Many)
```
Vehicle
  └─ violations: [violationId1, violationId2, ...]
                    │
                    ▼
              Violation Documents
```

## State Management

### Dashboard State
```javascript
{
  vehicles: [
    {
      _id: "...",
      plateNumber: "ABC123",
      iotDeviceId: "IOT-DEVICE-12345",
      currentSpeed: 65,
      currentLocation: { lat: 6.9271, lng: 79.8612 },
      ...
    },
    ...
  ],
  selectedVehicleId: "...",
  violations: [...],
  isLoadingViolations: false,
  stats: {
    totalViolations: 5,
    pendingFines: 5,
    totalFines: 7500
  }
}
```

## API Request/Response Examples

### Add Vehicle
```
Request:
POST /api/vehicle/add
{
  "userId": "64f8c2e2a1b2c3d4e5f6a7b8",
  "vehicleData": {
    "plateNumber": "ABC123",
    "make": "Toyota",
    "model": "Corolla",
    "year": "2020",
    "color": "White",
    "registrationExpiry": "2025-12-31",
    "insuranceExpiry": "2025-12-31",
    "iotDeviceId": "IOT-DEVICE-12345"
  }
}

Response:
{
  "success": true,
  "vehicle": {
    "_id": "...",
    "plateNumber": "ABC123",
    "iotDeviceId": "IOT-DEVICE-12345",
    ...
  }
}
```

### Send IoT Data
```
Request:
POST /api/iot/data
{
  "iotDeviceId": "IOT-DEVICE-12345",
  "speed": 85.5,
  "location": { "lat": 6.9271, "lng": 79.8612 },
  "timestamp": "2025-11-17T10:30:00Z"
}

Response (Violation):
{
  "success": true,
  "message": "Speed violation detected",
  "violation": {
    "_id": "...",
    "vehicleId": "ABC123",
    "speed": 85.5,
    "location": { "lat": 6.9271, "lng": 79.8612 },
    "timestamp": "2025-11-17T10:30:00Z",
    "status": "pending"
  },
  "vehicle": {
    "_id": "...",
    "currentSpeed": 85.5,
    "currentLocation": { "lat": 6.9271, "lng": 79.8612 }
  }
}
```

## Security Layers

```
┌─────────────────────────────────────┐
│  1. HTTPS/TLS Encryption            │
│     • All API communications        │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  2. Authentication                  │
│     • User login/session            │
│     • JWT tokens                    │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  3. Authorization                   │
│     • User can only access own data │
│     • Vehicle ownership validation  │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  4. Data Validation                 │
│     • IoT Device ID uniqueness      │
│     • Speed/location validation     │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  5. Rate Limiting                   │
│     • Prevent API abuse             │
│     • IoT data throttling           │
└─────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Multiple backend instances behind load balancer
- MongoDB replica sets for high availability
- Redis for session management and caching

### Performance Optimization
- Index on iotDeviceId for fast lookups
- Index on userId for vehicle queries
- Index on vehicleId for violation queries
- Pagination for large violation lists
- Caching frequently accessed data

### Future Enhancements
- WebSocket for real-time dashboard updates
- Message queue (RabbitMQ/Kafka) for IoT data processing
- Time-series database for historical speed data
- CDN for static assets
- Microservices architecture for different features
