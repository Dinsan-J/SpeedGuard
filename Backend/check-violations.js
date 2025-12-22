require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");

async function checkViolations() {
  try {
    console.log("🔍 Checking current violations in database...");
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all violations
    const violations = await Violation.find({}).limit(10).sort({ timestamp: -1 });
    
    console.log(`📊 Found ${violations.length} recent violations`);
    
    violations.forEach((v, index) => {
      console.log(`\n--- Violation ${index + 1} ---`);
      console.log(`ID: ${v._id}`);
      console.log(`Speed: ${v.speed} km/h`);
      console.log(`Risk Level: "${v.riskLevel}" (type: ${typeof v.riskLevel})`);
      console.log(`Risk Score: ${v.riskScore}`);
      console.log(`Status: ${v.status}`);
      console.log(`Timestamp: ${v.timestamp}`);
    });

    // Check for any invalid risk levels
    const invalidRiskLevels = await Violation.find({
      riskLevel: { $nin: ['low', 'medium', 'high'] }
    });
    
    console.log(`\n❌ Violations with invalid risk levels: ${invalidRiskLevels.length}`);
    
    if (invalidRiskLevels.length > 0) {
      invalidRiskLevels.forEach((v) => {
        console.log(`  - ${v._id}: "${v.riskLevel}"`);
      });
    }

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkViolations();