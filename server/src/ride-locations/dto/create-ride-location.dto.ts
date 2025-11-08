import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRideLocationDto {
  @IsString()
  @IsNotEmpty()
  fromLocation: string;

  @IsString()
  @IsNotEmpty()
  toLocation: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fare: number;
}

