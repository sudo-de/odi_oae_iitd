import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Changed to false to allow extra fields without errors
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert types
      },
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
          return Object.values(error.constraints || {}).join(', ');
        });
        return new HttpException(
          { message: messages.join('; '), errors },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );
  
  // Enable CORS for frontend communication (React + Flutter)
  app.enableCors({
    origin: true, // Allow all origins (for Flutter mobile apps) - restrict in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/iitd-db'}`);
}
bootstrap();
