import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<{ user: any; error?: string }> {
    console.log(`[AuthService] Validating user with email: ${email}`);
    const user = await this.userModel.findOne({ email }).exec();
    
    if (!user) {
      console.log(`[AuthService] User not found with email: ${email}`);
      return { user: null, error: 'email_not_found' };
    }

    console.log(`[AuthService] User found: ${user.name}, role: ${user.role}`);
    console.log(`[AuthService] User has password: ${!!user.password}`);
    
    if (!user.password) {
      console.log(`[AuthService] User has no password set`);
      return { user: null, error: 'no_password' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`[AuthService] Password comparison result: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      const { password: _, ...result } = user.toObject();
      return { user: result };
    }
    
    return { user: null, error: 'wrong_password' };
  }

  async login(loginDto: LoginDto) {
    const { user, error } = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      if (error === 'email_not_found') {
        throw new UnauthorizedException('Email not found');
      } else if (error === 'wrong_password') {
        throw new UnauthorizedException('Wrong password');
      } else if (error === 'no_password') {
        throw new UnauthorizedException('Account not set up. Please reset your password.');
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Role-based access control based on client type
    const clientType = loginDto.clientType || 'web'; // Default to web for backward compatibility
    const userRole = user.role?.toLowerCase();

    if (clientType === 'mobile') {
      // Mobile app: Only allow Student and Driver roles
      if (userRole !== 'student' && userRole !== 'driver') {
        throw new UnauthorizedException('Access denied. Mobile app login is only available for Students and Drivers.');
      }
    } else if (clientType === 'web') {
      // Web client: Only allow Admin and Staff roles
      if (userRole !== 'admin' && userRole !== 'staff') {
        throw new UnauthorizedException('Access denied. Web login is only available for Administrators and Staff.');
      }
    }

    const payload = { email: user.email, sub: user._id, role: user.role };

    const userDetails = await this.userModel.findById(user._id).exec();
    const transformedUser = userDetails ? this.transformUser(userDetails) : user;
    return {
      access_token: this.jwtService.sign(payload),
      user: transformedUser,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: forgotPasswordDto.email }).exec();
    if (!user) {
      throw new BadRequestException('Email not found');
    }

    // Generate 6-digit OTP
    const otp = this.emailService.generateOtp();
    const otpExpires = new Date(Date.now() + 600000); // 10 minutes

    // Generate reset token for later use
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = otpExpires;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send OTP via email
    const emailSent = await this.emailService.sendOtpEmail(
      user.email,
      otp,
      user.name
    );

    if (!emailSent) {
      console.log('[AuthService] Email sending failed, returning OTP in response for development');
    }

    return {
      message: 'OTP sent to your email',
      resetToken, // For development - in production, only return after OTP verification
      otpSent: emailSent,
      // Remove in production:
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userModel.findOne({ 
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Clear OTP after verification
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return {
      message: 'OTP verified successfully',
      resetToken: user.resetPasswordToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: resetPasswordDto.token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async createUser(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    return user.save();
  }

  private transformUser(user: UserDocument | any) {
    const userObj = user.toObject ? user.toObject() : user;

    if (userObj.profilePhoto && userObj.profilePhoto.data) {
      userObj.profilePhoto = {
        ...userObj.profilePhoto,
        data: userObj.profilePhoto.data.toString('base64'),
      };
    }

    if (userObj.disabilityDocument && userObj.disabilityDocument.data) {
      userObj.disabilityDocument = {
        ...userObj.disabilityDocument,
        data: userObj.disabilityDocument.data.toString('base64'),
      };
    }

    return userObj;
  }

  async findUserById(userId: string) {
    try {
      console.log('AuthService.findUserById called with:', userId);
      const user = await this.userModel.findById(userId).exec();
      console.log('User found:', !!user);
      return user;
    } catch (error) {
      console.error('Error in findUserById:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: any) {
    try {
      console.log('AuthService.updateUser called with:', userId, updateData);
      const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
      console.log('User updated successfully:', !!updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }
}
