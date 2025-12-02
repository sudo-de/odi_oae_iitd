import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RideBillDocument = RideBill & Document;

@Schema({ timestamps: true })
export class RideBill {
  @Prop({ type: String, required: true })
  rideId: string;

  @Prop({ type: String, required: true })
  studentId: string;

  @Prop({ type: String, required: true })
  studentName: string;

  @Prop({ type: String })
  studentEntryNumber?: string;

  @Prop({ type: String, required: true })
  driverId: string;

  @Prop({ type: String, required: true })
  driverName: string;

  @Prop({ type: String, required: true })
  location: string;

  @Prop({
    type: Number,
    required: true,
    min: 0,
    max: 10000
  })
  fare: number;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  })
  time: string;

  @Prop({
    type: String,
    required: true,
    default: 'completed',
    enum: ['completed', 'cancelled', 'pending']
  })
  status: string;

  @Prop({ type: String })
  notes?: string;
}

export const RideBillSchema = SchemaFactory.createForClass(RideBill);

// Create indexes for better query performance
RideBillSchema.index({ rideId: 1 }, { unique: true });
RideBillSchema.index({ studentId: 1 });
RideBillSchema.index({ driverId: 1 });
RideBillSchema.index({ date: -1 });
RideBillSchema.index({ status: 1 });
RideBillSchema.index({ createdAt: -1 });
RideBillSchema.index({ fare: -1 });

// Create compound indexes for common queries
RideBillSchema.index({ driverId: 1, date: -1 });
RideBillSchema.index({ studentId: 1, date: -1 });
RideBillSchema.index({ status: 1, date: -1 });
RideBillSchema.index({ driverId: 1, status: 1 });
RideBillSchema.index({ date: -1, createdAt: -1 });

// Text index for search functionality
RideBillSchema.index({
  studentName: 'text',
  driverName: 'text',
  location: 'text'
});

// Transform function for JSON responses
RideBillSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_: unknown, ret: Record<string, any>) => {
    ret.id = ret._id?.toString?.() ?? ret._id;
    delete ret._id;
    return ret;
  },
});
