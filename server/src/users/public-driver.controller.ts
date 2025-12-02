import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('public/drivers')
export class PublicDriverController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getDriverInfo(@Param('id') id: string) {
    try {
      const driver: any = await this.usersService.findOne(id);

      if (!driver || driver.role !== 'driver') {
        throw new NotFoundException('Driver not found');
      }

      // Return only public information
      return {
        _id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        profilePhoto: driver.profilePhoto,
        isActive: driver.isActive,
        role: driver.role,
        createdAt: driver.createdAt,
      };
    } catch (error) {
      // In test environments or when database is not available, return not found
      throw new NotFoundException('Driver not found');
    }
  }
}

