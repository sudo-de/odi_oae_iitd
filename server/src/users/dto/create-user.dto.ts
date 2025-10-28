export class CreateUserDto {
  name: string;
  email: string;
  password?: string; // Optional for Student and Driver
  age?: number;
  isActive?: boolean;
  role?: string;
  
  // Common fields for all user types
  phone?: {
    countryCode: string;
    number: string;
  };
  profilePhoto?: {
    filename: string;
    mimetype: string;
    size: number;
    data: Buffer;
  };
  
  // Student-specific fields
  entryNumber?: string;
  programme?: string;
  department?: string;
  hostel?: {
    name: string;
    roomNo: string;
  };
  emergencyDetails?: {
    name: string;
    address: string;
    phone: string;
    additionalPhone?: string;
  };
  disabilityType?: string;
  udidNumber?: string;
  disabilityPercentage?: number;
  disabilityDocument?: {
    filename: string;
    mimetype: string;
    size: number;
    data: Buffer;
  };
  expiryDate?: Date;
  isExpired?: boolean;
  
  // Driver-specific fields
  qrCode?: string;
}
