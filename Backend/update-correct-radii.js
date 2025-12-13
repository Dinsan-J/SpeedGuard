require("dotenv").config();
const mongoose = require("mongoose");
const SensitiveLocation = require("./models/SensitiveLocation");

/**
 * Update sensitive locations with correct radii:
 * - 500m for hospitals, schools, universities
 * - 1000m for towns and cities
 */
async function updateCorrectRadii() {
  try {
    console.log("🔄 Updating sensitive locations with correct radii...");
    
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

    // Update hospitals, schools, universities to 500m
    const update500m = await SensitiveLocation.updateMany(
      { type: { $in: ['hospital', 'school', 'university'] } },
      { 
        $set: { 
          radius: 500,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`\n✅ Updated ${update500m.modifiedCount} hospitals/schools/universities to 500m radius`);

    // Update towns and cities to 1000m
    const update1000m = await SensitiveLocation.updateMany(
      { type: { $in: ['town', 'city'] } },
      { 
        $set: { 
          radius: 1000,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`✅ Updated ${update1000m.modifiedCount} towns/cities to 1000m radius`);

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
    
    // Test hospital
    const hospital = await SensitiveLocation.findOne({ type: 'hospital' });
    if (hospital) {
      console.log(`   Hospital: ${hospital.name} - ${hospital.radius}m radius`);
    }
    
    // Test school
    const school = await SensitiveLocation.findOne({ type: 'school' });
    if (school) {
      console.log(`   School: ${school.name} - ${school.radius}m radius`);
    }
    
    // Test university
    const university = await SensitiveLocation.findOne({ type: 'university' });
    if (university) {
      console.log(`   University: ${university.name} - ${university.radius}m radius`);
    }
    
    // Test town
    const town = await SensitiveLocation.findOne({ type: 'town' });
    if (town) {
      console.log(`   Town: ${town.name} - ${town.radius}m radius`);
    }
    
    // Test city
    const city = await SensitiveLocation.findOne({ type: 'city' });
    if (city) {
      console.log(`   City: ${city.name} - ${city.radius}m radius`);
    }

    const totalCount = await SensitiveLocation.countDocuments();
    console.log(`\n🎉 Successfully updated all ${totalCount} sensitive locations with correct radii!`);
    console.log("📏 New radius structure:");
    console.log("   🏥 Hospitals: 500m");
    console.log("   🏫 Schools: 500m");
    console.log("   🎓 Universities: 500m");
    console.log("   🏘️ Towns: 1000m");
    console.log("   🏙️ Cities: 1000m");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error updating radii:", error.message);
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
  updateCorrectRadii();
}

module.exports = updateCorrectRadii;