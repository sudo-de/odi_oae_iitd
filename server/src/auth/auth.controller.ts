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
  async login(@Body() loginDto: LoginDto, @Request() req) {
    console.log('[AuthController] Login request received');
    console.log('[AuthController] Email:', loginDto?.email);
    console.log('[AuthController] Password provided:', !!loginDto?.password);
    
    // Detect client type from User-Agent header if not provided in body
    if (!loginDto.clientType) {
      const userAgent = req.headers['user-agent'] || '';
      if (userAgent.includes('ReactNative') || userAgent.includes('Expo') || userAgent.includes('Mobile')) {
        loginDto.clientType = 'mobile';
      } else {
        loginDto.clientType = 'web';
      }
    }
    
    console.log('[AuthController] Client type:', loginDto.clientType);
    console.log('[AuthController] LoginDto:', JSON.stringify(loginDto, null, 2));
    
    try {
      const result = await this.authService.login(loginDto);
      console.log('[AuthController] Login successful');
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('[AuthController] Login error:', errorMessage);
      if (errorStack) {
        console.error('[AuthController] Error stack:', errorStack);
      }
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
  @Get('devices')
  async getDevices(@Request() req) {
    try {
      const userId = req.user?.id;
      console.log('Getting devices for user:', userId);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // For now, return mock device data
      // In a real implementation, you'd store device sessions in the database
      const currentDevice = {
        userAgent: req.headers['user-agent'] || 'Unknown',
        ip: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'Unknown',
        location: 'Unknown', // Would need geolocation service
        lastActive: new Date().toISOString(),
        current: true,
      };

      // Mock additional devices for demonstration
      const mockDevices = [
        currentDevice,
        {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ip: '192.168.1.100',
          location: 'New Delhi, India',
          lastActive: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          current: false,
        },
        {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          ip: '10.0.0.50',
          location: 'Mumbai, India',
          lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          current: false,
        },
      ];

      return { devices: mockDevices };
    } catch (error) {
      console.error('Error getting devices:', error);
      throw error;
    }
  }

}

