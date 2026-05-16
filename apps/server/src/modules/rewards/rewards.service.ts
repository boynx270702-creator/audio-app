import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class RewardsService {
  // Thresholds in seconds: 5m, 15m, 30m, 60m
  private readonly REWARD_THRESHOLDS = [
    { seconds: 300, points: 1, label: '5 phút đọc' },
    { seconds: 900, points: 3, label: '15 phút đọc' },
    { seconds: 1800, points: 8, label: '30 phút đọc' },
    { seconds: 3600, points: 20, label: '60 phút đọc' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async processHeartbeat(userId: string, storyId: string, chapterId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Track heartbeat
    // We use a simple strategy: count heartbeats today for this user
    // Heartbeat is 20s, so 3 heartbeats = 1 minute
    
    // Check if session exists for today
    let session = await this.prisma.readingHistory.findUnique({
      where: { userId_storyId: { userId, storyId } }
    });

    if (!session) {
      session = await this.prisma.readingHistory.create({
        data: {
          userId,
          storyId,
          chapterId,
          progressPct: 0,
        }
      });
    }

    // Increment daily reading seconds (simplified: add 20s per heartbeat)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        // We might need a separate field for dailyReadingSeconds or similar
        // For now, let's assume we use metadata in reading history or a dedicated table
        // To be strict, let's create a ReadingSession table or similar in a real project
        // But for this demo-standard code, I'll use a dedicated Quests/Achievements logic
      }
    });

    // Let's actually use a dedicated "DailyActivity" record to track seconds
    const activity = await this.prisma.$executeRaw`
      INSERT INTO "DailyActivity" ("userId", "date", "secondsRead")
      VALUES (${userId}, ${today}, 20)
      ON CONFLICT ("userId", "date")
      DO UPDATE SET "secondsRead" = "DailyActivity"."secondsRead" + 20
      RETURNING "secondsRead"
    `;
    
    // In Prisma, raw queries might return different structures. 
    // Let's use standard prisma find/update for safety.
    let dailyActivity = await this.prisma.dailyActivity.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    if (!dailyActivity) {
      dailyActivity = await this.prisma.dailyActivity.create({
        data: { userId, date: today, secondsRead: 20 }
      });
    } else {
      dailyActivity = await this.prisma.dailyActivity.update({
        where: { id: dailyActivity.id },
        data: { secondsRead: { increment: 20 } }
      });
    }

    const secondsRead = dailyActivity.secondsRead;

    // Check thresholds
    for (const threshold of this.REWARD_THRESHOLDS) {
      // If they just passed the threshold in this heartbeat
      if (secondsRead >= threshold.seconds && (secondsRead - 20) < threshold.seconds) {
        await this.walletService.updateBalance({
          userId,
          amount: threshold.points,
          currency: 'LINH_THACH',
          type: 'REWARD',
          description: `Thưởng ${threshold.label}`,
          metadata: { storyId, chapterId, threshold: threshold.seconds }
        });
      }
    }

    return { secondsRead };
  }
}
