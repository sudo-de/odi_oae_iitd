import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-here',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy validate called with payload:', payload);

    if (!payload || !payload.email) {
      console.log('JWT payload missing email');
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findByEmail(payload.email);
    console.log('User found by email:', !!user);

    if (!user) {
      console.log('User not found for email:', payload.email);
      throw new UnauthorizedException();
    }

    // Add id property from MongoDB _id (cast to any to access runtime properties)
    const userDoc = user as any;
    const userObj = {
      ...user,
      id: userDoc._id?.toString() || userDoc.id,
    };

    console.log('Returning user object with id:', userObj.id);
    return userObj;
  }
}
