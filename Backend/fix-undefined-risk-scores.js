require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");

async function fixUndefinedRiskScores() {
  try {
    console.log("🔧 Fixing violations with undefined risk scores...");
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find violations with undefined risk scores
    const violations = await Violation.find({
      $or: [
        { riskScore: { $exists: false } },
        { riskScore: null },
        { riskScore: undefined }
      ]
    });

    console.log(`📊 Found ${violations.length} violations with undefined risk scores`);

    let fixedCount = 0;
    for (const violation of violations) {
      // Calculate risk score based on speed violation and zone
      const speedOverLimit = violation.speed - (violation.appliedSpeedLimit || 70);
      const speedViolationFactor = Math.min(1.0, Math.max(0, speedOverLimit) / 50); // 0-1 scale
      
      // Zone factor
      const zoneFactor = violation.sensitiveZone?.isInZone ? 0.3 : 0.1;
      
      // Time factor (simplified)
      const timeFactor = 0.2;
      
      // Calculate risk score
      const riskScore = (speedViolationFactor * 0.4) + (zoneFactor * 0.3) + (timeFactor * 0.3);
      
      // Determine risk level
      let riskLevel = 'medium';
      if (riskScore >= 0.6) {
        riskLevel = 'high';
      } else if (riskScore >= 0.3) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }
      
      // Update the violation
      await Violation.updateOne(
        { _id: violation._id },
        { 
          $set: { 
            riskScore: Math.round(riskScore * 1000) / 1000, // Round to 3 decimal places
            riskLevel: riskLevel
          } 
        }
      );
      
      console.log(`✅ Fixed violation ${violation._id.toString().slice(-6)}: Speed ${violation.speed} km/h → Risk: ${riskLevel} (${(riskScore * 100).toFixed(1)}%)`);
      fixedCount++;
    }

    console.log(`🎉 Fixed ${fixedCount} violations with undefined risk scores`);
    
    // Verify the fix by checking for remaining undefined scores
    const remainingUndefined = await Violation.countDocuments({
      $or: [
        { riskScore: { $exists: false } },
        { riskScore: null },
        { riskScore: undefined }
      ]
    });
    
    console.log(`📊 Remaining violations with undefined risk scores: ${remainingUndefined}`);
    
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error fixing risk scores:", error.message);
    process.exit(1);
  }
}

fixUndefinedRiskScores();