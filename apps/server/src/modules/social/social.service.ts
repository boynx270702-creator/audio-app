import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CommentTargetType, LikeTargetType } from '@prisma/client';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  // --- COMMENTS ---

  async createComment(userId: string, data: { targetId: string, targetType: CommentTargetType, content: string, parentId?: string }) {
    return this.prisma.comment.create({
      data: {
        userId,
        targetId: data.targetId,
        targetType: data.targetType,
        content: data.content,
        parentId: data.parentId,
      },
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  async getComments(targetId: string, targetType: CommentTargetType, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Fetch top-level comments with their first few replies
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { targetId, targetType, parentId: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { include: { profile: true } },
          replies: {
            take: 3,
            include: { user: { include: { profile: true } } },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { replies: true } },
        },
      }),
      this.prisma.comment.count({
        where: { targetId, targetType, parentId: null },
      }),
    ]);

    return {
      data: comments,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // --- LIKES ---

  async toggleLike(userId: string, targetId: string, targetType: LikeTargetType) {
    const existing = await this.prisma.like.findUnique({
      where: {
        userId_targetId_targetType: { userId, targetId, targetType },
      },
    });

    if (existing) {
      await this.prisma.like.delete({
        where: { id: existing.id },
      });
      return { liked: false };
    } else {
      await this.prisma.like.create({
        data: { userId, targetId, targetType },
      });
      return { liked: true };
    }
  }

  async getLikeStatus(userId: string, targetId: string, targetType: LikeTargetType) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_targetId_targetType: { userId, targetId, targetType },
      },
    });
    return { liked: !!like };
  }
}
