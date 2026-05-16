import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReadingHistoryService } from './reading-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reading-history')
@UseGuards(JwtAuthGuard)
export class ReadingHistoryController {
  constructor(private readonly service: ReadingHistoryService) {}

  @Post('progress')
  async saveProgress(
    @Request() req: any,
    @Body() body: { storyId: string; chapterId: string; progressPct: number },
  ) {
    return this.service.saveProgress({
      userId: req.user.id,
      ...body,
    });
  }

  @Get()
  async getMyHistory(@Request() req: any) {
    return this.service.getUserHistory(req.user.id);
  }
}
