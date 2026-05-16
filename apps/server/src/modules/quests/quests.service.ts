import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class QuestsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async getUserQuests(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const quests = await this.prisma.dailyQuest.findMany({
      where: { isActive: true },
      orderBy: [{ period: 'asc' }, { milestone: 'asc' }]
    });

    // Helper to calculate progress for a specific quest
    const calculateProgress = async (quest: any) => {
      let startDate = today;
      if (quest.period === 'WEEKLY') startDate = startOfWeek;
      if (quest.period === 'MONTHLY') startDate = startOfMonth;
      if (quest.period === 'ONCE') startDate = new Date(0);

      if (quest.type === 'READING') {
        const result = await this.prisma.dailyActivity.aggregate({
          where: { userId, date: { gte: startDate } },
          _sum: { secondsRead: true }
        });
        return result._sum.secondsRead || 0;
      }

      if (quest.type === 'COMMENTING') {
        return this.prisma.comment.count({
          where: { userId, createdAt: { gte: startDate } }
        });
      }

      if (quest.type === 'UNLOCKING') {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) return 0;
        return this.prisma.transaction.count({
          where: { 
            walletId: wallet.id, 
            type: TransactionType.PURCHASE_CHAPTER,
            createdAt: { gte: startDate } 
          }
        });
      }

      if (quest.type === 'STREAK') {
        // Simple streak count for the period
        return this.prisma.dailyActivity.count({
          where: { userId, date: { gte: startDate }, secondsRead: { gt: 0 } }
        });
      }

      return 0;
    };

    return Promise.all(quests.map(async (quest: any) => {
      const progress = await calculateProgress(quest);
      
      // Get the correct date for the userQuest record based on period
      let questDate = today;
      if (quest.period === 'WEEKLY') questDate = startOfWeek;
      if (quest.period === 'MONTHLY') questDate = startOfMonth;
      if (quest.period === 'ONCE') questDate = new Date(0);

      const userQuest = await this.prisma.userQuest.findUnique({
        where: { userId_questId_date: { userId, questId: quest.id, date: questDate } }
      });
      
      const target = quest.type === 'READING' ? quest.targetSeconds : (quest.targetCount || 1);

      return {
        ...quest,
        currentProgress: progress,
        isCompleted: userQuest?.isCompleted || progress >= target,
        isClaimed: userQuest?.isClaimed || false,
      };
    }));
  }

  async claimReward(userId: string, questId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const quest = await this.prisma.dailyQuest.findUnique({
      where: { id: questId }
    });

    if (!quest) throw new BadRequestException('Quest không tồn tại');

    // Calculate correct start date and quest date for this period
    let startDate = today;
    let questDate = today;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    if (quest.period === 'WEEKLY') { startDate = startOfWeek; questDate = startOfWeek; }
    if (quest.period === 'MONTHLY') { startDate = startOfMonth; questDate = startOfMonth; }
    if (quest.period === 'ONCE') { startDate = new Date(0); questDate = new Date(0); }

    // Re-verify progress
    let progress = 0;
    if (quest.type === 'READING') {
      const result = await this.prisma.dailyActivity.aggregate({
        where: { userId, date: { gte: startDate } },
        _sum: { secondsRead: true }
      });
      progress = result._sum.secondsRead || 0;
    } else if (quest.type === 'COMMENTING') {
      progress = await this.prisma.comment.count({ where: { userId, createdAt: { gte: startDate } } });
    } else if (quest.type === 'UNLOCKING') {
      const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
      if (wallet) {
        progress = await this.prisma.transaction.count({
          where: { walletId: wallet.id, type: TransactionType.PURCHASE_CHAPTER, createdAt: { gte: startDate } }
        });
      }
    } else if (quest.type === 'STREAK') {
      progress = await this.prisma.dailyActivity.count({ where: { userId, date: { gte: startDate }, secondsRead: { gt: 0 } } });
    }

    const target = quest.type === 'READING' ? quest.targetSeconds : (quest.targetCount || 1);

    if (progress < target) {
      throw new BadRequestException('Bạn chưa hoàn thành yêu cầu của nhiệm vụ này');
    }

    const existing = await this.prisma.userQuest.findUnique({
      where: { userId_questId_date: { userId, questId, date: questDate } }
    });

    if (existing?.isClaimed) {
      throw new BadRequestException('Bạn đã nhận thưởng nhiệm vụ này rồi');
    }

    return this.prisma.$transaction(async (tx: any) => {
      await tx.userQuest.upsert({
        where: { userId_questId_date: { userId, questId, date: questDate } },
        update: { isClaimed: true, claimedAt: new Date() },
        create: { 
          userId, 
          questId, 
          date: questDate, 
          isCompleted: true, 
          isClaimed: true, 
          completedAt: new Date(),
          claimedAt: new Date()
        }
      });

      await this.walletService.updateBalance({
        userId,
        amount: quest.rewardAmount,
        currency: quest.rewardCurrency,
        type: TransactionType.REWARD,
        description: `Thưởng nhiệm vụ: ${quest.name}`
      });

      return { success: true, reward: quest.rewardAmount, currency: quest.rewardCurrency };
    });
  }
}
