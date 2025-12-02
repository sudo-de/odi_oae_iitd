import { PartialType } from '@nestjs/mapped-types';
import { CreateRideBillDto } from './create-ride-bill.dto';

export class UpdateRideBillDto extends PartialType(CreateRideBillDto) {}
