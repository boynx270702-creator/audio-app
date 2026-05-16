import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RankTier } from '@prisma/client';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate XP required for a specific level
   * Formula: xp = 100 * n^1.35
   */
  calculateRequiredXp(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.35));
  }

  /**
   * Determine Rank based on Level
   */
  determineRank(level: number): RankTier {
    if (level >= 100) return RankTier.TIEN_DE;
    if (level >= 90) return RankTier.CHAN_TIEN;
    if (level >= 80) return RankTier.PHI_THANG;
    if (level >= 70) return RankTier.DO_KIEP;
    if (level >= 60) return RankTier.HOA_THAN;
    if (level >= 50) return RankTier.NGUYEN_ANH;
    if (level >= 40) return RankTier.KIM_DAN;
    if (level >= 30) return RankTier.TRUC_CO;
    if (level >= 10) return RankTier.LUYEN_KHI;
    return RankTier.PHAM_NHAN;
  }

  async addXp(userId: string, amount: number) {
    const gamification = await this.prisma.userGamification.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    let newXp = gamification.currentXp + amount;
    // Basic Level calculation (inverse of xp formula approximately or just track level)
    // For simplicity in this enterprise architecture, we'll track XP and derive level
    
    // Check for level up...
    // This would be more complex in a real prod system with level field
    
    return this.prisma.userGamification.update({
      where: { userId },
      data: {
        currentXp: newXp,
        dailyXpEarned: { increment: amount },
        lastXpDate: new RegExp(new Date().toISOString().split('T')[0]).test(gamification.lastXpDate.toISOString()) 
          ? undefined 
          : new Date(), // Reset logic handled elsewhere or via Cron
      }
    });
  }

  /**
   * Heartbeat Anti-Cheat Check
   * Heartbeat 20 seconds as per Master Skill
   */
  async processHeartbeat(userId: string, data: { activity: string; duration: number }) {
    // Anti-cheat: Reward only if heartbeat is consistent
    if (data.duration > 25) { // Threshold for fake duration
       this.logger.warn(`Anti-cheat triggered for user ${userId}: Duration too high in heartbeat`);
       return;
    }

    // Logic for Point System: 5 mins = 1 point, etc.
    // This would update UserActivity and eventually Wallet
  }
}
