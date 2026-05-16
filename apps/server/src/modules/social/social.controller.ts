import { Controller, Get, Post, Body, Query, UseGuards, Request, ParseIntPipe, Param } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentTargetType, LikeTargetType } from '@prisma/client';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('comments')
  async getComments(
    @Query('targetId') targetId: string,
    @Query('targetType') targetType: CommentTargetType,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.socialService.getComments(targetId, targetType, page, limit);
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Request() req: any,
    @Body() body: { targetId: string, targetType: CommentTargetType, content: string, parentId?: string },
  ) {
    return this.socialService.createComment(req.user.id, body);
  }

  @Post('likes/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Request() req: any,
    @Body() body: { targetId: string, targetType: LikeTargetType },
  ) {
    return this.socialService.toggleLike(req.user.id, body.targetId, body.targetType);
  }

  @Get('likes/status')
  @UseGuards(JwtAuthGuard)
  async getLikeStatus(
    @Request() req: any,
    @Query('targetId') targetId: string,
    @Query('targetType') targetType: LikeTargetType,
  ) {
    return this.socialService.getLikeStatus(req.user.id, targetId, targetType);
  }
}
