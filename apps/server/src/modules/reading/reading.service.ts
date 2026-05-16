import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class ReadingService {
  private readonly logger = new Logger(ReadingService.name);

  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
  ) {}

  async trackProgress(userId: string, data: {
    storyId: string;
    chapterId: string;
    durationSeconds: number;
    scrollDepth: number;
  }) {
    // 1. Update Reading History
    await this.prisma.readingHistory.upsert({
      where: {
        userId_storyId: { userId, storyId: data.storyId }
      },
      update: {
        chapterId: data.chapterId,
        progressPct: data.scrollDepth * 100,
        lastReadAt: new Date(),
      },
      create: {
        userId,
        storyId: data.storyId,
        chapterId: data.chapterId,
        progressPct: data.scrollDepth * 100,
      }
    });

    // 2. Update Daily Activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.dailyActivity.upsert({
      where: {
        userId_date: { userId, date: today }
      },
      update: {
        secondsRead: { increment: data.durationSeconds }
      },
      create: {
        userId,
        date: today,
        secondsRead: data.durationSeconds
      }
    });

    // 3. Add XP
    const xpAmount = Math.max(1, Math.floor(data.durationSeconds / 4)); 
    await this.gamification.addXp(userId, xpAmount);

    return result;
  }

  async getContinueReading(userId: string) {
    return this.prisma.readingHistory.findMany({
      where: { userId },
      include: {
        story: true,
        chapter: {
          select: {
            chapterNumber: true,
            title: true
          }
        }
      },
      orderBy: { lastReadAt: 'desc' },
      take: 5
    });
  }
}
