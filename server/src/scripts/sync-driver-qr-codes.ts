import 'dotenv/config';
import mongoose from 'mongoose';
import * as QRCode from 'qrcode';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iitd-db';
const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173'; // OAE website URL

async function syncDriverQRCodes() {
  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  // Find all drivers
  const drivers = await usersCollection.find({ role: 'driver' }).toArray();

  console.log(`\n📊 Found ${drivers.length} driver(s) in database`);

  if (drivers.length === 0) {
    console.log('✅ No drivers to sync!');
    await mongoose.disconnect();
    return;
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const driver of drivers) {
    try {
      console.log(`\n📝 Processing: ${driver.name} (${driver.email})`);

      // Check if QR code needs update (either doesn't exist or is old JSON format)
      const needsUpdate = !driver.qrCode || !driver.qrCode.includes('verify-driver');
      
      if (!needsUpdate) {
        console.log(`  ⏭️  Already has valid QR code`);
        skipped++;
        continue;
      }

      // Generate verification URL
      const verificationUrl = `${BASE_URL}/verify-driver/${driver._id.toString()}?name=${encodeURIComponent(driver.name)}&email=${encodeURIComponent(driver.email)}`;
      
      console.log(`  🔗 URL: ${verificationUrl}`);

      // Generate QR code as base64 data URL
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Update driver with new QR code
      await usersCollection.updateOne(
        { _id: driver._id },
        { 
          $set: { 
            qrCode: qrCodeDataUrl,
            updatedAt: new Date()
          } 
        }
      );

      console.log(`  ✅ QR code synced successfully`);
      updated++;
    } catch (error) {
      console.error(`  ❌ Failed to sync QR code:`, error);
      failed++;
    }
  }

  await mongoose.disconnect();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Database Sync Complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Summary:`);
  console.log(`   ✅ Updated:  ${updated}`);
  console.log(`   ⏭️  Skipped:  ${skipped}`);
  console.log(`   ❌ Failed:   ${failed}`);
  console.log(`   📱 Total:    ${drivers.length}`);
  console.log(`${'='.repeat(60)}\n`);
}

syncDriverQRCodes().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

