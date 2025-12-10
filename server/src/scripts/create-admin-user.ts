import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserSchema } from '../schemas/user.schema';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sudo.sde@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iitd-db';
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

async function createAdminUser() {
  console.log('🔐 Creating admin user...');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);
  console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
  console.log('');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin user already exists
    const UserModel = mongoose.model('User', UserSchema);
    const existingAdmin = await UserModel.findOne({ email: ADMIN_EMAIL.toLowerCase() }).exec();

    if (existingAdmin) {
      console.log(`⚠️  Admin user with email ${ADMIN_EMAIL} already exists.`);
      console.log('   Skipping creation. If you want to reset the password, use the backfill-passwords script.');
      return;
    }

    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new UserModel({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!\n');

    console.log('📋 Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    console.log('   You can do this via the Settings page in the web dashboard.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

async function run() {
  try {
    await createAdminUser();
    process.exitCode = 0;
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exitCode = 1;
  }
}

run();

