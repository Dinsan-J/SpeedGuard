require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");

async function checkIdenticalViolations() {
  try {
    console.log("🔍 Checking for identical violations with different risk levels...");
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get violations with speed 85 km/h (the user mentioned first 2 violations are same)
    const violations85 = await Violation.find({ speed: 85 }).sort({ timestamp: -1 });
    
    console.log(`📊 Found ${violations85.length} violations with 85 km/h speed`);
    
    // Group by speed and show risk levels
    const speedGroups = {};
    
    const allViolations = await Violation.find({}).sort({ timestamp: -1 }).limit(20);
    
    allViolations.forEach((v) => {
      if (!speedGroups[v.speed]) {
        speedGroups[v.speed] = [];
      }
      speedGroups[v.speed].push({
        id: v._id.toString().slice(-6),
        riskLevel: v.riskLevel,
        riskScore: v.riskScore,
        timestamp: v.timestamp,
        sensitiveZone: v.sensitiveZone?.isInZone || false,
        zoneType: v.sensitiveZone?.zoneType || 'none'
      });
    });
    
    console.log("\n📊 Violations grouped by speed:");
    Object.entries(speedGroups).forEach(([speed, violations]) => {
      if (violations.length > 1) {
        console.log(`\n🚗 Speed: ${speed} km/h (${violations.length} violations)`);
        violations.forEach((v, index) => {
          console.log(`  ${index + 1}. ID: ${v.id} | Risk: ${v.riskLevel} | Score: ${v.riskScore} | Zone: ${v.sensitiveZone ? v.zoneType : 'normal'} | Time: ${v.timestamp.toLocaleString()}`);
        });
        
        // Check if risk levels are different for same speed
        const uniqueRiskLevels = [...new Set(violations.map(v => v.riskLevel))];
        if (uniqueRiskLevels.length > 1) {
          console.log(`  ⚠️  INCONSISTENT: Same speed (${speed} km/h) has different risk levels: ${uniqueRiskLevels.join(', ')}`);
        }
      }
    });

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkIdenticalViolations();