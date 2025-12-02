import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('[AuthController] Login request received');
    console.log('[AuthController] Email:', loginDto?.email);
    console.log('[AuthController] Password provided:', !!loginDto?.password);
    console.log('[AuthController] LoginDto:', JSON.stringify(loginDto, null, 2));
    
    try {
      const result = await this.authService.login(loginDto);
      console.log('[AuthController] Login successful');
      return result;
    } catch (error: any) {
      console.error('[AuthController] Login error:', error.message);
      console.error('[AuthController] Error stack:', error.stack);
      throw error;
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('notifications/settings')
  async getNotificationSettings(@Request() req) {
    try {
      const userId = req.user.id;
      console.log('Getting notification settings for user:', userId);
      const user = await this.authService.findUserById(userId);
      const settings = user?.notificationSettings || {
        login: true,
        backup: true,
        registration: true,
        device: false
      };
      console.log('Notification settings:', settings);
      return { settings };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('notifications/settings')
  async updateNotificationSettings(@Request() req, @Body() body: {
    login?: boolean;
    backup?: boolean;
    registration?: boolean;
    device?: boolean;
  }) {
    try {
      console.log('updateNotificationSettings called, req.user:', req.user);
      const userId = req.user?.id;

      if (!userId) {
        console.error('No user ID found in request');
        throw new Error('User not authenticated');
      }

      // Get current settings first
      const user = await this.authService.findUserById(userId);
      const currentSettings = user?.notificationSettings || {
        login: true,
        backup: true,
        registration: true,
        device: false
      };

      // Merge with updates
      const updatedSettings = {
        ...currentSettings,
        ...body
      };

      console.log('Updating notification settings for user:', userId, 'to:', updatedSettings);

      const updatedUser = await this.authService.updateUser(userId, { notificationSettings: updatedSettings });
      console.log('User updated successfully:', !!updatedUser);

      return { success: true, settings: updatedSettings };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }


}

