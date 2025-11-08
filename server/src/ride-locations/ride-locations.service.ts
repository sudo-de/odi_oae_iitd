import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RideLocation } from '../schemas/ride-location.schema';
import { CreateRideLocationDto } from './dto/create-ride-location.dto';
import { UpdateRideLocationDto } from './dto/update-ride-location.dto';

@Injectable()
export class RideLocationsService {
  constructor(
    @InjectModel(RideLocation.name)
    private readonly rideLocationModel: Model<RideLocation>,
  ) {}

  private ensureValidId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Ride location not found');
    }
  }

  async create(createRideLocationDto: CreateRideLocationDto) {
    try {
      console.log('Service: Creating ride location with data:', JSON.stringify(createRideLocationDto, null, 2));
      const created = new this.rideLocationModel(createRideLocationDto);
      const saved = await created.save();
      console.log('Service: Successfully saved ride location:', saved);
      return saved;
    } catch (error: any) {
      console.error('Service: Error creating ride location:', error);
      console.error('Service: Error code:', error.code);
      console.error('Service: Error message:', error.message);
      console.error('Service: Error name:', error.name);
      
      if (error.code === 11000) {
        throw new BadRequestException('A ride location with this route already exists');
      }
      
      // Handle validation errors from Mongoose
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors || {}).map((err: any) => err.message);
        throw new BadRequestException(messages.join(', ') || 'Validation failed');
      }
      
      throw new BadRequestException(error.message || 'Failed to create ride location');
    }
  }

  async findAll() {
    return this.rideLocationModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    this.ensureValidId(id);
    const location = await this.rideLocationModel.findById(id).exec();

    if (!location) {
      throw new NotFoundException('Ride location not found');
    }

    return location;
  }

  async update(id: string, updateRideLocationDto: UpdateRideLocationDto) {
    this.ensureValidId(id);
    
    try {
      const updated = await this.rideLocationModel
        .findByIdAndUpdate(id, updateRideLocationDto, { new: true, runValidators: true })
        .exec();

      if (!updated) {
        throw new NotFoundException('Ride location not found');
      }

      return updated;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('A ride location with this route already exists');
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to update ride location');
    }
  }

  async remove(id: string) {
    this.ensureValidId(id);
    const deleted = await this.rideLocationModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException('Ride location not found');
    }

    return deleted;
  }
}

