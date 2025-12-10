import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RideLocationsModule } from './ride-locations/ride-locations.module';
import { RideBillsModule } from './ride-bills/ride-bills.module';
import { DataManagementModule } from './data-management/data-management.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
          throw new Error(
            'MONGODB_URI environment variable is required. ' +
            'Please set it in your .env file or as an environment variable. ' +
            'Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database'
          );
        }
        return {
          uri: mongoUri,
        };
      },
    }),
    UsersModule,
    AuthModule,
    RideLocationsModule,
    RideBillsModule,
    DataManagementModule,
    EmailModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist'),
      exclude: ['/api/', '/auth/', '/users/', '/ride-locations/', '/ride-bills/', '/data-management/', '/public/'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
