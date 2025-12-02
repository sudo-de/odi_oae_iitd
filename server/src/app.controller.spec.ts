import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController (unit)', () => {
  let appController: AppController;

  beforeEach(async () => {
    const appService = { getHello: () => 'Hello World!' };
    appController = new AppController(appService as AppService);
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
  });
});
