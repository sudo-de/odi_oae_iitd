import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RideBillsService } from './ride-bills.service';
import { RideBillsController } from './ride-bills.controller';
import { RideBill, RideBillSchema } from '../schemas/ride-bill.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: RideBill.name, schema: RideBillSchema }])],
  controllers: [RideBillsController],
  providers: [RideBillsService],
  exports: [RideBillsService],
})
export class RideBillsModule {}
