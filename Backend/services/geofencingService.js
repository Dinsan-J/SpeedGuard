const SensitiveLocation = require('../models/SensitiveLocation');
const mlRiskService = require('./mlRiskService');
const Driver = require('../models/Driver');

class GeofencingService {
  constructor() {
    // Fine multipliers for different zone types
    this.fineMultipliers = {
      hospital: 3.0,    // Highest fine - 3x multiplier
      school: 3.0,      // Highest fine - 3x multiplier  
      university: 2.0,  // Medium fine - 2x multiplier
      town: 2.0,        // Medium fine - 2x multiplier
      city: 2.0,        // Medium fine - 2x multiplier
      normal: 1.0       // Normal road - 1x multiplier
    };

    // Base fine for all speed violations (LKR)
    this.baseFine = 2000; // Flat rate for all violations
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Get appropriate speed limit based on location
   * @param {boolean} isInSensitiveZone - Whether location is in sensitive zone
   * @returns {number} Speed limit in km/h
   */
  getSpeedLimit(isInSensitiveZone = false) {
    return isInSensitiveZone ? 50 : 70; // 50 km/h in sensitive zones, 70 km/h normal roads
  }

  /**
   * Calculate base fine - flat rate for all violations
   * @param {number} actualSpeed - Actual speed in km/h
   * @param {number} speedLimit - Speed limit in km/h
   * @returns {number} Base fine amount
   */
  calculateBaseFine(actualSpeed, speedLimit) {
    const violation = actualSpeed - speedLimit;
    
    if (violation <= 0) return 0;
    
    return this.baseFine; // Flat 2000 LKR for any speed violation
  }

  /**
   * Find the closest sensitive location to a given point
   * @param {number} latitude - Violation latitude
   * @param {number} longitude - Violation longitude
   * @returns {Object|null} Closest sensitive location with distance
   */
  async findClosestSensitiveLocation(latitude, longitude) {
    try {
      const sensitiveLocations = await SensitiveLocation.find({});
      
      let closestLocation = null;
      let minDistance = Infinity;

      for (const location of sensitiveLocations) {
        const distance = this.calculateDistance(
          latitude, longitude,
          location.latitude, location.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestLocation = {
            ...location.toObject(),
            distanceFromZone: distance
          };
        }
      }

      return closestLocation;
    } catch (error) {
      console.error('❌ Error finding closest sensitive location:', error.message);
      return null;
    }
  }

  /**
   * Check if a location is within any sensitive zone
   * @param {number} latitude - Violation latitude
   * @param {number} longitude - Violation longitude
   * @returns {Object} Geofencing analysis result
   */
  async analyzeViolationLocation(latitude, longitude) {
    try {
      const sensitiveLocations = await SensitiveLocation.find({});
      
      // Check if violation is within any sensitive zone
      for (const location of sensitiveLocations) {
        const distance = this.calculateDistance(
          latitude, longitude,
          location.latitude, location.longitude
        );

        if (distance <= location.radius) {
          return {
            isInZone: true,
            zoneType: location.type,
            zoneName: location.name,
            distanceFromZone: distance,
            zoneRadius: location.radius,
            multiplier: this.fineMultipliers[location.type]
          };
        }
      }

      // If not in any zone, find the closest one for reference
      const closestLocation = await this.findClosestSensitiveLocation(latitude, longitude);
      
      return {
        isInZone: false,
        zoneType: null,
        zoneName: null,
        distanceFromZone: closestLocation ? closestLocation.distanceFromZone : null,
        zoneRadius: null,
        multiplier: this.fineMultipliers.normal,
        closestZone: closestLocation ? {
          name: closestLocation.name,
          type: closestLocation.type,
          distance: closestLocation.distanceFromZone
        } : null
      };
    } catch (error) {
      console.error('❌ Error analyzing violation location:', error.message);
      return {
        isInZone: false,
        zoneType: null,
        zoneName: null,
        distanceFromZone: null,
        zoneRadius: null,
        multiplier: this.fineMultipliers.normal
      };
    }
  }

  /**
   * Calculate final fine with geofencing, ML risk assessment, and dynamic speed limits
   * @param {number} actualSpeed - Actual speed in km/h
   * @param {number} latitude - Violation latitude
   * @param {number} longitude - Violation longitude
   * @param {string} drivingLicenseId - Optional driver license ID for risk assessment
   * @param {number} customSpeedLimit - Optional custom speed limit (overrides automatic detection)
   * @param {Object} additionalContext - Additional context for ML (timeOfDay, trafficDensity, etc.)
   * @returns {Object} Complete violation analysis with ML risk assessment
   */
  async calculateViolationFine(actualSpeed, latitude, longitude, drivingLicenseId = null, customSpeedLimit = null, additionalContext = {}) {
    try {
      // First analyze geofencing to determine if in sensitive zone
      const geofencing = await this.analyzeViolationLocation(latitude, longitude);
      
      // Determine appropriate speed limit
      const speedLimit = customSpeedLimit || this.getSpeedLimit(geofencing.isInZone);
      
      // Calculate base fine
      const baseFine = this.calculateBaseFine(actualSpeed, speedLimit);
      
      if (baseFine === 0) {
        return {
          baseFine: 0,
          finalFine: 0,
          isViolation: false,
          speedLimit,
          speedViolation: actualSpeed - speedLimit,
          geofencing: {
            isInZone: geofencing.isInZone,
            zoneType: geofencing.zoneType,
            zoneName: geofencing.zoneName,
            distanceFromZone: geofencing.distanceFromZone,
            zoneRadius: geofencing.zoneRadius,
            multiplier: geofencing.multiplier,
            closestZone: geofencing.closestZone
          }
        };
      }

      // Get driver data for ML risk assessment
      let driverData = null;
      if (drivingLicenseId) {
        driverData = await Driver.findByLicenseId(drivingLicenseId);
      }

      // Prepare violation data for ML risk assessment
      const violationData = {
        speed: actualSpeed,
        speedLimit: speedLimit,
        sensitiveZone: {
          isInZone: geofencing.isInZone,
          zoneType: geofencing.zoneType,
          zoneName: geofencing.zoneName
        },
        timestamp: new Date(),
        trafficDensity: additionalContext.trafficDensity || 'moderate',
        weatherConditions: additionalContext.weatherConditions || 'clear'
      };

      // Calculate ML risk assessment
      const riskAssessment = await mlRiskService.calculateRiskScore(violationData, driverData);

      // Calculate final fine with both zone and risk multipliers
      const zoneAdjustedFine = Math.round(baseFine * geofencing.multiplier);
      const finalFine = Math.round(zoneAdjustedFine * riskAssessment.riskMultiplier);

      // Calculate merit points deduction with speed over limit
      const speedOverLimit = Math.max(0, actualSpeed - speedLimit);
      const meritPointsDeduction = mlRiskService.calculateMeritPointsDeduction(
        riskAssessment.riskScore, 
        'speed',
        speedOverLimit
      );

      return {
        baseFine,
        finalFine,
        isViolation: true,
        speedLimit,
        speedViolation: actualSpeed - speedLimit,
        
        // Geofencing data
        geofencing: {
          isInZone: geofencing.isInZone,
          zoneType: geofencing.zoneType,
          zoneName: geofencing.zoneName,
          distanceFromZone: geofencing.distanceFromZone,
          zoneRadius: geofencing.zoneRadius,
          multiplier: geofencing.multiplier,
          closestZone: geofencing.closestZone
        },
        
        // ML Risk Assessment
        riskAssessment: {
          riskScore: riskAssessment.riskScore,
          riskLevel: riskAssessment.riskLevel,
          riskMultiplier: riskAssessment.riskMultiplier,
          explanation: riskAssessment.explanation,
          features: riskAssessment.features
        },
        
        // Fine breakdown
        fineBreakdown: {
          base: baseFine,
          afterZoneMultiplier: zoneAdjustedFine,
          afterRiskMultiplier: finalFine,
          zoneMultiplier: geofencing.multiplier,
          riskMultiplier: riskAssessment.riskMultiplier
        },
        
        // Merit points impact
        meritPointsDeduction,
        
        // Driver context
        driverData: driverData ? {
          licenseId: driverData.drivingLicenseId,
          currentMeritPoints: driverData.meritPoints,
          riskLevel: driverData.riskLevel,
          status: driverData.status
        } : null
      };
    } catch (error) {
      console.error('❌ Error calculating violation fine:', error.message);
      
      // Fallback calculation with default speed limit
      const fallbackSpeedLimit = customSpeedLimit || 70;
      const baseFine = this.calculateBaseFine(actualSpeed, fallbackSpeedLimit);
      
      return {
        baseFine,
        finalFine: baseFine,
        isViolation: baseFine > 0,
        speedLimit: fallbackSpeedLimit,
        speedViolation: actualSpeed - fallbackSpeedLimit,
        geofencing: {
          isInZone: false,
          zoneType: null,
          zoneName: null,
          distanceFromZone: null,
          zoneRadius: null,
          multiplier: 1.0,
          error: 'Geofencing analysis failed'
        }
      };
    }
  }

  /**
   * Get statistics about sensitive locations
   */
  async getSensitiveLocationStats() {
    try {
      const stats = await SensitiveLocation.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgRadius: { $avg: '$radius' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const total = await SensitiveLocation.countDocuments();
      
      return {
        total,
        byType: stats,
        lastUpdated: await SensitiveLocation.findOne({}, { updatedAt: 1 }).sort({ updatedAt: -1 })
      };
    } catch (error) {
      console.error('❌ Error getting sensitive location stats:', error.message);
      return null;
    }
  }
}

module.exports = new GeofencingService();