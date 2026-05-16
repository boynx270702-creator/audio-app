import { Module } from '@nestjs/common';
import { AdminStoriesController } from './admin-stories.controller';
import { AdminWalletController } from './admin-wallet.controller';
import { AdminQuestsController } from './admin-quests.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [AdminStoriesController, AdminWalletController, AdminQuestsController],
})
export class AdminModule {}
