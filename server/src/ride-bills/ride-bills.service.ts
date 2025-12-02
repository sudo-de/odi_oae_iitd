import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RideBill, RideBillDocument } from '../schemas/ride-bill.schema';
import { CreateRideBillDto } from './dto/create-ride-bill.dto';
import { UpdateRideBillDto } from './dto/update-ride-bill.dto';

@Injectable()
export class RideBillsService {
  constructor(
    @InjectModel(RideBill.name) private rideBillModel: Model<RideBillDocument>,
  ) {}

  async create(createRideBillDto: CreateRideBillDto): Promise<RideBill> {
    const createdRideBill = new this.rideBillModel(createRideBillDto);
    return createdRideBill.save();
  }

  async findAll(): Promise<RideBill[]> {
    return this.rideBillModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<RideBill> {
    return this.rideBillModel.findById(id).exec();
  }

  async update(id: string, updateRideBillDto: UpdateRideBillDto): Promise<RideBill> {
    return this.rideBillModel.findByIdAndUpdate(id, updateRideBillDto, { new: true }).exec();
  }

  async remove(id: string): Promise<RideBill> {
    return this.rideBillModel.findByIdAndDelete(id).exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<RideBill[]> {
    return this.rideBillModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStats(): Promise<{
    totalRides: number;
    totalRevenue: number;
    averageFare: number;
    minFare: number;
    maxFare: number;
  }> {
    const rides = await this.findAll();

    if (rides.length === 0) {
      return {
        totalRides: 0,
        totalRevenue: 0,
        averageFare: 0,
        minFare: 0,
        maxFare: 0,
      };
    }

    const fares = rides.map(ride => ride.fare);
    const totalRevenue = fares.reduce((sum, fare) => sum + fare, 0);

    return {
      totalRides: rides.length,
      totalRevenue,
      averageFare: totalRevenue / rides.length,
      minFare: Math.min(...fares),
      maxFare: Math.max(...fares),
    };
  }

  // Auto-sync method to generate sample ride bills data
  async autoSyncRideBills(drivers: any[], students: any[]): Promise<void> {
    console.log('Starting auto-sync for ride bills...');

    // Clear existing data
    await this.rideBillModel.deleteMany({});

    // Generate sample ride bills
    const locations = [
      'IIT Main Gate → IIT Hospital',
      'Adhchini Gate → Himadri Hostel',
      'Jia Sarai Gate → LHC',
      'IIT Hospital → IIT Market',
      'Dogra Hall → Kailash Hostel',
      'Mehrauli Gate → Aravali Hostel',
      'Satpura Hostel → IIT Market',
      'Kumaon Hostel → Dogra Hall',
    ];

    let rideCounter = 0;
    const rideBills: CreateRideBillDto[] = [];

    // Generate ride bills for each driver
    drivers.forEach((driver) => {
      const ridesCount = Math.floor(Math.random() * 8) + 3; // 3-10 rides per driver

      for (let i = 0; i < ridesCount; i++) {
        const student = students[Math.floor(Math.random() * students.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const fare = Math.floor(Math.random() * 150) + 30; // 30-180 rupees

        // Create date properly - don't modify the original date object
        const daysAgo = Math.floor(Math.random() * 60); // Last 60 days
        const rideDate = new Date();
        rideDate.setDate(rideDate.getDate() - daysAgo);

        const hours = Math.floor(Math.random() * 10) + 8; // 8 AM to 6 PM
        const minutes = Math.floor(Math.random() * 60);
        const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        const year = rideDate.getFullYear();
        const month = (rideDate.getMonth() + 1).toString().padStart(2, '0');
        const day = rideDate.getDate().toString().padStart(2, '0');
        const sequential = (++rideCounter).toString().padStart(4, '0');
        const rideId = `${year}${month}${day}${sequential}`;

        rideBills.push({
          rideId,
          studentId: student._id.toString(),
          studentName: student.name,
          studentEntryNumber: student.entryNumber || '',
          driverId: driver._id.toString(),
          driverName: driver.name,
          location,
          fare,
          date: rideDate.toISOString().split('T')[0], // Use the rideDate, not the modified original
          time,
          status: 'completed',
        });
      }
    });

    // Insert all ride bills
    await this.rideBillModel.insertMany(rideBills);

    console.log(`✅ Auto-synced ${rideBills.length} ride bills`);
  }
}
