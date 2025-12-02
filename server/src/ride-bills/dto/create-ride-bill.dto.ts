import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateRideBillDto {
  @IsNotEmpty()
  @IsString()
  rideId: string;

  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNotEmpty()
  @IsString()
  studentName: string;

  @IsOptional()
  @IsString()
  studentEntryNumber?: string;

  @IsNotEmpty()
  @IsString()
  driverId: string;

  @IsNotEmpty()
  @IsString()
  driverName: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsNumber()
  fare: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsOptional()
  @IsIn(['completed', 'cancelled', 'pending'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
