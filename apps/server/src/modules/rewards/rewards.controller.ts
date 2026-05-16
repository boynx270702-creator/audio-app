import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('heartbeat')
  async heartbeat(
    @Request() req: any,
    @Body() body: { storyId: string; chapterId: string },
  ) {
    return this.rewardsService.processHeartbeat(
      req.user.id,
      body.storyId,
      body.chapterId,
    );
  }
}
