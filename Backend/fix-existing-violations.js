require("dotenv").config();
const mongoose = require("mongoose");
const Violation = require("./models/Violation");
const geofencingService = require("./services/geofencingService");

/**
 * Fix existing violations by recalculating geofencing data with correct radii
 */
async function fixExistingViolations() {
  try {
    console.log("🔄 Fixing existing violations with updated geofencing data...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all violations that have geofencing data but might be incorrect
    const violations = await Violation.find({
      speed: { $gt: 0 },
      "sensitiveZone.isInZone": true,
      baseFine: { $exists: true }
    }).sort({ timestamp: -1 });

    console.log(`\n📊 Found ${violations.length} violations with geofencing data to check:\n`);

    let fixedCount = 0;
    let correctCount = 0;

    for (const violation of violations) {
      try {
        console.log(`🔍 Checking violation ${violation._id}...`);
        console.log(`   Location: ${violation.location.lat}, ${violation.location.lng}`);
        console.log(`   Current: ${violation.sensitiveZone.zoneName} (${violation.sensitiveZone.zoneType})`);
        console.log(`   Distance: ${Math.round(violation.sensitiveZone.distanceFromZone)}m`);
        console.log(`   Current Fine: LKR ${violation.fine}`);

        // Recalculate geofencing with updated radii
        const newAnalysis = await geofencingService.calculateViolationFine(
          violation.speed,
          violation.location.lat,
          violation.location.lng
        );

        // Check if the geofencing result has changed
        const oldInZone = violation.sensitiveZone.isInZone;
        const newInZone = newAnalysis.geofencing.isInZone;
        const oldFine = violation.fine;
        const newFine = newAnalysis.finalFine;

        if (oldInZone !== newInZone || oldFine !== newFine) {
          // Update the violation with correct geofencing data
          const updateData = {
            speedLimit: newAnalysis.speedLimit,
            baseFine: newAnalysis.baseFine,
            fine: newAnalysis.finalFine,
            zoneMultiplier: newAnalysis.geofencing.multiplier,
            sensitiveZone: {
              isInZone: newAnalysis.geofencing.isInZone,
              zoneType: newAnalysis.geofencing.zoneType,
              zoneName: newAnalysis.geofencing.zoneName,
              distanceFromZone: newAnalysis.geofencing.distanceFromZone,
              zoneRadius: newAnalysis.geofencing.zoneRadius
            }
          };

          await Violation.updateOne({ _id: violation._id }, updateData);

          console.log(`   🔧 FIXED:`);
          console.log(`      Zone Status: ${oldInZone ? 'IN' : 'OUT'} → ${newInZone ? 'IN' : 'OUT'}`);
          console.log(`      Fine: LKR ${oldFine} → LKR ${newFine}`);
          
          if (newAnalysis.geofencing.isInZone) {
            console.log(`      New Zone: ${newAnalysis.geofencing.zoneName} (${newAnalysis.geofencing.zoneType})`);
            console.log(`      Distance: ${Math.round(newAnalysis.geofencing.distanceFromZone)}m`);
          } else {
            console.log(`      Now: Normal road`);
            if (newAnalysis.geofencing.closestZone) {
              console.log(`      Closest: ${newAnalysis.geofencing.closestZone.name} (${Math.round(newAnalysis.geofencing.closestZone.distance)}m away)`);
            }
          }

          fixedCount++;
        } else {
          console.log(`   ✅ Already correct`);
          correctCount++;
        }

        console.log("");

      } catch (error) {
        console.error(`   ❌ Error processing violation ${violation._id}:`, error.message);
      }
    }

    console.log(`\n🎉 Violation fixing completed!`);
    console.log(`   🔧 Fixed: ${fixedCount} violations`);
    console.log(`   ✅ Already correct: ${correctCount} violations`);
    console.log(`   📊 Total processed: ${violations.length} violations`);

    // Show some examples of the fixed violations
    const updatedViolations = await Violation.find({
      speed: { $gt: 0 },
      baseFine: { $exists: true }
    }).sort({ timestamp: -1 }).limit(5);

    console.log(`\n📊 Sample updated violations:`);
    updatedViolations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.vehicleId} - ${violation._id}`);
      console.log(`   Speed: ${violation.speed} km/h (Limit: ${violation.speedLimit} km/h)`);
      console.log(`   Fine: LKR ${violation.fine} (Base: LKR ${violation.baseFine}, ${violation.zoneMultiplier}x)`);
      
      if (violation.sensitiveZone && violation.sensitiveZone.isInZone) {
        console.log(`   🚨 SENSITIVE ZONE: ${violation.sensitiveZone.zoneName} (${violation.sensitiveZone.zoneType})`);
        console.log(`   📏 Distance: ${Math.round(violation.sensitiveZone.distanceFromZone)}m (Radius: ${violation.sensitiveZone.zoneRadius}m)`);
      } else {
        console.log(`   ✅ Normal road`);
      }
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error fixing violations:", error.message);
    console.error(error.stack);
    
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
  fixExistingViolations();
}

module.exports = fixExistingViolations;