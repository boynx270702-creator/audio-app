import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.storiesService.findAll(page, limit);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.storiesService.findBySlug(slug);
  }

  @Get(':slug/chapters/:chapter')
  async findChapter(
    @Param('slug') slug: string,
    @Param('chapter', ParseIntPipe) chapterNumber: number,
  ) {
    return this.storiesService.findChapter(slug, chapterNumber);
  }

  @Get(':slug/chapters')
  async getChapters(
    @Param('slug') slug: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 100,
  ) {
    return this.storiesService.findChaptersPaginated(slug, page, limit);
  }
}
