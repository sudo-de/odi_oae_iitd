import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Mock fs module - define mock function inside factory to avoid hoisting issues
vi.mock('fs', () => {
  const mockReadFileSync = vi.fn();
  return {
    default: {
      readFileSync: mockReadFileSync,
    },
    readFileSync: mockReadFileSync,
    // Export the mock function so we can access it in tests
    __mockReadFileSync: mockReadFileSync,
  };
});

// Get the mocked fs module
import * as fs from 'fs';

describe('AppController (unit)', () => {
  let appController: AppController;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let mockReadFileSync: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const appService = {} as AppService;
    appController = new AppController(appService);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Get the mock function from fs module
    mockReadFileSync = fs.readFileSync as ReturnType<typeof vi.fn>;
    
    // Import actual fs to get the real implementation
    const actualFs = await vi.importActual<typeof import('fs')>('fs');
    // Set default mock to use real implementation
    mockReadFileSync.mockImplementation(actualFs.readFileSync);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (mockReadFileSync) {
      mockReadFileSync.mockClear();
    }
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      const result = appController.getApiInfo();
      expect(result).toHaveProperty('name', 'IITD API');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('endpoints');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('getAppInfo', () => {
    it('should return application information', () => {
      const result = appController.getAppInfo();
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('build');
    });

    it('should handle error when reading package.json', () => {
      // Mock fs.readFileSync to throw an error
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = appController.getAppInfo();

      expect(mockReadFileSync).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Could not read package.json:', expect.any(Error));
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('build');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });

  describe('handleUnmatchedApiRoutes', () => {
    it('should return 404 error response', () => {
      const result = appController.handleUnmatchedApiRoutes();
      expect(result).toEqual({
        message: 'API endpoint not found',
        error: 'Not Found',
        statusCode: 404
      });
    });
  });
});
