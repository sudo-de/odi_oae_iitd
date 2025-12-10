import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { describe, it, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { AppModule } from '../app.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('DataManagementController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => { throw new UnauthorizedException(); } }) // Always throw UnauthorizedException
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000); // Increase timeout for full app initialization

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/data-management/stats (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/data-management/stats')
        .expect(401);
    });
  });

  describe('/data-management/backup (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/data-management/backup')
        .expect(401);
    });
  });

  describe('/data-management/backup/history (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/data-management/backup/history')
        .expect(401);
    });
  });

  describe('/data-management/backup/settings (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/data-management/backup/settings')
        .expect(401);
    });
  });

  describe('/data-management/backup/settings (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/data-management/backup/settings')
        .send({
          enabled: true,
          interval: 24,
          maxBackups: 30,
        })
        .expect(401);
    });
  });

  describe('/data-management/export (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/data-management/export')
        .expect(401);
    });
  });

  describe('/data-management/import (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/data-management/import')
        .attach('file', Buffer.from('test data'), 'test.json')
        .expect(401);
    });
  });

  describe('/data-management/cache (DELETE)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .delete('/data-management/cache')
        .expect(401);
    });
  });
});
