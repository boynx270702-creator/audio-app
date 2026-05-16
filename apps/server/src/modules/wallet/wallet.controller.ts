import { Controller, Get, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getMyWallet(@Request() req: any) {
    return this.walletService.getWallet(req.user.id);
  }

  @Get('transactions')
  async getMyTransactions(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.walletService.getTransactionHistory(req.user.id, page, limit);
  }
}
