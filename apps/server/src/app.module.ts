import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { StoriesModule } from './modules/stories/stories.module';
import { ReadingHistoryModule } from './modules/reading-history/reading-history.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { QuestsModule } from './modules/quests/quests.module';
import { SocialModule } from './modules/social/social.module';
import { AdminModule } from './modules/admin/admin.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { TtsModule } from './modules/tts/tts.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    StoriesModule, 
    ReadingHistoryModule, 
    WalletModule, 
    RewardsModule, 
    QuestsModule, 
    SocialModule, 
    AdminModule,
    TtsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
