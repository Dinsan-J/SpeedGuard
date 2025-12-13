require("dotenv").config();
const mongoose = require("mongoose");
const SensitiveLocation = require("./models/SensitiveLocation");

/**
 * Update all sensitive locations to use 500m radius
 */
async function updateRadiusTo500m() {
  try {
    console.log("🔄 Updating all sensitive locations to 500m radius...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get current statistics
    const beforeStats = await SensitiveLocation.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgRadius: { $avg: '$radius' },
          minRadius: { $min: '$radius' },
          maxRadius: { $max: '$radius' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log("\n📊 Current radius distribution:");
    beforeStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} locations, avg: ${Math.round(stat.avgRadius)}m, range: ${stat.minRadius}-${stat.maxRadius}m`);
    });

    // Update all locations to 500m radius
    const updateResult = await SensitiveLocation.updateMany(
      {}, // Update all documents
      { 
        $set: { 
          radius: 500,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`\n✅ Updated ${updateResult.modifiedCount} sensitive locations to 500m radius`);

    // Get updated statistics
    const afterStats = await SensitiveLocation.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgRadius: { $avg: '$radius' },
          minRadius: { $min: '$radius' },
          maxRadius: { $max: '$radius' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log("\n📊 Updated radius distribution:");
    afterStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} locations, radius: ${stat.avgRadius}m`);
    });

    // Test a few locations to verify the update
    console.log("\n🧪 Testing updated locations:");
    const sampleLocations = await SensitiveLocation.find({}).limit(5);
    
    sampleLocations.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.name} (${loc.type}): ${loc.radius}m radius`);
    });

    const totalCount = await SensitiveLocation.countDocuments();
    console.log(`\n🎉 Successfully updated all ${totalCount} sensitive locations to 500m radius!`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error updating radius:", error.message);
    console.error(error.stack);
    
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
  updateRadiusTo500m();
}

module.exports = updateRadiusTo500m;