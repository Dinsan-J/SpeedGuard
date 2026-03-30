const mongoose = require('mongoose');
require('dotenv').config();

async function checkDBStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/speedguard');
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Collections:');
    for (const coll of collections) {
      console.log(`  - ${coll.name}`);
      
      // Get document count
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`    Documents: ${count}`);
      
      // Get indexes
      const indexes = await mongoose.connection.db.collection(coll.name).indexes();
      console.log(`    Indexes:`);
      indexes.forEach(idx => {
        console.log(`      - ${JSON.stringify(idx.key)}: ${idx.name}${idx.unique ? ' (UNIQUE)' : ''}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDBStatus();
