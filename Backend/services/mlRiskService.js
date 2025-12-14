const Driver = require('../models/Driver');

/**
 * Machine Learning Risk Assessment Service
 * Uses a simple but explainable model suitable for undergraduate research
 */
class MLRiskService {
  constructor() {
    // Feature weights for risk calculation (can be trained with real data)
    this.featureWeights = {
      speedViolation: 0.25,      // How much over the speed limit
      sensitiveZone: 0.20,       // Whether in sensitive zone
      timeOfDay: 0.15,           // Risk varies by time
      driverHistory: 0.20,       // Driver's past violations
      zoneType: 0.10,            // Type of sensitive zone
      trafficDensity: 0.10       // Traffic conditions
    };
    
    // Risk thresholds
    this.riskThresholds = {
      low: 0.3,
      medium: 0.6,
      high: 1.0
    };
    
    // Fine multipliers based on risk level
    this.riskMultipliers = {
      low: 1.0,      // No additional fine
      medium: 1.2,   // 20% increase
      high: 1.5      // 50% increase
    };
  }

  /**
   * Calculate risk score for a violation
   * @param {Object} violationData - Violation details
   * @param {Object} driverData - Driver history (optional)
   * @returns {Object} Risk assessment result
   */
  async calculateRiskScore(violationData, driverData = null) {
    try {
      const features = await this.extractFeatures(violationData, driverData);
      const riskScore = this.computeRiskScore(features);
      const riskLevel = this.determineRiskLevel(riskScore);
      const riskMultiplier = this.riskMultipliers[riskLevel];
      
      return {
        riskScore: Math.round(riskScore * 1000) / 1000, // Round to 3 decimal places
        riskLevel,
        riskMultiplier,
        features,
        explanation: this.generateExplanation(features, riskScore, riskLevel)
      };
    } catch (error) {
      console.error('❌ Error calculating risk score:', error.message);
      return this.getDefaultRiskAssessment();
    }
  }

  /**
   * Extract features from violation data
   */
  async extractFeatures(violationData, driverData) {
    const features = {};
    
    // Speed violation severity (0-1 scale)
    const speedViolation = Math.max(0, violationData.speed - violationData.speedLimit);
    features.speedViolation = Math.min(1.0, speedViolation / 50); // Normalize to 0-1
    
    // Sensitive zone factor (0-1 scale)
    features.sensitiveZone = violationData.sensitiveZone?.isInZone ? 1.0 : 0.0;
    
    // Zone type severity
    const zoneTypeSeverity = {
      'hospital': 1.0,
      'school': 1.0,
      'university': 0.8,
      'town': 0.6,
      'city': 0.6
    };
    features.zoneType = violationData.sensitiveZone?.isInZone ? 
      (zoneTypeSeverity[violationData.sensitiveZone.zoneType] || 0.5) : 0.0;
    
    // Time of day risk (0-1 scale)
    features.timeOfDay = this.getTimeOfDayRisk(violationData.timestamp);
    
    // Driver history risk (0-1 scale)
    if (driverData) {
      features.driverHistory = this.getDriverHistoryRisk(driverData);
    } else {
      features.driverHistory = 0.2; // Default for unknown driver
    }
    
    // Traffic density risk (0-1 scale)
    const trafficRisk = {
      'light': 0.3,
      'moderate': 0.6,
      'heavy': 1.0
    };
    features.trafficDensity = trafficRisk[violationData.trafficDensity] || 0.5;
    
    return features;
  }

  /**
   * Compute weighted risk score
   */
  computeRiskScore(features) {
    let riskScore = 0;
    
    for (const [feature, value] of Object.entries(features)) {
      const weight = this.featureWeights[feature] || 0;
      riskScore += value * weight;
    }
    
    return Math.min(1.0, riskScore); // Cap at 1.0
  }
  /**
   * Determine risk level from score
   */
  determineRiskLevel(riskScore) {
    if (riskScore >= this.riskThresholds.medium) {
      return 'high';
    } else if (riskScore >= this.riskThresholds.low) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get time of day risk factor
   */
  getTimeOfDayRisk(timestamp) {
    const hour = new Date(timestamp).getHours();
    
    // Higher risk during rush hours and late night
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 0.8; // Rush hours
    } else if (hour >= 22 || hour <= 5) {
      return 0.9; // Late night/early morning
    } else if (hour >= 10 && hour <= 16) {
      return 0.4; // Mid-day
    } else {
      return 0.6; // Evening
    }
  }

  /**
   * Get driver history risk factor
   */
  getDriverHistoryRisk(driverData) {
    if (!driverData) return 0.2;
    
    // Base risk from merit points (inverted - lower points = higher risk)
    const meritRisk = (100 - driverData.meritPoints) / 100;
    
    // Recent violation frequency
    const recentViolations = driverData.totalViolations || 0;
    const frequencyRisk = Math.min(1.0, recentViolations / 10);
    
    // Average risk score from past violations
    const historyRisk = driverData.averageRiskScore || 0.2;
    
    // Weighted combination
    return (meritRisk * 0.4) + (frequencyRisk * 0.3) + (historyRisk * 0.3);
  }

  /**
   * Generate human-readable explanation
   */
  generateExplanation(features, riskScore, riskLevel) {
    const factors = [];
    
    if (features.speedViolation > 0.6) {
      factors.push(`High speed violation (${Math.round(features.speedViolation * 50)}+ km/h over limit)`);
    }
    
    if (features.sensitiveZone > 0) {
      factors.push(`Violation in sensitive zone`);
    }
    
    if (features.timeOfDay > 0.7) {
      factors.push(`High-risk time period`);
    }
    
    if (features.driverHistory > 0.6) {
      factors.push(`Poor driving history`);
    }
    
    if (features.trafficDensity > 0.7) {
      factors.push(`Heavy traffic conditions`);
    }
    
    return {
      riskLevel: riskLevel.toUpperCase(),
      riskScore: `${Math.round(riskScore * 100)}%`,
      primaryFactors: factors.slice(0, 3), // Top 3 factors
      recommendation: this.getRiskRecommendation(riskLevel)
    };
  }

  /**
   * Get recommendation based on risk level
   */
  getRiskRecommendation(riskLevel) {
    switch (riskLevel) {
      case 'high':
        return 'Immediate police attention required. Consider mandatory safety training.';
      case 'medium':
        return 'Monitor driver behavior. Warning notice recommended.';
      case 'low':
        return 'Standard processing. Routine violation.';
      default:
        return 'Standard processing.';
    }
  }

  /**
   * Default risk assessment for errors
   */
  getDefaultRiskAssessment() {
    return {
      riskScore: 0.3,
      riskLevel: 'medium',
      riskMultiplier: 1.2,
      features: {},
      explanation: {
        riskLevel: 'MEDIUM',
        riskScore: '30%',
        primaryFactors: ['Unable to calculate detailed risk factors'],
        recommendation: 'Standard processing with moderate caution.'
      }
    };
  }

  /**
   * Calculate merit points deduction based on risk
   */
  calculateMeritPointsDeduction(riskScore, violationType = 'speed') {
    const baseDeduction = {
      'speed': 5,
      'reckless': 15,
      'dangerous': 25
    };
    
    const base = baseDeduction[violationType] || 5;
    const riskMultiplier = 1 + (riskScore * 2); // 1x to 3x based on risk
    
    return Math.round(base * riskMultiplier);
  }

  /**
   * Train model with historical data (placeholder for future implementation)
   */
  async trainModel(historicalData) {
    // This would implement actual ML training with libraries like TensorFlow.js
    // For now, we use the rule-based system above
    console.log('🤖 ML model training not implemented yet. Using rule-based system.');
    return {
      success: false,
      message: 'Training not implemented. Using rule-based risk assessment.'
    };
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics() {
    return {
      modelType: 'Rule-based Risk Assessment',
      version: '1.0',
      features: Object.keys(this.featureWeights),
      accuracy: 'Not applicable (rule-based)',
      lastTrained: 'Not applicable',
      totalPredictions: 'Not tracked'
    };
  }
}

module.exports = new MLRiskService();