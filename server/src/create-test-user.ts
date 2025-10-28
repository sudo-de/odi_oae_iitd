import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';

async function createTestUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  try {
    // Create a test user with your credentials
    const testUser = await authService.createUser({
      name: 'Admin User',
      email: 'sudo.sde@gmail.com',
      password: 'admin123',
      role: 'admin',
      age: 30,
    });

    console.log('Test user created successfully:');
    console.log('Email: sudo.sde@gmail.com');
    console.log('Password: admin123');
    console.log('Role: admin');
  } catch (error) {
    console.log('User might already exist or error occurred:', error.message);
  }

  await app.close();
}

createTestUser();
