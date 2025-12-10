import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  })
  email: string;

  @Prop({ type: String, required: true, minlength: 6 })
  password: string;

  @Prop({ type: Number, min: 0, max: 120 })
  age?: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String })
  resetPasswordToken?: string;

  @Prop({ type: Date })
  resetPasswordExpires?: Date;

  @Prop({ type: String })
  resetPasswordOtp?: string;

  @Prop({ type: Date })
  resetPasswordOtpExpires?: Date;

  @Prop({
    type: String,
    default: 'user',
    enum: ['admin', 'staff', 'student', 'driver'],
    required: true
  })
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
  @Prop({ type: String })
  entryNumber?: string;

  @Prop({ type: String })
  programme?: string;

  @Prop({ type: String })
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

  @Prop({ type: String })
  disabilityType?: string;

  @Prop({ type: String })
  udidNumber?: string;

  @Prop({ type: Number })
  disabilityPercentage?: number;

  @Prop({ type: Object })
  disabilityDocument?: {
    filename: string;
    mimetype: string;
    size: number;
    data: Buffer;
  };

  @Prop({ type: Date })
  expiryDate?: Date;

  @Prop({ type: Boolean, default: false })
  isExpired?: boolean;

  // Driver-specific fields
  @Prop({ type: String })
  qrCode?: string;

}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indexes for better query performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ 'phone.number': 1 });
UserSchema.index({ entryNumber: 1 });
UserSchema.index({ programme: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ 'hostel.name': 1 });
UserSchema.index({ disabilityType: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ updatedAt: -1 });

// Create compound indexes for common queries
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ role: 1, programme: 1 });
UserSchema.index({ role: 1, department: 1 });

// Transform function for JSON responses
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_: unknown, ret: Record<string, unknown>) => {
    ret.id = ret._id?.toString?.() ?? ret._id;
    delete ret._id;
    return ret;
  },
});
