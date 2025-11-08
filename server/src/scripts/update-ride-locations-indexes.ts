import 'dotenv/config';
import mongoose from 'mongoose';
import { RideLocationSchema } from '../schemas/ride-location.schema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iitd-db';

async function updateRideLocationsIndexes() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  const collectionName = 'ridelocations'; // Mongoose converts RideLocation to ridelocations

  console.log(`Working with collection: ${collectionName}`);

  // Get the collection
  const collection = db.collection(collectionName);

  // Check if collection exists and get current indexes
  const existingIndexes = await collection.indexes();
  console.log('\nExisting indexes:');
  existingIndexes.forEach((index: any) => {
    console.log(`  - ${index.name}:`, JSON.stringify(index.key));
  });

  // Create the model to ensure schema is registered
  const RideLocationModel = mongoose.model('RideLocation', RideLocationSchema, collectionName);

  // Create/update indexes using Mongoose
  console.log('\nCreating/updating indexes...');
  
  try {
    // Ensure all indexes from schema are created
    await RideLocationModel.createIndexes();
    console.log('✓ Indexes created/updated successfully');
  } catch (error: any) {
    console.error('Error creating indexes:', error.message);
    
    // If there's a duplicate key error, we need to handle it
    if (error.code === 11000 || error.message.includes('duplicate key')) {
      console.log('\n⚠ Found duplicate entries. Checking for duplicates...');
      
      // Find duplicate routes
      const duplicates = await collection.aggregate([
        {
          $group: {
            _id: { fromLocation: '$fromLocation', toLocation: '$toLocation' },
            count: { $sum: 1 },
            ids: { $push: '$_id' }
          }
        },
        {
          $match: { count: { $gt: 1 } }
        }
      ]).toArray();

      if (duplicates.length > 0) {
        console.log(`\nFound ${duplicates.length} duplicate route(s):`);
        duplicates.forEach((dup: any) => {
          console.log(`  - ${dup._id.fromLocation} → ${dup._id.toLocation} (${dup.count} entries)`);
        });
        console.log('\n⚠ Please manually remove duplicates before creating unique index.');
        console.log('   You can keep the most recent entry and delete the others.');
      }
    }
  }

  // Verify indexes after creation
  const finalIndexes = await collection.indexes();
  console.log('\nFinal indexes:');
  finalIndexes.forEach((index: any) => {
    const isUnique = index.unique ? ' (UNIQUE)' : '';
    console.log(`  ✓ ${index.name}:`, JSON.stringify(index.key) + isUnique);
  });

  // Get collection stats
  const documentCount = await collection.countDocuments();
  console.log(`\nCollection stats:`);
  console.log(`  - Total documents: ${documentCount}`);
  console.log(`  - Total indexes: ${finalIndexes.length}`);

  await mongoose.disconnect();
  console.log('\n✓ MongoDB update complete!');
}

async function run() {
  try {
    await updateRideLocationsIndexes();
    process.exit(0);
  } catch (error) {
    console.error('Error updating MongoDB:', error);
    process.exit(1);
  }
}

run();

