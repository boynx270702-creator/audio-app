import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('reading')
@UseGuards(JwtAuthGuard)
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Post('track')
  async track(@Req() req: Request & { user: any }, @Body() data: {
    storyId: string;
    chapterId: string;
    durationSeconds: number;
    scrollDepth: number;
  }) {
    return this.readingService.trackProgress(req.user.id, data);
  }

  @Get('continue')
  async getContinue(@Req() req: Request & { user: any }) {
    return this.readingService.getContinueReading(req.user.id);
  }
}
