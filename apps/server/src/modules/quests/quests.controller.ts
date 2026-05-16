import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('quests')
@UseGuards(JwtAuthGuard)
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  async getQuests(@Req() req: Request & { user: any }) {
    return this.questsService.getUserQuests(req.user.id);
  }

  @Post(':id/claim')
  async claim(@Req() req: Request & { user: any }, @Param('id') id: string) {
    return this.questsService.claimReward(req.user.id, id);
  }
}
