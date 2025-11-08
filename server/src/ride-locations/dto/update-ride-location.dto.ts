import { PartialType } from '@nestjs/mapped-types';
import { CreateRideLocationDto } from './create-ride-location.dto';

export class UpdateRideLocationDto extends PartialType(CreateRideLocationDto) {}

