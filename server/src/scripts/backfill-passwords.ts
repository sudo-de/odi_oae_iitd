import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'ChangeMeNow123!';
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iitd-db';

const passwordFilter = {
  $or: [
    { password: { $exists: false } },
    { password: null },
    { password: '' }
  ]
};

async function backfillPasswords() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  const collection = mongoose.connection.collection('users');

  const usersNeedingUpdate = await collection.countDocuments(passwordFilter);
  if (usersNeedingUpdate === 0) {
    console.log('All users already have passwords. No updates needed.');
    return;
  }

  console.log(`Found ${usersNeedingUpdate} user(s) without a password. Hashing default password...`);
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const updateResult = await collection.updateMany(passwordFilter, {
    $set: { password: hashedPassword },
    $unset: { resetPasswordToken: '', resetPasswordExpires: '' }
  });

  console.log(`Updated ${updateResult.modifiedCount} user(s) with the new password.`);
  if (!process.env.DEFAULT_USER_PASSWORD) {
    console.warn('Warning: DEFAULT_USER_PASSWORD was not set. Used fallback password `ChangeMeNow123!`.');
  }
  console.log('Backfill complete. Please communicate the new password to affected users and instruct them to change it.');
}

async function run() {
  try {
    await backfillPasswords();
    process.exitCode = 0;
  } catch (error) {
    console.error('Error while backfilling passwords:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();