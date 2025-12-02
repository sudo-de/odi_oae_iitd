import { Controller, Get, All, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): object {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'MongoDB',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('api')
  getApiInfo(): object {
    return {
      name: 'IITD API',
      version: '1.0.0',
      description: 'NestJS API with MongoDB integration',
      endpoints: {
        users: '/users',
        health: '/health'
      }
    };
  }

  @Get('app/info')
  getAppInfo(): object {
    // Read version from package.json
    const packagePath = path.join(__dirname, '..', '..', 'package.json');
    let version = '1.0.0';
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      version = packageJson.version || '1.0.0';
    } catch (error) {
      console.error('Could not read package.json:', error);
    }

    const now = new Date();
    const uptime = process.uptime();

    return {
      environment: process.env.NODE_ENV || 'development',
      version: version,
      build: '2024.01', // Static build date as requested
      timestamp: now.toISOString(),
      uptime: Math.floor(uptime) + 's'
    };
  }

  // Catch-all route for unmatched API routes
  @All('api/*')
  @HttpCode(404)
  handleUnmatchedApiRoutes() {
    return {
      message: 'API endpoint not found',
      error: 'Not Found',
      statusCode: 404
    };
  }
}
