import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'fs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash password only if provided
    let hashedPassword = '';
    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }
    
    // Use MongoDB's insertOne operation
    const userData: any = {
      ...createUserDto,
      password: hashedPassword || undefined,
    };

    // Convert string numbers to actual numbers
    if (userData.disabilityPercentage && typeof userData.disabilityPercentage === 'string') {
      userData.disabilityPercentage = parseInt(userData.disabilityPercentage);
    }
    if (userData.age && typeof userData.age === 'string') {
      userData.age = parseInt(userData.age);
    }
    
    // Convert string dates to Date objects
    if (userData.expiryDate && typeof userData.expiryDate === 'string') {
      userData.expiryDate = new Date(userData.expiryDate);
    }
    
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async createWithFiles(createUserDto: CreateUserDto, files: Express.Multer.File[]): Promise<User> {
    try {
      // Hash password only if provided (required for Admin/Staff, optional for Student/Driver)
      let hashedPassword = '';
      if (createUserDto.password) {
        hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      }
      
      // Process uploaded files and parse JSON fields
      const userData: any = {
        ...createUserDto,
        password: hashedPassword || undefined,
      };

      // Parse JSON fields if they are strings
      try {
        if (typeof userData.phone === 'string') {
          userData.phone = JSON.parse(userData.phone);
        }
        if (typeof userData.hostel === 'string') {
          userData.hostel = JSON.parse(userData.hostel);
        }
        if (typeof userData.emergencyDetails === 'string') {
          userData.emergencyDetails = JSON.parse(userData.emergencyDetails);
        }
        
        // Convert string numbers to actual numbers
        if (userData.disabilityPercentage && typeof userData.disabilityPercentage === 'string') {
          userData.disabilityPercentage = parseInt(userData.disabilityPercentage);
        }
        if (userData.age && typeof userData.age === 'string') {
          userData.age = parseInt(userData.age);
        }
        
        // Convert string dates to Date objects
        if (userData.expiryDate && typeof userData.expiryDate === 'string') {
          userData.expiryDate = new Date(userData.expiryDate);
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error('Invalid JSON format for complex fields');
      }

      if (files && files.length > 0) {
        files.forEach((file, index) => {
          const fileData = {
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            data: readFileSync(file.path),
          };

          // Determine file type based on fieldname or order
          if (file.fieldname === 'profilePhoto' || index === 0) {
            userData.profilePhoto = fileData;
          } else if (file.fieldname === 'disabilityDocument' || index === 1) {
            userData.disabilityDocument = fileData;
          }
        });
      }
      
      console.log('Creating user with data:', JSON.stringify(userData, null, 2));
      const createdUser = new this.userModel(userData);
      return createdUser.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    // First, update expiry status for all students
    await this.updateExpiryStatus();
    return this.userModel.find().exec();
  }

  async updateExpiryStatus(): Promise<void> {
    const now = new Date();
    
    // Mark students as expired if their expiry date has passed
    await this.userModel.updateMany(
      {
        role: 'student',
        expiryDate: { $lt: now },
        isExpired: { $ne: true }
      },
      {
        $set: { isExpired: true }
      }
    );

    // Mark students as not expired if their expiry date is in the future
    await this.userModel.updateMany(
      {
        role: 'student',
        expiryDate: { $gte: now },
        isExpired: true
      },
      {
        $set: { isExpired: false }
      }
    );
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Use MongoDB's findOneAndUpdate operation
    return this.userModel.findByIdAndUpdate(
      id, 
      { $set: updateUserDto }, 
      { new: true, runValidators: true }
    ).exec();
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  // Additional MongoDB update operations
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    ).exec();
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    ).exec();
  }

  async bulkUpdateUsers(updates: Array<{ id: string; data: Partial<CreateUserDto> }>): Promise<any> {
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: update.data }
      }
    }));
    
    return this.userModel.bulkWrite(bulkOps);
  }

  async getUserStats(): Promise<any> {
    return this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]).exec();
  }
}
