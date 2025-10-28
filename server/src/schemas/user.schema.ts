import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop()
  age?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ default: 'user' })
  role: string;

  // Common fields for all user types
  @Prop({ type: Object })
  phone?: {
    countryCode: string;
    number: string;
  };

  @Prop({ type: Object })
  profilePhoto?: {
    filename: string;
    mimetype: string;
    size: number;
    data: Buffer;
  };

  // Student-specific fields
  @Prop()
  entryNumber?: string;

  @Prop()
  programme?: string;

  @Prop()
  department?: string;

  @Prop({ type: Object })
  hostel?: {
    name: string;
    roomNo: string;
  };

  @Prop({ type: Object })
  emergencyDetails?: {
    name: string;
    address: string;
    phone: string;
    additionalPhone?: string;
  };

  @Prop()
  disabilityType?: string;

  @Prop()
  udidNumber?: string;

  @Prop()
  disabilityPercentage?: number;

  @Prop({ type: Object })
  disabilityDocument?: {
    filename: string;
    mimetype: string;
    size: number;
    data: Buffer;
  };

  @Prop()
  expiryDate?: Date;

  @Prop({ default: false })
  isExpired?: boolean;

  // Driver-specific fields
  @Prop()
  qrCode?: string; // Placeholder for QR code generation
}

export const UserSchema = SchemaFactory.createForClass(User);
