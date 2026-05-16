import { Controller, Get, Post, Body, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AdminGuard } from './admin.guard';
import * as WalletServiceModule from '../wallet/wallet.service';

@Controller('admin/wallets')
@UseGuards(AdminGuard)
export class AdminWalletController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletServiceModule.WalletService,
  ) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search } },
          { profile: { displayName: { contains: search } } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.wallet.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            include: { profile: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.wallet.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  @Post('adjust')
  async adjustBalance(@Body() dto: WalletServiceModule.UpdateBalanceDto) {
    return this.walletService.updateBalance(dto);
  }

  @Get('transactions')
  async findAllTransactions(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('currency') currency?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.wallet = {
        user: {
          OR: [
            { email: { contains: search } },
            { profile: { displayName: { contains: search } } },
          ],
        },
      };
    }

    if (type) where.type = type;
    if (currency) where.currency = currency;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          wallet: {
            include: {
              user: { include: { profile: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
