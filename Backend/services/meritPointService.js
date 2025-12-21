const User = require('../models/User');
const Violation = require('../models/Violation');

class MeritPointService {
  
  /**
   * Apply merit point deduction for a confirmed violation
   */
  static async applyViolationPenalty(userId, violationId) {
    try {
      const user = await User.findById(userId);
      const violation = await Violation.findById(violationId);
      
      if (!user || !violation) {
        throw new Error('User or violation not found');
      }
      
      if (violation.meritPointsApplied) {
        return { message: 'Merit points already applied for this violation' };
      }
      
      // Deduct merit points based on speed over limit
      const result = user.deductMeritPoints(violation.speedOverLimit);
      
      // Mark violation as processed
      violation.meritPointsApplied = true;
      violation.meritPointsDeducted = result.pointsDeducted;
      
      await user.save();
      await violation.save();
      
      console.log(`🎯 Merit points deducted: ${result.pointsDeducted} points`);
      console.log(`📊 New merit total: ${result.newTotal}/100 points`);
      console.log(`🚦 Driving status: ${user.drivingStatus}`);
      
      return {
        pointsDeducted: result.pointsDeducted,
        newTotal: result.newTotal,
        drivingStatus: user.drivingStatus,
        message: this.getStatusMessage(user.drivingStatus, result.newTotal)
      };
      
    } catch (error) {
      console.error('Error applying violation penalty:', error);
      throw error;
    }
  }
  
  /**
   * Process weekly merit point recovery for all users
   */
  static async processWeeklyRecovery() {
    try {
      const users = await User.find({ 
        role: 'user',
        meritPoints: { $lt: 100 },
        lastViolationDate: { $exists: true }
      });
      
      const recoveryResults = [];
      
      for (const user of users) {
        const result = user.recoverMeritPoints();
        
        if (result.recovered > 0) {
          await user.save();
          recoveryResults.push({
            userId: user._id,
            username: user.username,
            recovered: result.recovered,
            newTotal: result.newTotal,
            status: user.drivingStatus
          });
          
          console.log(`✅ ${user.username}: +${result.recovered} points (${result.newTotal}/100)`);
        }
      }
      
      return recoveryResults;
      
    } catch (error) {
      console.error('Error processing weekly recovery:', error);
      throw error;
    }
  }
  
  /**
   * Get user merit point status and recommendations
   */
  static async getUserMeritStatus(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Initialize merit points if not set
      if (user.meritPoints === undefined || user.meritPoints === null) {
        user.meritPoints = 100;
        user.drivingStatus = 'active';
        user.totalViolations = 0;
        user.violationFreeWeeks = 0;
        await user.save();
      }
      
      // Calculate weeks since last violation
      let weeksSinceViolation = 0;
      if (user.lastViolationDate) {
        const now = new Date();
        const lastViolation = new Date(user.lastViolationDate);
        weeksSinceViolation = Math.floor((now - lastViolation) / (7 * 24 * 60 * 60 * 1000));
      }
      
      // Calculate potential recovery
      const potentialRecovery = user.recoverMeritPoints();
      
      return {
        currentPoints: user.meritPoints,
        maxPoints: 100,
        drivingStatus: user.drivingStatus,
        totalViolations: user.totalViolations,
        weeksSinceViolation: weeksSinceViolation,
        violationFreeWeeks: user.violationFreeWeeks,
        potentialRecovery: potentialRecovery.recovered,
        statusMessage: this.getStatusMessage(user.drivingStatus, user.meritPoints),
        recommendations: this.getRecommendations(user),
        lastViolationDate: user.lastViolationDate,
        vehicleType: user.vehicleType,
        speedLimit: user.getSpeedLimit ? user.getSpeedLimit() : 70
      };
      
    } catch (error) {
      console.error('Error getting merit status:', error);
      throw error;
    }
  }
  
  /**
   * Get status message based on merit points
   */
  static getStatusMessage(status, points) {
    switch (status) {
      case 'active':
        return `Your driving record is in good standing with ${points} merit points.`;
      case 'warning':
        return `Warning: You have ${points} merit points. Drive carefully to avoid further penalties.`;
      case 'review':
        return `Your license is flagged for review with ${points} merit points. Contact DMT for guidance.`;
      case 'suspended':
        return `Your driving privileges are suspended. You have 0 merit points and must complete rehabilitation.`;
      default:
        return `Current merit points: ${points}/100`;
    }
  }
  
  /**
   * Get personalized recommendations
   */
  static getRecommendations(user) {
    const recommendations = [];
    
    if (user.meritPoints < 30) {
      recommendations.push('Consider taking a defensive driving course');
      recommendations.push('Review Sri Lankan traffic rules and regulations');
    }
    
    if (user.meritPoints < 50) {
      recommendations.push('Drive within speed limits at all times');
      recommendations.push('Be extra cautious in sensitive zones (schools, hospitals)');
    }
    
    if (user.totalViolations > 5) {
      recommendations.push('Consider using speed monitoring apps');
      recommendations.push('Plan routes to avoid high-traffic areas');
    }
    
    if (user.violationFreeWeeks >= 4) {
      recommendations.push('Great job! Keep up the safe driving to recover more points');
    }
    
    return recommendations;
  }
  
  /**
   * Get system-wide merit point statistics
   */
  static async getSystemStatistics() {
    try {
      const stats = await User.aggregate([
        { $match: { role: 'user' } },
        {
          $group: {
            _id: '$drivingStatus',
            count: { $sum: 1 },
            avgMeritPoints: { $avg: '$meritPoints' },
            totalViolations: { $sum: '$totalViolations' }
          }
        }
      ]);
      
      const totalUsers = await User.countDocuments({ role: 'user' });
      const highRiskUsers = await User.countDocuments({ 
        role: 'user', 
        $or: [
          { meritPoints: { $lt: 30 } },
          { drivingStatus: { $in: ['review', 'suspended'] } }
        ]
      });
      
      return {
        totalUsers,
        highRiskUsers,
        statusBreakdown: stats,
        riskPercentage: ((highRiskUsers / totalUsers) * 100).toFixed(1)
      };
      
    } catch (error) {
      console.error('Error getting system statistics:', error);
      throw error;
    }
  }
}

module.exports = MeritPointService;