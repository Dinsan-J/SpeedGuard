# SpeedGuard: Vehicle-Type-Based Merit Point System Implementation

## 🎯 System Overview

This document outlines the implementation of a comprehensive traffic violation monitoring system with dynamic speed limits based on vehicle types and an improved merit point system for Sri Lankan roads.

## 📋 Implementation Summary

### ✅ TASK 1: User Registration Module with Vehicle Type Selection

**Database Schema Updates:**
- Enhanced `User` model with `vehicleType` field
- Added driver profile information storage
- Integrated merit point system (starts at 100 points)
- Added driving status tracking

**Vehicle Types Supported:**
- **Motorcycle**: 70 km/h speed limit
- **Light Vehicle** (Car, Van, Jeep): 70 km/h speed limit  
- **Three-Wheeler** (Auto): 50 km/h speed limit
- **Heavy Vehicle** (Bus, Lorry): 50 km/h speed limit

**Frontend Changes:**
- Updated registration form with vehicle type selection
- Added driver profile fields (name, phone, license number)
- Visual speed limit indicators for each vehicle type

**Backend Validation:**
- Vehicle type required for user registration
- Server-side validation of vehicle type enum values
- Dynamic speed limit calculation based on vehicle type

### ✅ TASK 2: Dynamic Speed Limit Logic

**IoT Integration:**
- Modified `receiveIoTData` controller to detect vehicle type
- Dynamic speed limit application based on vehicle registration
- Real-time violation detection with vehicle-specific limits

**Speed Limit Enforcement:**
```javascript
const speedLimits = {
  motorcycle: 70,      // km/h
  light_vehicle: 70,   // km/h  
  three_wheeler: 50,   // km/h
  heavy_vehicle: 50    // km/h
};
```

**Violation Processing:**
- Automatic vehicle type detection from IoT device or user profile
- Speed over limit calculation: `speedOverLimit = detectedSpeed - appliedSpeedLimit`
- Enhanced violation records with vehicle type and applied speed limit

### ✅ TASK 3: New Merit Point System

**Merit Point Rules:**
- Every driver starts with **100 merit points**
- Points deducted based on speed violation severity:

| Speed Over Limit | Penalty | Severity Level |
|------------------|---------|----------------|
| 1-10 km/h        | -5 points | Minor |
| 11-20 km/h       | -10 points | Moderate |
| 21-30 km/h       | -20 points | Serious |
| >30 km/h         | -30 points + Fine | Severe |

**Driving Status Based on Merit Points:**
- **50-100 points**: Active (good standing)
- **30-49 points**: Warning (caution advised)
- **1-29 points**: Review (license flagged)
- **0 points**: Suspended (driving ban recommended)

**Merit Point Recovery:**
- **+2 points per violation-free week**
- Maximum recovery up to 100 points
- Automatic weekly processing system

### ✅ TASK 4: System Architecture

**New Database Models:**

1. **Enhanced User Model** (`Backend/models/User.js`):
```javascript
{
  vehicleType: String, // Required for users
  meritPoints: Number, // Default: 100
  drivingStatus: String, // active/warning/review/suspended
  totalViolations: Number,
  violationFreeWeeks: Number,
  driverProfile: {
    fullName: String,
    licenseNumber: String,
    phoneNumber: String
  }
}
```

2. **Updated Violation Model** (`Backend/models/Violation.js`):
```javascript
{
  vehicleType: String, // Vehicle type at time of violation
  appliedSpeedLimit: Number, // Dynamic speed limit used
  speedOverLimit: Number, // How much over the limit
  severityLevel: String, // minor/moderate/serious/severe
  meritPointsDeducted: Number,
  requiresFine: Boolean // For >30 km/h violations
}
```

**New Services:**

1. **Merit Point Service** (`Backend/services/meritPointService.js`):
   - Violation penalty application
   - Weekly merit point recovery
   - User status management
   - System statistics

2. **Updated Police Confirmation Service**:
   - Integration with new merit point system
   - User-based driver confirmation
   - Automatic merit point deduction

**New API Endpoints:**
- `GET /api/merit-points/status` - Get user merit point status
- `POST /api/merit-points/apply-penalty` - Apply violation penalty (Police)
- `GET /api/merit-points/statistics` - System statistics (Police)
- `POST /api/merit-points/process-recovery` - Weekly recovery processing

## 🔄 System Flow

### 1. User Registration Flow
```
User Registration → Vehicle Type Selection → Driver Profile → Merit Points (100) → Active Status
```

### 2. Violation Detection Flow
```
IoT Device → Speed Detection → Vehicle Type Lookup → Dynamic Speed Limit → Violation Check → Merit Point Calculation
```

### 3. Police Confirmation Flow
```
Pending Violation → Police Scan QR → Driver Confirmation → Merit Point Deduction → Status Update
```

### 4. Merit Point Recovery Flow
```
Weekly Process → Check Violation-Free Period → Calculate Recovery → Update Merit Points → Status Update
```

## 📊 Merit Point System Logic

### Violation Severity Calculation
```javascript
if (speedOverLimit <= 10) {
  severity = 'minor';
  points = -5;
} else if (speedOverLimit <= 20) {
  severity = 'moderate'; 
  points = -10;
} else if (speedOverLimit <= 30) {
  severity = 'serious';
  points = -20;
} else {
  severity = 'severe';
  points = -30;
  requiresFine = true;
}
```

### Status Determination
```javascript
if (meritPoints >= 50) status = 'active';
else if (meritPoints >= 30) status = 'warning';
else if (meritPoints > 0) status = 'review';
else status = 'suspended';
```

### Recovery Calculation
```javascript
weeksSinceViolation = Math.floor((now - lastViolation) / (7 * 24 * 60 * 60 * 1000));
pointsToRecover = Math.min(weeksSinceViolation * 2, 100 - currentPoints);
```

## 🎨 Frontend Components

### Updated Components:
1. **Registration Form** - Vehicle type selection with speed limit display
2. **Merit Points Dashboard** - Real-time merit point status and recovery tracking
3. **User Dashboard** - Vehicle type and driving status display
4. **Police Scanner** - Enhanced driver confirmation with merit point integration

## 🔧 Technical Implementation

### Key Features:
- **Scalable**: Handles multiple vehicle types and can be extended
- **Fair**: Merit points based on violation severity, not flat deductions
- **Legally Reasonable**: Aligned with Sri Lankan traffic context
- **Real-time**: Immediate violation detection and processing
- **Recovery-focused**: Encourages safe driving through point recovery

### Performance Optimizations:
- Database indexing on vehicle type and merit points
- Efficient violation processing with pre-calculated severity
- Batch processing for weekly merit point recovery

## 📈 System Benefits

### For Drivers:
- Clear understanding of speed limits based on vehicle type
- Fair merit point system with recovery opportunities
- Transparent violation severity classification
- Incentive for safe driving behavior

### For Law Enforcement:
- Accurate vehicle-type-based violation detection
- Streamlined driver confirmation process
- Comprehensive merit point tracking
- System-wide statistics and analytics

### For Traffic Management:
- Reduced violations through clear speed limit enforcement
- Improved road safety through merit point incentives
- Data-driven insights for policy decisions
- Scalable system for nationwide deployment

## 🚀 Deployment Checklist

- [x] Database schema updates applied
- [x] Backend API endpoints implemented
- [x] Frontend components updated
- [x] Merit point calculation logic implemented
- [x] Vehicle type validation added
- [x] Police confirmation system updated
- [x] Weekly recovery process implemented
- [x] System testing completed

## 📚 Research Documentation

This implementation provides comprehensive material for:

### Chapter 3 - System Design:
- Vehicle type classification system
- Merit point algorithm design
- Database schema architecture
- API endpoint specifications

### Chapter 4 - Implementation:
- Code structure and organization
- Frontend-backend integration
- Real-time violation processing
- Merit point recovery automation

The system successfully addresses the requirements for a fair, scalable, and legally reasonable traffic violation monitoring system suitable for Sri Lankan road conditions.