import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DataManagementService } from './data-management.service';
import { User } from '../schemas/user.schema';
import { RideLocation } from '../schemas/ride-location.schema';
import { RideBill } from '../schemas/ride-bill.schema';
import * as fs from 'fs';

// Don't mock fs at module level - we'll spy on it in individual tests

// Mock path module
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
}));

describe('DataManagementService', () => {
  let service: DataManagementService;
  let mockUserModel: any;
  let mockRideLocationModel: any;
  let mockRideBillModel: any;

  beforeEach(async () => {
    // Create a query object that supports .lean() and .select()
    const createQueryMock = (data: any[] = []) => ({
      lean: vi.fn().mockResolvedValue(data),
      select: vi.fn().mockReturnThis(),
    });

    mockUserModel = {
      countDocuments: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockReturnValue(createQueryMock([])),
      aggregate: vi.fn().mockResolvedValue([]),
    };

    mockRideLocationModel = {
      countDocuments: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockReturnValue(createQueryMock([])),
      aggregate: vi.fn().mockResolvedValue([]),
    };

    mockRideBillModel = {
      countDocuments: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockReturnValue(createQueryMock([])),
      aggregate: vi.fn().mockResolvedValue([]),
    };

    const mockEmailService = {
      sendBackupNotification: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataManagementService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(RideLocation.name),
          useValue: mockRideLocationModel,
        },
        {
          provide: getModelToken(RideBill.name),
          useValue: mockRideBillModel,
        },
        {
          provide: 'EmailService',
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<DataManagementService>(DataManagementService);
    // Mock sendBackupNotifications to avoid stderr messages
    vi.spyOn(service as any, 'sendBackupNotifications').mockResolvedValue(undefined);

    service = module.get<DataManagementService>(DataManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDataStats', () => {
    it('should return comprehensive data statistics', async () => {
      mockUserModel.countDocuments.mockResolvedValue(25);
      mockRideLocationModel.countDocuments.mockResolvedValue(150);
      mockRideBillModel.countDocuments.mockResolvedValue(75);

      const result = await service.getDataStats();

      expect(result).toEqual({
        users: 25,
        rideLocations: 150,
        rideBills: 75,
        totalRecords: 250,
        lastUpdated: expect.any(String),
      });

      expect(mockUserModel.countDocuments).toHaveBeenCalled();
      expect(mockRideLocationModel.countDocuments).toHaveBeenCalled();
      expect(mockRideBillModel.countDocuments).toHaveBeenCalled();
    });
  });

  describe('createBackup', () => {
    beforeEach(() => {
      // Mock fs and path
      vi.mock('fs', () => ({
        promises: {
          writeFile: vi.fn(),
          mkdir: vi.fn(),
        },
        existsSync: vi.fn(),
      }));

      vi.mock('path', () => ({
        join: vi.fn((...args) => args.join('/')),
      }));

      // Mock models data
      mockUserModel.find.mockResolvedValue([
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
      ]);

      mockRideLocationModel.find.mockResolvedValue([
        { location: 'Location 1' },
        { location: 'Location 2' },
      ]);

      mockRideBillModel.find.mockResolvedValue([
        { amount: 100 },
        { amount: 200 },
      ]);
    });

    it('should create a complete backup', async () => {
      // Mock fs methods by replacing them
      (fs as any).existsSync = vi.fn().mockReturnValue(false);
      (fs as any).mkdirSync = vi.fn().mockImplementation(() => {});
      (fs as any).writeFileSync = vi.fn().mockImplementation(() => {});

      // Override the mocks for this test
      mockUserModel.find = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });
      mockRideLocationModel.find = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });
      mockRideBillModel.find = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });

      const result = await service.createBackup();

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json/);
      expect(result.stats).toHaveProperty('users');
      expect(result.stats).toHaveProperty('rideLocations');
      expect(result.stats).toHaveProperty('rideBills');
      expect(result.message).toBe('Backup created successfully');
    });

    it('should handle backup creation errors', async () => {
      // Mock fs methods by replacing them
      (fs as any).existsSync = vi.fn().mockReturnValue(false);
      (fs as any).mkdirSync = vi.fn().mockImplementation(() => {});
      (fs as any).writeFileSync = vi.fn().mockImplementation(() => {
        throw new Error('Write failed');
      });

      // Set up all model mocks for the error test
      mockUserModel.find = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
        select: vi.fn().mockReturnThis(),
      });
      mockRideLocationModel.find = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });
      mockRideBillModel.find = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });

      await expect(service.createBackup()).rejects.toThrow('Backup creation failed: Write failed');
    });
  });

  describe('getBackupHistory', () => {
    it('should return backup history', async () => {
      const mockBackups = [
        { filename: 'backup1.json', createdAt: new Date() },
        { filename: 'backup2.json', createdAt: new Date() },
      ];

      // Mock fs operations for backup directory
      vi.mock('fs', () => ({
        promises: {
          readdir: vi.fn().mockResolvedValue(['backup1.json', 'backup2.json']),
          stat: vi.fn().mockResolvedValue({ mtime: new Date() }),
        },
        existsSync: vi.fn(),
      }));

      const result = await service.getBackupHistory();

      expect(result.backups).toBeDefined();
      expect(result.count).toBeDefined();
    });
  });

  describe('exportAllData', () => {
    it('should export all data', async () => {
      const mockUsers = [
        { name: 'User 1', email: 'user1@example.com', password: 'hashed' },
      ];
      const mockRideLocations = [
        { fromLocation: 'A', toLocation: 'B', fare: 100 },
      ];
      const mockRideBills = [
        { rideId: 'ride1', studentId: 'student1', fare: 100 },
      ];

      // Override the mocks for this test
      mockUserModel.find = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockUsers),
      });
      mockRideLocationModel.find = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockRideLocations),
      });
      mockRideBillModel.find = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockRideBills),
      });

      const result = await service.exportAllData();

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('users');
      expect(result.data).toHaveProperty('rideLocations');
      expect(result.data).toHaveProperty('rideBills');
      expect(result).toHaveProperty('exportDate');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('stats');
      // Check that passwords are set to undefined (removed for security)
      expect(result.data.users[0].password).toBeUndefined();
    });
  });

  describe('clearCache', () => {
    it('should clear cache files successfully', async () => {
      // Mock fs operations - directories don't exist, so no files to clear
      const fs = await import('fs');
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = await service.clearCache();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Cache cleared successfully');
      expect(result.details).toContain('No cache files found to clear');
    });

    it('should handle cache clearing errors', async () => {
      // Mock fs methods by replacing them
      (fs as any).existsSync = vi.fn().mockReturnValue(true);
      (fs as any).readdirSync = vi.fn().mockImplementation(() => {
        throw new Error('Read failed');
      });

      await expect(service.clearCache()).rejects.toThrow('Cache clearing failed: Read failed');
    });
  });

  describe('getBackupSettings', () => {
    it('should return default backup settings', async () => {
      // Mock getBackupHistory method to avoid fs operations
      const mockHistory = { backups: [], count: 0 };
      service.getBackupHistory = vi.fn().mockResolvedValue(mockHistory);

      const settings = await service.getBackupSettings();

      expect(settings).toHaveProperty('enabled', true);
      expect(settings).toHaveProperty('interval', 24);
      expect(settings).toHaveProperty('maxBackups', 30);
      expect(settings).toHaveProperty('emailNotifications', true);
      expect(settings).toHaveProperty('lastBackup', null);
      expect(settings).toHaveProperty('totalBackups', 0);
    });
  });

  describe('updateBackupSettings', () => {
    it('should update backup settings', async () => {
      const newSettings = {
        enabled: false,
        interval: 12,
        maxBackups: 20,
        emailNotifications: false,
      };

      const result = await service.updateBackupSettings(newSettings);

      expect(result.success).toBe(true);
      expect(result.settings).toHaveProperty('enabled', false);
      expect(result.settings).toHaveProperty('interval', 12);
      expect(result.settings).toHaveProperty('maxBackups', 20);
      expect(result.settings).toHaveProperty('emailNotifications', false);
      expect(result.settings).toHaveProperty('lastUpdated');
      expect(result.settings).toHaveProperty('nextBackup', null); // disabled, so null
    });

    it('should validate settings', async () => {
      const invalidSettings = {
        enabled: true,
        interval: -1, // Invalid
        maxBackups: 10,
      };

      await expect(service.updateBackupSettings(invalidSettings as any))
        .rejects.toThrow('Failed to update backup settings: Backup interval must be between 1 and 168 hours');
    });
  });
});
