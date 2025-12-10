import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { BulkWriteResult } from 'mongodb';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import * as QRCode from 'qrcode';
import { Observable } from 'rxjs';
import { ChangeStream, ChangeStreamDocument } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  watchUsers(): Observable<UserChangeEvent> {
    return new Observable(observer => {
      this.findAll()
        .then(users => observer.next({ type: 'snapshot', payload: users }))
        .catch(error => observer.error(error));

      let changeStream: ChangeStream<UserDocument> | undefined;
      try {
        changeStream = this.userModel.watch([], { fullDocument: 'updateLookup' });
      } catch (error) {
        observer.error(error);
        return;
      }

      changeStream.on('change', async (change: ChangeStreamDocument<UserDocument>) => {
        try {
          const event = await this.mapChangeToEvent(change);
          if (event) {
            observer.next(event);
          }
        } catch (err) {
          observer.error(err);
        }
      });

      changeStream.on('error', (err: unknown) => observer.error(err));

      return () => {
        if (changeStream) {
          changeStream.close().catch(() => undefined);
        }
      };
    });
  }

  // Helper method to transform user data: convert Buffer to base64 for file data
  protected transformUserForResponse(user: UserDocument | User): User {
    const userObj = (user as UserDocument).toObject ? (user as UserDocument).toObject() : user as User;
    
    // Convert profilePhoto Buffer to base64
    if (userObj.profilePhoto && userObj.profilePhoto.data) {
      userObj.profilePhoto = {
        ...userObj.profilePhoto,
        data: userObj.profilePhoto.data.toString('base64')
      };
    }
    
    // Convert disabilityDocument Buffer to base64
    if (userObj.disabilityDocument && userObj.disabilityDocument.data) {
      userObj.disabilityDocument = {
        ...userObj.disabilityDocument,
        data: userObj.disabilityDocument.data.toString('base64')
      };
    }
    
    return userObj;
  }

  // Helper method to transform array of users
  private transformUsersForResponse(users: UserDocument[]): User[] {
    return users.map(user => this.transformUserForResponse(user));
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (!createUserDto.password || !createUserDto.password.trim()) {
      throw new BadRequestException('Password is required');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Use MongoDB's insertOne operation
    const userData: Partial<CreateUserDto> & { password: string } = {
      ...createUserDto,
      password: hashedPassword,
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
    
    const createdUser = await new this.userModel(userData).save();
    
    // Auto-generate QR code for drivers
    if (createdUser.role === 'driver') {
      console.log('[UsersService] Auto-generating QR code for driver:', createdUser._id);
      try {
        await this.generateQRCodeForDriver(createdUser._id.toString());
        console.log('[UsersService] QR code generated successfully');
        // Fetch updated user with QR code
        const updatedUser = await this.userModel.findById(createdUser._id).exec();
        return this.transformUserForResponse(updatedUser);
      } catch (qrError) {
        console.error('[UsersService] Failed to generate QR code:', qrError);
        // Return user even if QR generation fails
        return this.transformUserForResponse(createdUser);
      }
    }
    
    return this.transformUserForResponse(createdUser);
  }

  async createWithFiles(createUserDto: CreateUserDto, files: Express.Multer.File[]): Promise<User> {
    try {
      // Debug: Log what we received
      console.log('=== CREATE USER DEBUG ===');
      console.log('Received DTO keys:', Object.keys(createUserDto));
      console.log('Password value:', createUserDto.password ? `"${createUserDto.password.substring(0, 3)}..." (length: ${createUserDto.password.length})` : 'UNDEFINED/NULL');
      console.log('Full DTO:', JSON.stringify(createUserDto, null, 2));
      console.log('=========================');
      
      if (!createUserDto.password || !createUserDto.password.trim()) {
        throw new BadRequestException('Password is required');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      // Process uploaded files and parse JSON fields
      const userData: Record<string, unknown> & { password: string } = {
        ...createUserDto,
        password: hashedPassword,
      };

      // Parse JSON fields if they are strings (skip if already objects)
      try {
        if (userData.phone) {
          if (typeof userData.phone === 'string' && userData.phone.trim().startsWith('{')) {
            userData.phone = JSON.parse(userData.phone);
          }
          // If already an object, keep it as is
        }
        if (userData.hostel) {
          if (typeof userData.hostel === 'string' && userData.hostel.trim().startsWith('{')) {
            userData.hostel = JSON.parse(userData.hostel);
          }
          // If already an object, keep it as is
        }
        if (userData.emergencyDetails) {
          if (typeof userData.emergencyDetails === 'string' && userData.emergencyDetails.trim().startsWith('{')) {
            userData.emergencyDetails = JSON.parse(userData.emergencyDetails);
          }
          // If already an object, keep it as is
        }
        
        // Convert string numbers to actual numbers
        if (userData.disabilityPercentage && typeof userData.disabilityPercentage === 'string') {
          userData.disabilityPercentage = parseInt(userData.disabilityPercentage);
        }
        if (userData.age && typeof userData.age === 'string') {
          userData.age = parseInt(userData.age);
        }
        
        // Convert string dates to Date objects (only if valid)
        if (userData.expiryDate) {
          if (typeof userData.expiryDate === 'string' && userData.expiryDate.trim()) {
            const parsedDate = new Date(userData.expiryDate);
            if (!isNaN(parsedDate.getTime())) {
              userData.expiryDate = parsedDate;
            } else {
              delete userData.expiryDate; // Remove invalid date
            }
          } else {
            delete userData.expiryDate; // Remove empty/null date
          }
        }
        
        // Clean up empty fields for non-student roles
        if (userData.role !== 'student') {
          delete userData.entryNumber;
          delete userData.programme;
          delete userData.department;
          delete userData.hostel;
          delete userData.emergencyDetails;
          delete userData.disabilityType;
          delete userData.udidNumber;
          delete userData.disabilityPercentage;
          delete userData.expiryDate;
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
      const createdUser = await new this.userModel(userData).save();
      
      // Auto-generate QR code for drivers
      if (createdUser.role === 'driver') {
        console.log('[UsersService] Auto-generating QR code for driver:', createdUser._id);
        try {
          await this.generateQRCodeForDriver(createdUser._id.toString());
          console.log('[UsersService] QR code generated successfully');
          // Fetch updated user with QR code
          const updatedUser = await this.userModel.findById(createdUser._id).exec();
          return this.transformUserForResponse(updatedUser);
        } catch (qrError) {
          console.error('[UsersService] Failed to generate QR code:', qrError);
          // Return user even if QR generation fails
          return this.transformUserForResponse(createdUser);
        }
      }
      
      return this.transformUserForResponse(createdUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findAll(page?: number, limit?: number): Promise<User[]> {
    // First, update expiry status for all students
    await this.updateExpiryStatus();

    let query = this.userModel.find();

    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.sort({ createdAt: -1 }).skip(skip).limit(limit);
    }

    const users = await query.exec();
    return this.transformUsersForResponse(users);
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
    const user = await this.userModel.findById(id).exec();
    return user ? this.transformUserForResponse(user) : null;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.transformUserForResponse(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Use MongoDB's findOneAndUpdate operation
    const user = await this.userModel.findByIdAndUpdate(
      id, 
      { $set: updateUserDto }, 
      { new: true, runValidators: true }
    ).exec();
    return user ? this.transformUserForResponse(user) : null;
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    return user ? this.transformUserForResponse(user) : null;
  }

  // Additional MongoDB update operations
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    ).exec();
    return user ? this.transformUserForResponse(user) : null;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    ).exec();
    return user ? this.transformUserForResponse(user) : null;
  }

  async bulkUpdateUsers(updates: Array<{ id: string; data: Partial<CreateUserDto> }>): Promise<BulkWriteResult> {
    const bulkOps = updates.map(update => {
      if (!Types.ObjectId.isValid(update.id)) {
        throw new BadRequestException(`Invalid user id: ${update.id}`);
      }
      return {
        updateOne: {
          filter: { _id: new Types.ObjectId(update.id) },
          update: { $set: update.data }
        }
      };
    });
    
    return this.userModel.bulkWrite(bulkOps);
  }

  async getUserStats(): Promise<Array<{ _id: string; count: number; activeCount: number }>> {
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

  // Generate QR code for a driver
  async generateQRCodeForDriver(driverId: string): Promise<string> {
    const driver = await this.userModel.findById(driverId).exec();
    if (!driver || driver.role !== 'driver') {
      throw new Error('Driver not found');
    }

    // Generate verification URL that can be scanned
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5173'; // OAE website URL
    const verificationUrl = `${baseUrl}/verify-driver/${driver._id.toString()}?name=${encodeURIComponent(driver.name)}&email=${encodeURIComponent(driver.email)}`;

    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Update driver with QR code (store the data URL)
    await this.userModel.findByIdAndUpdate(
      driverId,
      { $set: { qrCode: qrCodeDataUrl } },
      { new: true }
    ).exec();

    return qrCodeDataUrl;
  }

  // Generate QR codes for all drivers without QR codes
  async generateQRCodesForAllDrivers(): Promise<{ success: number; failed: number }> {
    const drivers = await this.userModel.find({ 
      role: 'driver',
      $or: [
        { qrCode: { $exists: false } },
        { qrCode: null },
        { qrCode: '' }
      ]
    }).exec();

    let success = 0;
    let failed = 0;

    for (const driver of drivers) {
      try {
        await this.generateQRCodeForDriver(driver._id.toString());
        success++;
      } catch (error) {
        console.error(`Failed to generate QR code for driver ${driver._id}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  private async mapChangeToEvent(change: ChangeStreamDocument<UserDocument>): Promise<UserChangeEvent | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentKey = 'documentKey' in change ? (change as any).documentKey : undefined;
    const rawId = documentKey?._id;
    const idValue = rawId && typeof rawId.toString === 'function' ? rawId.toString() : rawId;

    switch (change.operationType) {
      case 'insert':
      case 'replace':
      case 'update': {
        let document: User | null = null;
        if (change.fullDocument) {
          document = this.transformUserForResponse(change.fullDocument);
        } else if (idValue) {
          const fetched = await this.userModel.findById(idValue).exec();
          if (fetched) {
            document = this.transformUserForResponse(fetched);
          }
        }

        if (!document) {
          return null;
        }

        const eventType: UserChangeEvent['type'] = change.operationType === 'insert' ? 'created' : 'updated';

        return {
          type: eventType,
          payload: document,
        };
      }
      case 'delete':
        if (!idValue) {
          return null;
        }
        return {
          type: 'deleted',
          payload: { _id: String(idValue) },
        };
      default:
        return null;
    }
  }
}

export interface UserChangeEvent {
  type: 'snapshot' | 'created' | 'updated' | 'deleted';
  payload: User[] | User | { _id: string };
}
