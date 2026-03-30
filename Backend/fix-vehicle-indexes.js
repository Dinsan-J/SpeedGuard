const mongoose = require('mongoose');
require('dotenv').config();

async function fixVehicleIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/speedguard');
    console.log('✅ Connected to MongoDB');

    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'vehicles' }).toArray();
    
    if (collections.length === 0) {
      console.log('\n⚠️  Vehicles collection does not exist yet.');
      console.log('✅ The indexes will be created automatically when the first vehicle is added.');
      console.log('✅ The model has been updated to prevent duplicate key errors.');
      process.exit(0);
      return;
    }

    const Vehicle = mongoose.connection.collection('vehicles');

    // Get all indexes
    const indexes = await Vehicle.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: ${index.name}${index.unique ? ' (UNIQUE)' : ''}`);
    });

    // Update all vehicles to have plateNumber = vehicleNumber if plateNumber is missing
    const updateResult = await Vehicle.updateMany(
      { $or: [{ plateNumber: null }, { plateNumber: '' }, { plateNumber: { $exists: false } }] },
      [{ $set: { plateNumber: '$vehicleNumber' } }]
    );
    console.log(`\n✅ Updated ${updateResult.modifiedCount} vehicles to set plateNumber = vehicleNumber`);

    // Drop the plateNumber unique index if it exists
    try {
      await Vehicle.dropIndex('plateNumber_1');
      console.log('✅ Dropped plateNumber_1 unique index');
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠️  plateNumber_1 index does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Ensure vehicleNumber has a unique index
    try {
      await Vehicle.createIndex({ vehicleNumber: 1 }, { unique: true });
      console.log('✅ Created unique index on vehicleNumber');
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        console.log('⚠️  vehicleNumber unique index already exists');
      } else {
        throw error;
      }
    }

    // Show final indexes
    const finalIndexes = await Vehicle.indexes();
    console.log('\n📋 Final indexes:');
    finalIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: ${index.name}${index.unique ? ' (UNIQUE)' : ''}`);
    });

    console.log('\n✅ Vehicle indexes fixed successfully!');
    console.log('✅ You can now add vehicles without duplicate key errors.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing vehicle indexes:', error);
    process.exit(1);
  }
}

fixVehicleIndexes();
