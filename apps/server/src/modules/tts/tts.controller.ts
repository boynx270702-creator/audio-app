import { Controller, Get, Query, Res, Param, NotFoundException } from '@nestjs/common';
import { TtsService } from './tts.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import type { Response } from 'express';

@Controller('tts')
export class TtsController {
  constructor(
    private readonly ttsService: TtsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('voices')
  async getVoices() {
    return this.ttsService.getVoices();
  }

  @Get('synthesize')
  async synthesize(
    @Query('text') text: string,
    @Query('voice') voice: string,
    @Res() res: Response,
  ) {
    if (!text) {
      return res.status(400).send('Text is required');
    }

    console.log(`[TtsController] Synthesizing text: "${text.substring(0, 50)}..." with voice: ${voice}`);

    // Default to female natural voice if not specified or invalid
    // Using exact identifiers from Microsoft Edge TTS
    const selectedVoice = voice === 'male' 
      ? 'vi-VN-NamMinhNeural' 
      : 'vi-VN-HoaiMyNeural';

    try {
      const result = await this.ttsService.streamSynthesize(text, selectedVoice);

      if (result.type === 'file') {
        // res.sendFile automatically handles Accept-Ranges, Content-Length, and Range requests!
        return res.sendFile(result.path);
      }

      // If it's a live stream (cache miss), we chunk it
      res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      for await (const chunk of result.stream) {
        res.write(chunk);
      }
      
      res.end();
    } catch (error) {
      console.error('[TtsController] Error:', error);
      if (!res.headersSent) {
        res.status(500).send('Failed to synthesize speech');
      }
    }
  }

  @Get('chapter/:chapterId')
  async synthesizeChapter(
    @Param('chapterId') chapterId: string,
    @Query('voice') voice: string,
    @Res() res: Response,
  ) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { story: true },
    });

    if (!chapter || !chapter.content) {
      throw new NotFoundException('Chapter or content not found');
    }

    const fullText = `${chapter.title}. ${chapter.content}`;

    console.log(`[TtsController] Synthesizing full chapter: "${chapter.title}" with voice: ${voice}`);

    const selectedVoice = voice === 'male' 
      ? 'vi-VN-NamMinhNeural' 
      : 'vi-VN-HoaiMyNeural';

    try {
      const result = await this.ttsService.streamSynthesize(fullText, selectedVoice);

      if (result.type === 'file') {
        return res.sendFile(result.path);
      }

      res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      for await (const chunk of result.stream) {
        res.write(chunk);
      }
      
      res.end();
    } catch (error) {
      console.error('[TtsController] Error synthesizing chapter:', error);
      if (!res.headersSent) {
        res.status(500).send('Failed to synthesize speech');
      }
    }
  }
}
