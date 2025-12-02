import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RideBillsService } from './ride-bills.service';
import { CreateRideBillDto } from './dto/create-ride-bill.dto';
import { UpdateRideBillDto } from './dto/update-ride-bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ride-bills')
@UseGuards(JwtAuthGuard)
export class RideBillsController {
  constructor(private readonly rideBillsService: RideBillsService) {}

  @Post()
  create(@Body() createRideBillDto: CreateRideBillDto) {
    return this.rideBillsService.create(createRideBillDto);
  }

  @Get()
  findAll() {
    return this.rideBillsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.rideBillsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rideBillsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRideBillDto: UpdateRideBillDto) {
    return this.rideBillsService.update(id, updateRideBillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rideBillsService.remove(id);
  }
}
