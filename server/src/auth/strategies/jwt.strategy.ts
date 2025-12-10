import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../../users/users.service';
import { User, UserDocument } from '../../schemas/user.schema';

interface JwtPayload {
  email: string;
  [key: string]: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-here',
    });
  }

  async validate(payload: JwtPayload) {
    try {
      console.log('JWT Strategy validate called with payload:', JSON.stringify(payload, null, 2));

      if (!payload || !payload.email) {
        console.error('JWT payload missing email. Payload:', payload);
        throw new UnauthorizedException('JWT token missing email');
      }

      // Normalize email for lookup
      const normalizedEmail = payload.email.toLowerCase().trim();
      console.log('Looking up user with email:', normalizedEmail);
      console.log('MongoDB connection state:', this.userModel.db.readyState);
      
      // Find user directly from model to check isActive
      const userDoc = await this.userModel.findOne({ email: normalizedEmail }).exec();
      console.log('User document found:', !!userDoc);
      
      if (userDoc) {
        console.log('User details:', {
          email: userDoc.email,
          role: userDoc.role,
          isActive: userDoc.isActive,
          _id: userDoc._id?.toString()
        });
      } else {
        // Try case-insensitive search as fallback
        const caseInsensitiveUser = await this.userModel.findOne({ 
          email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
        }).exec();
        console.log('Case-insensitive search result:', !!caseInsensitiveUser);
        if (caseInsensitiveUser) {
          console.log('Found user with case-insensitive search:', caseInsensitiveUser.email);
        }
      }

      if (!userDoc) {
        console.error('User not found for email:', normalizedEmail);
        // List all users for debugging
        const allUsers = await this.userModel.find({}).select('email role').limit(5).exec();
        console.log('Sample users in database:', allUsers.map(u => ({ email: u.email, role: u.role })));
        throw new UnauthorizedException(`User not found for email: ${normalizedEmail}`);
      }
      
      if (!userDoc.isActive) {
        console.error('User account is inactive:', normalizedEmail);
        throw new UnauthorizedException('User account is inactive');
      }

      // Add id property from MongoDB _id
      const userObj = {
        ...userDoc.toObject(),
        id: userDoc._id?.toString() || (userDoc as { id?: string }).id,
      };

      console.log('✅ JWT validation successful. Returning user object with id:', userObj.id);
      return userObj;
    } catch (error) {
      console.error('❌ JWT validation error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
