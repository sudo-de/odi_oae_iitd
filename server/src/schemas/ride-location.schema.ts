import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class RideLocation {
  @Prop({ type: String, required: true, index: true })
  fromLocation: string;

  @Prop({ type: String, required: true, index: true })
  toLocation: string;

  @Prop({ type: Number, required: true, min: 0 })
  fare: number;
}

export const RideLocationSchema = SchemaFactory.createForClass(RideLocation);

// Create compound unique index to prevent duplicate routes
RideLocationSchema.index({ fromLocation: 1, toLocation: 1 }, { unique: true });

// Create index on fare for faster queries
RideLocationSchema.index({ fare: 1 });

// Create index on createdAt for faster sorting
RideLocationSchema.index({ createdAt: -1 });

RideLocationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_: unknown, ret: Record<string, unknown>) => {
    ret.id = ret._id?.toString?.() ?? ret._id;
    delete ret._id;
    return ret;
  },
});

