import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RideLocationsService } from './ride-locations.service';
import { RideLocationsController } from './ride-locations.controller';
import { RideLocation, RideLocationSchema } from '../schemas/ride-location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RideLocation.name, schema: RideLocationSchema },
    ]),
  ],
  controllers: [RideLocationsController],
  providers: [RideLocationsService],
  exports: [RideLocationsService],
})
export class RideLocationsModule {}

