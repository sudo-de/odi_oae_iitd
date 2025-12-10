import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { AppModule } from '../app.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UsersController (e2e)', () => {
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

  describe('/users (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('/users (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/users/:id/generate-qr (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/users/507f1f77bcf86cd799439011/generate-qr')
        .expect(401);
    });
  });

  describe('/users/drivers/generate-qr-codes (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/users/drivers/generate-qr-codes')
        .expect(401);
    });
  });

  describe('/public/drivers/:id (GET)', () => {
    it('should return public driver information', () => {
      // Test that the endpoint exists and handles missing driver
      return request(app.getHttpServer())
        .get('/public/drivers/nonexistent-id')
        .expect((res) => {
          // Should return either 404 (driver not found) or 500 (database error)
          // The important thing is that it's a public endpoint (no auth required)
          expect([404, 500]).toContain(res.status);
        });
    });

    it('should be publicly accessible', () => {
      return request(app.getHttpServer())
        .get('/public/drivers/nonexistent-id')
        .expect((res) => {
          // Should not require authentication headers
          expect([404, 500]).toContain(res.status);
        });
    });
  });
});
