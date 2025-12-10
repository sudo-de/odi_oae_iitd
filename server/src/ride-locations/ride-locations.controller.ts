import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RideLocationsService } from './ride-locations.service';
import { CreateRideLocationDto } from './dto/create-ride-location.dto';
import { UpdateRideLocationDto } from './dto/update-ride-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ride-locations')
@UseGuards(JwtAuthGuard)
export class RideLocationsController {
  constructor(private readonly rideLocationsService: RideLocationsService) {}

  @Post()
  async create(@Body() createRideLocationDto: CreateRideLocationDto) {
    try {
      console.log('Received create request:', JSON.stringify(createRideLocationDto, null, 2));
      console.log('Type of fare:', typeof createRideLocationDto.fare, 'Value:', createRideLocationDto.fare);
      
      const result = await this.rideLocationsService.create(createRideLocationDto);
      console.log('Successfully created ride location:', result);
      return result;
    } catch (error: unknown) {
      const errorObj = error as { message?: string; status?: number; response?: unknown; stack?: string };
      console.error('Error in create controller:', error);
      console.error('Error details:', {
        message: errorObj.message,
        status: errorObj.status,
        response: errorObj.response,
        stack: errorObj.stack
      });
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Format error response consistently
      const errorMessage = errorObj.message || 'Failed to create ride location';
      throw new HttpException(
        { message: errorMessage },
        errorObj.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  findAll() {
    return this.rideLocationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rideLocationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRideLocationDto: UpdateRideLocationDto,
  ) {
    return this.rideLocationsService.update(id, updateRideLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rideLocationsService.remove(id);
  }
}

