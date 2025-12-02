import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { RideLocation } from '../schemas/ride-location.schema';
import { RideBill, RideBillDocument } from '../schemas/ride-bill.schema';
import { EmailService } from '../services/email.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataManagementService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RideLocation.name) private rideLocationModel: Model<RideLocation>,
    @InjectModel(RideBill.name) private rideBillModel: Model<RideBillDocument>,
    private emailService: EmailService,
  ) {}

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');

      // Ensure backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Export all data
      const [users, rideLocations, rideBills] = await Promise.all([
        this.userModel.find().lean(),
        this.rideLocationModel.find().lean(),
        this.rideBillModel.find().lean(),
      ]);

      const backupData = {
        timestamp: new Date().toISOString(),
        collections: {
          users: users.length,
          rideLocations: rideLocations.length,
          rideBills: rideBills.length,
        },
        data: {
          users,
          rideLocations,
          rideBills,
        },
      };

      const filename = `backup-${timestamp}.json`;
      const filepath = path.join(backupDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

      // Send email notifications to users who have notifications enabled
      await this.sendBackupNotifications(backupData.collections, filename);

      return {
        success: true,
        message: 'Backup created successfully',
        filename,
        filepath,
        stats: backupData.collections,
      };
    } catch (error) {
      throw new Error(`Backup creation failed: ${error.message}`);
    }
  }

  private async sendBackupNotifications(collections: any, filename: string): Promise<void> {
    try {
      // Check if email notifications are enabled for backups
      const settings = await this.getBackupSettings();

      if (!settings.emailNotifications) {
        console.log('Backup email notifications are disabled');
        return;
      }

      // Find all active admin users to notify about backups
      const adminUsers = await this.userModel.find({
        role: 'admin',
        isActive: true
      }).select('email name');

      console.log(`Sending backup notifications to ${adminUsers.length} admin users`);

      const backupInfo = {
        collections,
        filename,
        timestamp: new Date().toISOString()
      };

      // Send notifications to admin users
      const emailPromises = adminUsers.map(async (user) => {
        try {
          await this.emailService.sendBackupNotification(user.email, user.name, backupInfo);
          console.log(`Backup notification sent to ${user.email}`);
        } catch (error) {
          console.error(`Failed to send backup notification to ${user.email}:`, error);
        }
      });

      await Promise.allSettled(emailPromises);
    } catch (error) {
      console.error('Error sending backup notifications:', error);
      // Don't throw error - backup was successful, notification failure shouldn't fail the backup
    }
  }

  async exportAllData() {
    try {
      const [users, rideLocations, rideBills] = await Promise.all([
        this.userModel.find().lean(),
        this.rideLocationModel.find().lean(),
        this.rideBillModel.find().lean(),
      ]);

      // Transform data for export (remove sensitive fields)
      const exportUsers = users.map(user => ({
        ...user,
        password: undefined, // Remove password
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
        resetPasswordOtp: undefined,
        resetPasswordOtpExpires: undefined,
      }));

      return {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: {
          users: exportUsers,
          rideLocations,
          rideBills,
        },
        stats: {
          users: users.length,
          rideLocations: rideLocations.length,
          rideBills: rideBills.length,
        },
      };
    } catch (error) {
      throw new Error(`Data export failed: ${error.message}`);
    }
  }

  async clearCache() {
    try {
      // For now, this is a placeholder for cache clearing
      // In a real application, this might clear Redis cache, file cache, etc.

      // Clear any temporary files or cached data
      const tempDir = path.join(process.cwd(), 'temp');
      const cacheDir = path.join(process.cwd(), 'cache');

      const results = [];

      // Clear temp directory if it exists
      if (fs.existsSync(tempDir)) {
        const tempFiles = fs.readdirSync(tempDir);
        tempFiles.forEach(file => {
          try {
            fs.unlinkSync(path.join(tempDir, file));
          } catch (err) {
            // Ignore individual file errors
          }
        });
        results.push(`Cleared ${tempFiles.length} temporary files`);
      }

      // Clear cache directory if it exists
      if (fs.existsSync(cacheDir)) {
        const cacheFiles = fs.readdirSync(cacheDir);
        cacheFiles.forEach(file => {
          try {
            fs.unlinkSync(path.join(cacheDir, file));
          } catch (err) {
            // Ignore individual file errors
          }
        });
        results.push(`Cleared ${cacheFiles.length} cache files`);
      }

      return {
        success: true,
        message: 'Cache cleared successfully',
        details: results.length > 0 ? results : ['No cache files found to clear'],
      };
    } catch (error) {
      throw new Error(`Cache clearing failed: ${error.message}`);
    }
  }

  async getDataStats() {
    try {
      const [userCount, rideLocationCount, rideBillCount] = await Promise.all([
        this.userModel.countDocuments(),
        this.rideLocationModel.countDocuments(),
        this.rideBillModel.countDocuments(),
      ]);

      // Get collection sizes (approximate)
      const stats = {
        users: userCount,
        rideLocations: rideLocationCount,
        rideBills: rideBillCount,
        totalRecords: userCount + rideLocationCount + rideBillCount,
        lastUpdated: new Date().toISOString(),
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get data stats: ${error.message}`);
    }
  }

  async getBackupSettings() {
    try {
      // Get backup history to determine last backup time
      const history = await this.getBackupHistory();
      const lastBackup = history.backups.length > 0
        ? history.backups[0].createdAt // Most recent backup
        : null;

      // For now, return default settings. In a real app, you'd store this in DB
      const enabled = true;
      const interval = 24; // hours
      const emailNotifications = true; // Enable email notifications for backups by default

      return {
        enabled,
        interval,
        maxBackups: 30,
        emailNotifications,
        lastBackup,
        nextBackup: enabled && lastBackup
          ? new Date(new Date(lastBackup).getTime() + interval * 60 * 60 * 1000).toISOString()
          : enabled
            ? new Date(Date.now() + interval * 60 * 60 * 1000).toISOString()
            : null,
        totalBackups: history.count,
      };
    } catch (error) {
      throw new Error(`Failed to get backup settings: ${error.message}`);
    }
  }

  async updateBackupSettings(settings: { enabled: boolean; interval: number; maxBackups: number; emailNotifications?: boolean }) {
    try {
      // Validate settings
      if (settings.interval < 1 || settings.interval > 168) { // 1 hour to 1 week
        throw new Error('Backup interval must be between 1 and 168 hours');
      }
      if (settings.maxBackups < 1 || settings.maxBackups > 100) {
        throw new Error('Max backups must be between 1 and 100');
      }

      // In a real app, save to database
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
        nextBackup: settings.enabled
          ? new Date(Date.now() + settings.interval * 60 * 60 * 1000).toISOString()
          : null,
      };

      return {
        success: true,
        message: 'Backup settings updated successfully',
        settings: updatedSettings,
      };
    } catch (error) {
      throw new Error(`Failed to update backup settings: ${error.message}`);
    }
  }

  async scheduleBackup() {
    try {
      // Perform immediate backup
      const backupResult = await this.createBackup();

      // Update last backup time
      const settings = await this.getBackupSettings();
      settings.lastBackup = new Date().toISOString();

      return {
        success: true,
        message: 'Backup completed successfully',
        backup: backupResult,
        nextScheduled: settings.nextBackup,
      };
    } catch (error) {
      throw new Error(`Failed to schedule backup: ${error.message}`);
    }
  }

  async getBackupHistory() {
    try {
      const backupDir = path.join(process.cwd(), 'backups');

      if (!fs.existsSync(backupDir)) {
        return { backups: [], count: 0 };
      }

      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

          return {
            filename: file,
            createdAt: stats.birthtime.toISOString(),
            size: stats.size,
            collections: content.collections,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10); // Return last 10 backups

      return {
        backups: files,
        count: files.length,
        totalSize: files.reduce((sum, backup) => sum + backup.size, 0),
      };
    } catch (error) {
      throw new Error(`Failed to get backup history: ${error.message}`);
    }
  }

  async deleteBackup(filename: string) {
    try {
      // Validate filename to prevent directory traversal
      if (!filename || typeof filename !== 'string') {
        throw new Error('Invalid filename');
      }

      // Ensure it's a backup file
      if (!filename.endsWith('.json') || !filename.startsWith('backup-')) {
        throw new Error('Invalid backup file');
      }

      const backupDir = path.join(process.cwd(), 'backups');
      const filePath = path.join(backupDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('Backup file not found');
      }

      // Get file stats before deletion
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Delete the file
      fs.unlinkSync(filePath);

      return {
        success: true,
        message: 'Backup deleted successfully',
        filename,
        size: fileSize,
      };
    } catch (error) {
      throw new Error(`Failed to delete backup: ${error.message}`);
    }
  }

  async clearAllBackups() {
    try {
      const backupDir = path.join(process.cwd(), 'backups');

      if (!fs.existsSync(backupDir)) {
        return {
          success: true,
          message: 'No backup directory found',
          deletedCount: 0,
          totalSize: 0,
        };
      }

      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.json') && file.startsWith('backup-'));

      let deletedCount = 0;
      let totalSize = 0;

      // Delete all backup files
      for (const file of files) {
        try {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          fs.unlinkSync(filePath);
          deletedCount++;
        } catch (error) {
          // Continue with other files if one fails
          console.error(`Failed to delete ${file}:`, error);
        }
      }

      return {
        success: true,
        message: `Cleared ${deletedCount} backup files`,
        deletedCount,
        totalSize,
      };
    } catch (error) {
      throw new Error(`Failed to clear backups: ${error.message}`);
    }
  }

  async importData(fileBuffer: Buffer) {
    try {
      // Parse the uploaded JSON file
      const importData = JSON.parse(fileBuffer.toString());

      // Validate the import data structure
      if (!importData.data || !importData.exportDate) {
        throw new Error('Invalid import file format');
      }

      const results = {
        users: { imported: 0, skipped: 0, errors: 0 },
        rideLocations: { imported: 0, skipped: 0, errors: 0 },
        rideBills: { imported: 0, skipped: 0, errors: 0 },
      };

      // Import users
      if (importData.data.users && Array.isArray(importData.data.users)) {
        for (const user of importData.data.users) {
          try {
            // Check if user already exists
            const existingUser = await this.userModel.findOne({ email: user.email });

            if (existingUser) {
              results.users.skipped++;
              continue;
            }

            // Remove _id to let MongoDB generate new one
            const { _id, ...userData } = user;

            // Hash password if it exists (though imported data should have passwords removed)
            if (userData.password) {
              // Note: In a real scenario, you'd want to handle password hashing properly
              // For now, we'll skip password import for security
              delete userData.password;
            }

            await this.userModel.create(userData);
            results.users.imported++;
          } catch (error) {
            console.error('Error importing user:', error);
            results.users.errors++;
          }
        }
      }

      // Import ride locations
      if (importData.data.rideLocations && Array.isArray(importData.data.rideLocations)) {
        for (const location of importData.data.rideLocations) {
          try {
            // Check if location already exists (by from/to combination)
            const existingLocation = await this.rideLocationModel.findOne({
              fromLocation: location.fromLocation,
              toLocation: location.toLocation,
            });

            if (existingLocation) {
              results.rideLocations.skipped++;
              continue;
            }

            // Remove _id to let MongoDB generate new one
            const { _id, ...locationData } = location;
            await this.rideLocationModel.create(locationData);
            results.rideLocations.imported++;
          } catch (error) {
            console.error('Error importing ride location:', error);
            results.rideLocations.errors++;
          }
        }
      }

      // Import ride bills
      if (importData.data.rideBills && Array.isArray(importData.data.rideBills)) {
        for (const bill of importData.data.rideBills) {
          try {
            // Check if bill already exists (by rideId)
            const existingBill = await this.rideBillModel.findOne({ rideId: bill.rideId });

            if (existingBill) {
              results.rideBills.skipped++;
              continue;
            }

            // Remove _id to let MongoDB generate new one
            const { _id, ...billData } = bill;
            await this.rideBillModel.create(billData);
            results.rideBills.imported++;
          } catch (error) {
            console.error('Error importing ride bill:', error);
            results.rideBills.errors++;
          }
        }
      }

      const totalImported = results.users.imported + results.rideLocations.imported + results.rideBills.imported;
      const totalSkipped = results.users.skipped + results.rideLocations.skipped + results.rideBills.skipped;
      const totalErrors = results.users.errors + results.rideLocations.errors + results.rideBills.errors;

      return {
        success: true,
        message: `Import completed. ${totalImported} records imported, ${totalSkipped} skipped, ${totalErrors} errors.`,
        results,
        importDate: new Date().toISOString(),
        sourceFile: importData.exportDate,
      };
    } catch (error) {
      throw new Error(`Failed to import data: ${error.message}`);
    }
  }
}
