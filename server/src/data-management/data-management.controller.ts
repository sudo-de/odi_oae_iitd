import { Controller, Get, Post, Delete, UseGuards, Res, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DataManagementService } from './data-management.service';

@Controller('data-management')
@UseGuards(JwtAuthGuard)
export class DataManagementController {
  constructor(private readonly dataManagementService: DataManagementService) {}

  @Post('backup')
  async createBackup(@Res() res: Response) {
    try {
      const result = await this.dataManagementService.createBackup();
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create backup' });
    }
  }

  @Get('export')
  async exportData(@Res() res: Response) {
    try {
      const data = await this.dataManagementService.exportAllData();

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="iitd-data-export.json"');

      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to export data' });
    }
  }

  @Delete('cache')
  async clearCache(@Res() res: Response) {
    try {
      const result = await this.dataManagementService.clearCache();
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to clear cache' });
    }
  }

  @Get('stats')
  async getDataStats() {
    return await this.dataManagementService.getDataStats();
  }

  @Get('backup/settings')
  async getBackupSettings() {
    return await this.dataManagementService.getBackupSettings();
  }

  @Post('backup/settings')
  async updateBackupSettings(@Body() settings: { enabled: boolean; interval: number; maxBackups: number }) {
    return await this.dataManagementService.updateBackupSettings(settings);
  }

  @Post('backup/schedule')
  async scheduleBackup() {
    return await this.dataManagementService.scheduleBackup();
  }

  @Get('backup/history')
  async getBackupHistory() {
    return await this.dataManagementService.getBackupHistory();
  }

  @Delete('backup/history/:filename')
  async deleteBackup(@Param('filename') filename: string) {
    return await this.dataManagementService.deleteBackup(filename);
  }

  @Delete('backup/history')
  async clearAllBackups() {
    return await this.dataManagementService.clearAllBackups();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    try {
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate file type
      if (!file.originalname.endsWith('.json')) {
        return res.status(400).json({ error: 'Only JSON files are allowed' });
      }

      const result = await this.dataManagementService.importData(file.buffer);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Failed to import data' });
    }
  }
}
