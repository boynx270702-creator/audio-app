import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TransactionType, CurrencyType } from '@prisma/client';

export class UpdateBalanceDto {
  userId: string;
  amount: number;
  currency: CurrencyType;
  type: TransactionType;
  description?: string;
  metadata?: any;
}

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) { }

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId },
      });
    }

    return wallet;
  }

  async updateBalance(dto: UpdateBalanceDto) {
    const { userId, amount, currency, type, description, metadata } = dto;

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) throw new BadRequestException('Wallet not found');

      // Check balance if subtracting
      if (amount < 0) {
        const currentBalance = this.getBalanceByCurrency(wallet, currency);
        if (currentBalance < Math.abs(amount)) {
          throw new BadRequestException(`Không đủ ${currency} để thực hiện giao dịch`);
        }
      }

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          [this.getFieldByCurrency(currency)]: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          currency,
          type,
          status: 'SUCCESS',
          description,
          metadata,
        },
      });

      return updatedWallet;
    });
  }

  private getBalanceByCurrency(wallet: any, currency: CurrencyType): number {
    switch (currency as string) {
      case 'LINH_THACH': return wallet.linhThach;
      case 'TIEN_NGOC': return wallet.tienNgoc;
      case 'THAN_TINH': return wallet.thanTinh;
      case 'CO_VAT': return wallet.coVat;
      default: return 0;
    }
  }

  private getFieldByCurrency(currency: CurrencyType): string {
    switch (currency as string) {
      case 'LINH_THACH': return 'linhThach';
      case 'TIEN_NGOC': return 'tienNgoc';
      case 'THAN_TINH': return 'thanTinh';
      case 'CO_VAT': return 'coVat';
      default: throw new BadRequestException('Invalid currency type');
    }
  }

  async getTransactionHistory(userId: string, page = 1, limit = 20) {
    const wallet = await this.getWallet(userId);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      data: transactions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
