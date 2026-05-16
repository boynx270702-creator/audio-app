import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface SaveProgressDto {
  userId: string;
  storyId: string;
  chapterId: string;
  progressPct: number;
}

@Injectable()
export class ReadingHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async saveProgress(dto: SaveProgressDto) {
    return this.prisma.readingHistory.upsert({
      where: { userId_storyId: { userId: dto.userId, storyId: dto.storyId } },
      create: {
        userId: dto.userId,
        storyId: dto.storyId,
        chapterId: dto.chapterId,
        progressPct: dto.progressPct,
        lastReadAt: new Date(),
      },
      update: {
        chapterId: dto.chapterId,
        progressPct: dto.progressPct,
        lastReadAt: new Date(),
      },
    });
  }

  async getUserHistory(userId: string) {
    return this.prisma.readingHistory.findMany({
      where: { userId },
      orderBy: { lastReadAt: 'desc' },
      take: 50,
      include: {
        story: {
          select: { id: true, title: true, slug: true, coverImage: true },
        },
        chapter: { select: { chapterNumber: true, title: true } },
      },
    });
  }
}
