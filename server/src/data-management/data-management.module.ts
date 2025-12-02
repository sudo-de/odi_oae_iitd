import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { RideLocation, RideLocationSchema } from '../schemas/ride-location.schema';
import { RideBill, RideBillSchema } from '../schemas/ride-bill.schema';
import { DataManagementController } from './data-management.controller';
import { DataManagementService } from './data-management.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RideLocation.name, schema: RideLocationSchema },
      { name: RideBill.name, schema: RideBillSchema },
    ]),
    EmailModule, // Import EmailModule to access EmailService
  ],
  controllers: [DataManagementController],
  providers: [DataManagementService],
  exports: [DataManagementService],
})
export class DataManagementModule {}
