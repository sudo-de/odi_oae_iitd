import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
  Sse,
  MessageEvent
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UsersService, UserChangeEvent } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { Types } from 'mongoose';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private resolveUserId(id: string, req: Request): string {
    if (id === 'me') {
      const user = req.user as { _id?: string | { toString(): string }; id?: string } | undefined;
      const resolvedId = user?._id
        ? typeof user._id === 'string'
          ? user._id
          : user._id.toString()
        : user?.id;

      if (!resolvedId) {
        throw new BadRequestException('Authenticated user id is not available');
      }

      return resolvedId;
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }

    return id;
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 2, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and PDF files are allowed.'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  create(@Body() createUserDto: CreateUserDto, @UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    // Debug: Log raw request body
    console.log('CONTROLLER DEBUG');
    console.log('req.body keys:', Object.keys(req.body || {}));
    console.log('req.body:', req.body);
    console.log('createUserDto:', createUserDto);
    console.log('Files count:', files?.length || 0);
    
    // Use req.body directly if @Body() is empty (multipart form issue)
    const userData = Object.keys(createUserDto).length > 0 ? createUserDto : req.body;
    return this.usersService.createWithFiles(userData as CreateUserDto, files);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const resolvedId = this.resolveUserId(id, req);
    return this.usersService.findOne(resolvedId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const resolvedId = this.resolveUserId(id, req);
    return this.usersService.update(resolvedId, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const resolvedId = this.resolveUserId(id, req);
    return this.usersService.remove(resolvedId);
  }

  // Additional MongoDB update endpoints
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { isActive: boolean }, @Req() req: Request) {
    const resolvedId = this.resolveUserId(id, req);
    return this.usersService.updateUserStatus(resolvedId, body.isActive);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() body: { role: string }, @Req() req: Request) {
    const resolvedId = this.resolveUserId(id, req);
    return this.usersService.updateUserRole(resolvedId, body.role);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: Partial<CreateUserDto> }>) {
    return this.usersService.bulkUpdateUsers(updates);
  }

  @Get('stats/overview')
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @Post(':id/generate-qr')
  async generateQRCode(@Param('id') id: string, @Req() req: Request) {
    const resolvedId = this.resolveUserId(id, req);
    const qrCode = await this.usersService.generateQRCodeForDriver(resolvedId);
    return { qrCode };
  }

  @Post('drivers/generate-qr-codes')
  async generateQRCodesForAllDrivers() {
    const result = await this.usersService.generateQRCodesForAllDrivers();
    return result;
  }

  @Sse('stream')
  streamUsers(): Observable<MessageEvent> {
    return this.usersService.watchUsers().pipe(
      map((event: UserChangeEvent) => ({ data: event }))
    );
  }
}
