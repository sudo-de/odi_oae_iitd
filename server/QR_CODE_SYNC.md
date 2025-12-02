# QR Code Auto-Sync for Drivers

## Overview
This system automatically generates and syncs QR codes for all driver accounts in the database. QR codes contain scannable URLs that work with mobile camera apps and QR scanners for driver verification.

## How It Works

### 1. Automatic Generation
When a new driver is created, a QR code is **automatically generated** containing a verification URL:
```
http://localhost:5173/public/drivers/{driverId}
```
Or with custom base URL:
```
{your-base-url}/public/drivers/{driverId}
```

### 2. Manual Sync
To update/regenerate QR codes for all existing drivers, run:

```bash
cd server
npm run sync-driver-qr
```

This script will:
- ✅ Find all drivers in the database
- ✅ Check if QR codes need updating (old format or missing)
- ✅ Generate new scannable URL-based QR codes
- ✅ Update the database with new QR codes
- ✅ Show a detailed summary with success/failure counts

### 3. Verification Page
When scanned, the QR code opens a public verification page at:
```
/public/drivers/:id
```

This page displays:
- Driver name and profile photo
- Contact information (email)
- Active/Inactive status
- Join date and role
- QR code verification timestamp

## Technical Details

### Backend
- **Public endpoint**: `GET /public/drivers/:id` (no authentication required)
- **QR generation**: `users.service.ts` - `generateQRCodeForDriver()`
- **Auto-generation**: Triggered when creating a user with `role: 'driver'`
- **Bulk sync**: `POST /users/drivers/generate-qr-codes` (admin only)

### Frontend
- **Admin Dashboard**: Driver management with QR code display
- **Public Verification**: Driver details page (no login required)
- **QR Display**: Base64 data URL rendering

### Environment Variables
Optional: Set custom base URL for QR codes:
```
APP_BASE_URL=http://localhost:5173
```
Defaults to client URL if not set.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run sync-driver-qr` | Sync all driver QR codes (manual) |
| `npm run start:dev` | Start server (auto-generates QR for new drivers) |

## Database Schema
QR codes are stored in the `users` collection:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  role: 'driver',
  qrCode: String, // Base64 data URL: data:image/png;base64,...
  qrCodeGeneratedAt: Date, // Timestamp of generation
  // ... other user fields
}
```

## API Endpoints

### Generate QR for Specific Driver
```bash
POST /users/{driverId}/generate-qr
Authorization: Bearer {token}
```

### Generate QR for All Drivers
```bash
POST /users/drivers/generate-qr-codes
Authorization: Bearer {token}
```

### Public Driver Verification
```bash
GET /public/drivers/{driverId}
# No authentication required
```

## Testing
1. **Create a driver account** through admin dashboard
2. **QR code generates automatically** on account creation
3. **View QR code** in driver details or driver management
4. **Scan with mobile phone** or QR scanner
5. **Verification page opens** showing driver information

## Troubleshooting

### QR Code Issues
- **Doesn't scan**: Run `npm run sync-driver-qr` to regenerate
- **Wrong URL**: Check `APP_BASE_URL` in `.env` file
- **Old format**: Bulk sync will update all QR codes

### Verification Page Issues
- **404 Error**: Verify driver exists and has `role: 'driver'`
- **No data shown**: Check if QR code was generated for that driver
- **Server error**: Check server logs for API endpoint issues

### Common Problems
- **Base URL mismatch**: Ensure `APP_BASE_URL` matches your deployment
- **CORS issues**: Public endpoints should work without authentication
- **Database connection**: Ensure MongoDB is running

---

**Last updated:** December 2025
**System:** IITD Transport Management System

