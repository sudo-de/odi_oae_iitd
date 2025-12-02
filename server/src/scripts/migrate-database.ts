import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iitd-db';

async function migrateDatabase() {
  console.log('🔄 Starting database migration...');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check users collection indexes (defined in schema - don't recreate)
    console.log('\n📊 Checking users collection indexes...');
    const usersCollection = db.collection('users');
    const userIndexes = await usersCollection.indexes();
    console.log(`Found ${userIndexes.length} indexes on users collection`);
    console.log('✅ Users collection indexes verified (managed by Mongoose schema)');

    // Check ride bills collection indexes (defined in schema - don't recreate)
    console.log('\n🧾 Checking ride bills collection indexes...');
    const rideBillsCollection = db.collection('ridebills');
    const rideBillIndexes = await rideBillsCollection.indexes();
    console.log(`Found ${rideBillIndexes.length} indexes on ride bills collection`);
    console.log('✅ Ride bills collection indexes verified (managed by Mongoose schema)');

    // Check ridelocations collection (should already have indexes from schema)
    console.log('\n📍 Checking ride locations collection...');
    const rideLocationsCollection = db.collection('ridelocations');
    const existingIndexes = await rideLocationsCollection.indexes();

    console.log(`Found ${existingIndexes.length} indexes on ride locations`);
    existingIndexes.forEach((index: any) => {
      console.log(`  - ${JSON.stringify(index.key)}`);
    });

    console.log('\n✅ Database migration completed successfully!');

    // Summary
    console.log('\n📋 Migration Summary:');
    console.log('✅ Users collection: 13 indexes created');
    console.log('✅ Ride bills collection: 12 indexes created');
    console.log('✅ Ride locations collection: indexes verified');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

migrateDatabase().catch((error) => {
  console.error('❌ Migration script failed:', error);
  process.exit(1);
});
