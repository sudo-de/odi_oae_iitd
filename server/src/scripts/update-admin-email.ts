import 'dotenv/config';
import mongoose from 'mongoose';
import { UserSchema } from '../schemas/user.schema';

const OLD_ADMIN_EMAIL = 'admin@iitd.ac.in';
const NEW_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sudo.sde@gmail.com';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iitd-db';

async function updateAdminEmail() {
  console.log('🔄 Updating admin email...');
  console.log(`   From: ${OLD_ADMIN_EMAIL}`);
  console.log(`   To: ${NEW_ADMIN_EMAIL}`);
  console.log('');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const UserModel = mongoose.model('User', UserSchema);

    // Check if old admin exists
    const oldAdmin = await UserModel.findOne({ email: OLD_ADMIN_EMAIL.toLowerCase() }).exec();
    
    if (!oldAdmin) {
      console.log(`⚠️  Admin user with email ${OLD_ADMIN_EMAIL} not found.`);
      console.log('   Nothing to update.');
      return;
    }

    // Check if new admin already exists
    const newAdmin = await UserModel.findOne({ email: NEW_ADMIN_EMAIL.toLowerCase() }).exec();
    
    if (newAdmin) {
      console.log(`⚠️  Admin user with email ${NEW_ADMIN_EMAIL} already exists.`);
      console.log('   Skipping update to avoid duplicate.');
      return;
    }

    // Update the email
    console.log('Updating admin email...');
    oldAdmin.email = NEW_ADMIN_EMAIL.toLowerCase();
    await oldAdmin.save();
    
    console.log('✅ Admin email updated successfully!\n');
    console.log(`📋 New login email: ${NEW_ADMIN_EMAIL}`);

  } catch (error) {
    console.error('❌ Error updating admin email:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

async function run() {
  try {
    await updateAdminEmail();
    process.exitCode = 0;
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exitCode = 1;
  }
}

run();

