import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController (unit)', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: vi.fn(),
            login: vi.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockRequest = { user: mockUser };

      const result = authController.getProfile(mockRequest);
      expect(result).toBe(mockUser);
    });
  });

  describe('getDevices', () => {
    it('should return device information', async () => {
      const mockUser = { id: '1' };
      const mockRequest = {
        user: mockUser,
        headers: { 'user-agent': 'Test Browser' },
        ip: '127.0.0.1',
      };

      const result = await authController.getDevices(mockRequest);
      expect(result).toHaveProperty('devices');
      expect(Array.isArray(result.devices)).toBe(true);
    });
  });
});
