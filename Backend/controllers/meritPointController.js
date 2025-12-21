const MeritPointService = require('../services/meritPointService');
const User = require('../models/User');

/**
 * Get user's merit point status (authenticated user)
 */
exports.getUserMeritStatus = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const status = await MeritPointService.getUserMeritStatus(userId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting merit status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving merit point status',
      error: error.message
    });
  }
};

/**
 * Get current user profile with merit points
 */
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get merit point status
    const meritStatus = await MeritPointService.getUserMeritStatus(userId);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          vehicleType: user.vehicleType,
          driverProfile: user.driverProfile
        },
        meritPoints: meritStatus
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile',
      error: error.message
    });
  }
};

/**
 * Apply merit point penalty for confirmed violation (Police use)
 */
exports.applyViolationPenalty = async (req, res) => {
  try {
    const { userId, violationId } = req.body;
    
    // Verify officer permissions
    if (req.user.role !== 'officer') {
      return res.status(403).json({
        success: false,
        message: 'Only police officers can apply merit point penalties'
      });
    }
    
    const result = await MeritPointService.applyViolationPenalty(userId, violationId);
    
    res.json({
      success: true,
      message: 'Merit point penalty applied successfully',
      data: result
    });
  } catch (error) {
    console.error('Error applying penalty:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying merit point penalty',
      error: error.message
    });
  }
};

/**
 * Process weekly merit point recovery (Admin/System use)
 */
exports.processWeeklyRecovery = async (req, res) => {
  try {
    const results = await MeritPointService.processWeeklyRecovery();
    
    res.json({
      success: true,
      message: `Processed merit point recovery for ${results.length} users`,
      data: results
    });
  } catch (error) {
    console.error('Error processing recovery:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing weekly recovery',
      error: error.message
    });
  }
};

/**
 * Get system-wide merit point statistics (Admin/Officer use)
 */
exports.getSystemStatistics = async (req, res) => {
  try {
    if (req.user.role !== 'officer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Officer privileges required.'
      });
    }
    
    const stats = await MeritPointService.getSystemStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system statistics',
      error: error.message
    });
  }
};

/**
 * Get merit point history for a user
 */
exports.getMeritPointHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Users can only view their own history, officers can view any
    if (req.user.role !== 'officer' && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get recent violations with merit point impact
    const violations = await require('../models/Violation').find({
      userId: userId,
      meritPointsApplied: true
    }).sort({ timestamp: -1 }).limit(20);
    
    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          meritPoints: user.meritPoints,
          drivingStatus: user.drivingStatus,
          totalViolations: user.totalViolations,
          violationFreeWeeks: user.violationFreeWeeks
        },
        recentViolations: violations.map(v => ({
          id: v._id,
          date: v.timestamp,
          speed: v.speed,
          speedLimit: v.appliedSpeedLimit,
          speedOverLimit: v.speedOverLimit,
          severityLevel: v.severityLevel,
          meritPointsDeducted: v.meritPointsDeducted,
          location: v.location,
          vehicleType: v.vehicleType
        }))
      }
    });
  } catch (error) {
    console.error('Error getting merit history:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving merit point history',
      error: error.message
    });
  }
};

/**
 * Update user vehicle type (for existing users)
 */
exports.updateVehicleType = async (req, res) => {
  try {
    const { vehicleType } = req.body;
    const userId = req.user.id;
    
    const validTypes = ['motorcycle', 'light_vehicle', 'three_wheeler', 'heavy_vehicle'];
    if (!validTypes.includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle type'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.vehicleType = vehicleType;
    await user.save();
    
    res.json({
      success: true,
      message: 'Vehicle type updated successfully',
      data: {
        vehicleType: vehicleType,
        speedLimit: user.getSpeedLimit()
      }
    });
  } catch (error) {
    console.error('Error updating vehicle type:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle type',
      error: error.message
    });
  }
};