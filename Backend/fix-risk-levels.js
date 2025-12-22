require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");

/**
 * Fix inconsistent risk levels in existing violations
 */
async function fixRiskLevels() {
  try {
    console.log("🔧 Fixing inconsistent risk levels in violations...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find violations with invalid risk levels
    const violations = await Violation.find({
      riskLevel: { $nin: ['low', 'medium', 'high'] }
    });

    console.log(`📊 Found ${violations.length} violations with invalid risk levels`);

    let fixedCount = 0;
    for (const violation of violations) {
      const oldRiskLevel = violation.riskLevel;
      
      // Determine correct risk level based on risk score
      let newRiskLevel = 'medium'; // default
      
      if (violation.riskScore >= 0.6) {
        newRiskLevel = 'high';
      } else if (violation.riskScore >= 0.3) {
        newRiskLevel = 'medium';
      } else {
        newRiskLevel = 'low';
      }
      
      // Update the violation (skip validation for existing records)
      await Violation.updateOne(
        { _id: violation._id },
        { $set: { riskLevel: newRiskLevel } }
      );
      
      console.log(`✅ Fixed violation ${violation._id}: "${oldRiskLevel}" → "${newRiskLevel}"`);
      fixedCount++;
    }

    console.log(`🎉 Fixed ${fixedCount} violations with invalid risk levels`);
    
    // Verify the fix
    const remainingInvalid = await Violation.countDocuments({
      riskLevel: { $nin: ['low', 'medium', 'high'] }
    });
    
    console.log(`📊 Remaining violations with invalid risk levels: ${remainingInvalid}`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error fixing risk levels:", error.message);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixRiskLevels();
}

module.exports = fixRiskLevels;