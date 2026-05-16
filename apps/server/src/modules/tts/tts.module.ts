import { Module } from '@nestjs/common';
import { TtsService } from './tts.service';
import { TtsController } from './tts.controller';

import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TtsService],
  controllers: [TtsController],
  exports: [TtsService],
})
export class TtsModule {}

