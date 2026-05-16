import { Injectable } from '@nestjs/common';
import { Communicate, listVoices } from 'edge-tts-ts';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TtsService {
  private readonly cacheDir = path.join(process.cwd(), 'storage', 'tts-cache');

  constructor() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async getVoices(): Promise<any[]> {
    return listVoices();
  }

  async synthesize(text: string, voice: string): Promise<Buffer> {
    const communicate = new Communicate(text, { voice });
    const chunks: Buffer[] = [];

    console.log(`[TtsService] Starting synthesis for voice: ${voice}`);
    for await (const chunk of communicate.stream()) {
      if (chunk.type === 'audio') {
        chunks.push(Buffer.from(chunk.data));
      }
    }

    const finalBuffer = Buffer.concat(chunks);
    return finalBuffer;
  }

  async streamSynthesize(text: string, voice: string): Promise<{ type: 'file'; path: string } | { type: 'stream'; stream: AsyncIterable<Buffer> }> {
    // 1. Generate unique hash for this content + voice
    const hash = crypto.createHash('sha256').update(`${voice}:${text}`).digest('hex');
    const cachePath = path.join(this.cacheDir, `${hash}.mp3`);

    // 2. Check Cache
    if (fs.existsSync(cachePath)) {
      console.log(`[TtsService] Cache Hit: serving ${hash}.mp3`);
      return { type: 'file', path: cachePath };
    }

    // 3. Cache Miss: Synthesize and Save
    console.log(`[TtsService] Cache Miss: Synthesizing for voice: ${voice}`);
    const communicate = new Communicate(text, { voice });
    const writeStream = fs.createWriteStream(cachePath);

    async function* generateStream() {
      for await (const chunk of communicate.stream()) {
        if (chunk.type === 'audio') {
          const buffer = Buffer.from(chunk.data);
          writeStream.write(buffer);
          yield buffer;
        }
      }
      writeStream.end();
    }

    return { type: 'stream', stream: generateStream() };
  }
}
