const Violation = require('../models/Violation');
const Driver = require('../models/Driver');
const User = require('../models/User');

/**
 * Police Confirmation Service
 * Handles driver identification and violation confirmation by police officers
 */
class PoliceConfirmationService {
  
  /**
   * Get pending violations awaiting police confirmation
   * @param {Object} filters - Optional filters (vehicleId, timeRange, etc.)
   * @returns {Array} Pending violations
   */
  async getPendingViolations(filters = {}) {
    try {
      let query = { 
        driverConfirmed: false, 
        status: 'pending' 
      };
      
      // Apply filters
      if (filters.vehicleId) {
        query.vehicleId = filters.vehicleId;
      }
      
      if (filters.riskLevel) {
        query.riskLevel = filters.riskLevel;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.timestamp = {};
        if (filters.dateFrom) {
          query.timestamp.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.timestamp.$lte = new Date(filters.dateTo);
        }
      }
      
      const violations = await Violation.find(query)
        .sort({ timestamp: -1, riskScore: -1 }) // Prioritize recent and high-risk
        .limit(filters.limit || 50);
      
      return violations;
    } catch (error) {
      console.error('❌ Error fetching pending violations:', error.message);
      throw error;
    }
  }

  /**
   * Confirm driver for a violation
   * @param {string} violationId - Violation ID
   * @param {string} drivingLicenseId - Driver's license ID
   * @param {string} officerId - Police officer's user ID
   * @param {Object} additionalInfo - Additional confirmation details
   * @returns {Object} Confirmation result
   */
  async confirmDriver(violationId, drivingLicenseId, officerId, additionalInfo = {}) {
    try {
      // Validate inputs
      if (!violationId || !drivingLicenseId || !officerId) {
        throw new Error('Missing required parameters: violationId, drivingLicenseId, officerId');
      }

      // Find the violation
      const violation = await Violation.findById(violationId);
      if (!violation) {
        throw new Error('Violation not found');
      }

      if (violation.driverConfirmed) {
        throw new Error('Violation already confirmed');
      }

      // Validate police officer
      const officer = await User.findById(officerId);
      if (!officer || officer.role !== 'officer') {
        throw new Error('Invalid police officer');
      }

      // Find or create driver record
      let driver = await Driver.findByLicenseId(drivingLicenseId);
      if (!driver) {
        // Create new driver record with basic info
        driver = new Driver({
          drivingLicenseId: drivingLicenseId,
          fullName: additionalInfo.driverName || 'Unknown Driver',
          dateOfBirth: additionalInfo.dateOfBirth || new Date('1990-01-01'),
          licenseIssueDate: additionalInfo.licenseIssueDate || new Date(),
          licenseExpiryDate: additionalInfo.licenseExpiryDate || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years from now
          licenseClass: additionalInfo.licenseClass || 'B'
        });
        await driver.save();
        console.log(`✅ Created new driver record: ${drivingLicenseId}`);
      }

      // Confirm the violation
      await violation.confirmDriver(drivingLicenseId, officerId);

      // Apply merit points deduction
      if (violation.meritPointsDeducted > 0) {
        await driver.deductMeritPoints(
          violation.meritPointsDeducted, 
          `Speed violation: ${violation.speed} km/h in ${violation.speedLimit} km/h zone`
        );
        
        violation.meritPointsApplied = true;
        await violation.save();
      }

      // Update driver's violation history
      driver.totalViolations += 1;
      driver.confirmedViolations.push(violation._id);
      driver.lastViolationDate = violation.timestamp;
      
      // Update driver's risk profile if risk score is available
      if (violation.riskScore) {
        await driver.updateRiskProfile(violation.riskScore);
      }
      
      await driver.save();

      console.log(`✅ Violation confirmed: ${violationId} → Driver: ${drivingLicenseId}`);
      console.log(`📊 Merit points deducted: ${violation.meritPointsDeducted}`);
      console.log(`🎯 Driver merit points: ${driver.meritPoints} (Status: ${driver.status})`);

      return {
        success: true,
        message: 'Driver confirmed successfully',
        violation: violation,
        driver: {
          licenseId: driver.drivingLicenseId,
          name: driver.fullName,
          meritPoints: driver.meritPoints,
          status: driver.status,
          riskLevel: driver.riskLevel
        },
        officer: {
          id: officer._id,
          policeId: officer.policeId,
          username: officer.username
        },
        meritPointsDeducted: violation.meritPointsDeducted
      };

    } catch (error) {
      console.error('❌ Error confirming driver:', error.message);
      throw error;
    }
  }

  /**
   * Dispute a violation
   * @param {string} violationId - Violation ID
   * @param {string} reason - Dispute reason
   * @param {string} officerId - Police officer handling dispute
   * @returns {Object} Dispute result
   */
  async disputeViolation(violationId, reason, officerId) {
    try {
      const violation = await Violation.findById(violationId);
      if (!violation) {
        throw new Error('Violation not found');
      }

      violation.status = 'disputed';
      violation.disputeReason = reason;
      violation.disputeDate = new Date();
      violation.confirmedBy = officerId;
      
      await violation.save();

      console.log(`⚠️ Violation disputed: ${violationId} - Reason: ${reason}`);

      return {
        success: true,
        message: 'Violation disputed successfully',
        violation: violation
      };

    } catch (error) {
      console.error('❌ Error disputing violation:', error.message);
      throw error;
    }
  }

  /**
   * Cancel a violation
   * @param {string} violationId - Violation ID
   * @param {string} reason - Cancellation reason
   * @param {string} officerId - Police officer ID
   * @returns {Object} Cancellation result
   */
  async cancelViolation(violationId, reason, officerId) {
    try {
      const violation = await Violation.findById(violationId);
      if (!violation) {
        throw new Error('Violation not found');
      }

      // If driver was already confirmed, restore merit points
      if (violation.driverConfirmed && violation.meritPointsApplied) {
        const driver = await Driver.findByLicenseId(violation.drivingLicenseId);
        if (driver) {
          await driver.addMeritPoints(
            violation.meritPointsDeducted,
            `Violation cancelled: ${reason}`
          );
          console.log(`🔄 Merit points restored: ${violation.meritPointsDeducted} to ${driver.drivingLicenseId}`);
        }
      }

      violation.status = 'cancelled';
      violation.disputeReason = reason;
      violation.confirmedBy = officerId;
      
      await violation.save();

      return {
        success: true,
        message: 'Violation cancelled successfully',
        violation: violation
      };

    } catch (error) {
      console.error('❌ Error cancelling violation:', error.message);
      throw error;
    }
  }

  /**
   * Get violation statistics for police dashboard
   * @param {string} officerId - Police officer ID (optional)
   * @returns {Object} Statistics
   */
  async getViolationStats(officerId = null) {
    try {
      const matchStage = officerId ? { confirmedBy: officerId } : {};
      
      const stats = await Violation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalFines: { $sum: '$finalFine' },
            avgRiskScore: { $avg: '$riskScore' }
          }
        }
      ]);

      const pendingCount = await Violation.countDocuments({ 
        driverConfirmed: false, 
        status: 'pending' 
      });

      const highRiskPending = await Violation.countDocuments({
        driverConfirmed: false,
        status: 'pending',
        riskLevel: 'high'
      });

      return {
        byStatus: stats,
        pendingConfirmations: pendingCount,
        highRiskPending: highRiskPending,
        totalProcessed: stats.reduce((sum, stat) => sum + stat.count, 0)
      };

    } catch (error) {
      console.error('❌ Error getting violation stats:', error.message);
      throw error;
    }
  }

  /**
   * Search drivers by license ID or name
   * @param {string} searchTerm - Search term
   * @returns {Array} Matching drivers
   */
  async searchDrivers(searchTerm) {
    try {
      const drivers = await Driver.find({
        $or: [
          { drivingLicenseId: { $regex: searchTerm, $options: 'i' } },
          { fullName: { $regex: searchTerm, $options: 'i' } }
        ]
      }).limit(10);

      return drivers.map(driver => ({
        licenseId: driver.drivingLicenseId,
        name: driver.fullName,
        meritPoints: driver.meritPoints,
        status: driver.status,
        riskLevel: driver.riskLevel,
        totalViolations: driver.totalViolations
      }));

    } catch (error) {
      console.error('❌ Error searching drivers:', error.message);
      throw error;
    }
  }
}

module.exports = new PoliceConfirmationService();