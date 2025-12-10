import 'dotenv/config';
import mongoose from 'mongoose';
import { RideBillSchema } from '../schemas/ride-bill.schema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iitd-db';

async function clearRideBills() {
  console.log('🗑️  Starting ride bills data clearing...');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Initialize model
    const rideBillModel = mongoose.model('RideBill', RideBillSchema);

    // Clear all ride bills
    const deletedResult = await rideBillModel.deleteMany({});
    console.log(`✅ Cleared ${deletedResult.deletedCount} ride bills from database`);

    console.log('✅ Ride bills data cleared successfully!');

  } catch (error) {
    console.error('❌ Error during clearing:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

clearRideBills().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
