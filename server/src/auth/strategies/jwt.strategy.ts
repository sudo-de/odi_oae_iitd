import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../schemas/user.schema';

interface JwtPayload {
  email: string;
  [key: string]: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-here',
    });
  }

  async validate(payload: JwtPayload) {
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

    // Add id property from MongoDB _id
    const userDoc = user as UserDocument & { _id?: { toString(): string } };
    const userObj = {
      ...user,
      id: userDoc._id?.toString() || (userDoc as { id?: string }).id,
    };

    console.log('Returning user object with id:', userObj.id);
    return userObj;
  }
}
