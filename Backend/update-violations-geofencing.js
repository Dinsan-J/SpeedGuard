require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");
const geofencingService = require("./services/geofencingService");

/**
 * Update existing violations with proper geofencing data
 */
async function updateViolationsGeofencing() {
  try {
    console.log("🔄 Updating existing violations with geofencing data...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get violations that need updating (speed > 0 and missing geofencing data)
    const violations = await Violation.find({
      speed: { $gt: 0 },
      $or: [
        { baseFine: { $exists: false } },
        { fine: { $exists: false } },
        { "sensitiveZone.isInZone": false }
      ]
    }).limit(20);

    console.log(`\n📊 Found ${violations.length} violations to update:\n`);

    let updatedCount = 0;

    for (const violation of violations) {
      try {
        console.log(`🔄 Processing violation ${violation._id}...`);
        console.log(`   Location: ${violation.location.lat}, ${violation.location.lng}`);
        console.log(`   Speed: ${violation.speed} km/h`);

        // Calculate geofencing data
        const analysis = await geofencingService.calculateViolationFine(
          violation.speed,
          violation.location.lat,
          violation.location.lng
        );

        if (analysis.isViolation) {
          // Update the violation with geofencing data
          const updateData = {
            speedLimit: analysis.speedLimit,
            baseFine: analysis.baseFine,
            fine: analysis.finalFine,
            zoneMultiplier: analysis.geofencing.multiplier,
            sensitiveZone: {
              isInZone: analysis.geofencing.isInZone,
              zoneType: analysis.geofencing.zoneType,
              zoneName: analysis.geofencing.zoneName,
              distanceFromZone: analysis.geofencing.distanceFromZone,
              zoneRadius: analysis.geofencing.zoneRadius
            }
          };

          await Violation.updateOne({ _id: violation._id }, updateData);

          console.log(`   ✅ Updated:`);
          console.log(`      Speed Limit: ${analysis.speedLimit} km/h`);
          console.log(`      Base Fine: LKR ${analysis.baseFine}`);
          console.log(`      Final Fine: LKR ${analysis.finalFine}`);
          console.log(`      Zone Multiplier: ${analysis.geofencing.multiplier}x`);
          
          if (analysis.geofencing.isInZone) {
            console.log(`      🚨 IN SENSITIVE ZONE: ${analysis.geofencing.zoneName} (${analysis.geofencing.zoneType})`);
            console.log(`      Distance: ${Math.round(analysis.geofencing.distanceFromZone)}m`);
          } else {
            console.log(`      ✅ Normal road`);
          }

          updatedCount++;
        } else {
          console.log(`   ⚠️ No violation (speed within limit)`);
        }

        console.log("");

      } catch (error) {
        console.error(`   ❌ Error processing violation ${violation._id}:`, error.message);
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} violations with geofencing data!`);

    // Show some updated violations
    const updatedViolations = await Violation.find({
      speed: { $gt: 0 },
      baseFine: { $exists: true },
      fine: { $exists: true }
    }).sort({ timestamp: -1 }).limit(5);

    console.log(`\n📊 Sample updated violations:`);
    updatedViolations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation._id}`);
      console.log(`   Speed: ${violation.speed} km/h (Limit: ${violation.speedLimit} km/h)`);
      console.log(`   Fine: LKR ${violation.fine} (Base: LKR ${violation.baseFine}, ${violation.zoneMultiplier}x)`);
      
      if (violation.sensitiveZone && violation.sensitiveZone.isInZone) {
        console.log(`   🚨 SENSITIVE ZONE: ${violation.sensitiveZone.zoneName} (${violation.sensitiveZone.zoneType})`);
      } else {
        console.log(`   ✅ Normal road`);
      }
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error updating violations:", error.message);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("❌ Error disconnecting:", disconnectError.message);
    }
    
    process.exit(1);
  }
}

// Run the update
if (require.main === module) {
  updateViolationsGeofencing();
}

module.exports = updateViolationsGeofencing;