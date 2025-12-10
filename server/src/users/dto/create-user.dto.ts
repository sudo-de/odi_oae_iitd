import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean, Allow } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  role?: string;
  
  // Common fields for all user types
  @IsOptional()
  @Allow()
  phone?: {
    countryCode: string;
    number: string;
  };

  @IsOptional()
  @Allow()
  profilePhoto?: {
    filename: string;
    mimetype: string;
    size: number;
    data: Buffer;
  };
  
  // Student-specific fields
  @IsOptional()
  @IsString()
  entryNumber?: string;

  @IsOptional()
  @IsString()
  programme?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Allow()
  hostel?: {
    name: string;
    roomNo: string;
  };

  @IsOptional()
  @Allow()
  emergencyDetails?: {
    name: string;
    address: string;
    phone: string;
    additionalPhone?: string;
  };

  @IsOptional()
  @IsString()
  disabilityType?: string;

  @IsOptional()
  @IsString()
  udidNumber?: string;

  @IsOptional()
  @IsNumber()
  disabilityPercentage?: number;

  @IsOptional()
  @Allow()
  disabilityDocument?: {
    filename: string;
    mimetype: string;
    size: number;
    data: Buffer;
  };

  @IsOptional()
  @Allow()
  expiryDate?: Date;

  @IsOptional()
  @IsBoolean()
  isExpired?: boolean;
  
  // Driver-specific fields
  @IsOptional()
  @IsString()
  qrCode?: string;
}
