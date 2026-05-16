import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminStoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stories')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.story.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: true,
          _count: { select: { chapters: true } }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.story.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  @Get('stories/:id')
  async findOne(@Param('id') id: string) {
    return this.prisma.story.findUnique({
      where: { id },
      include: { author: true, categories: { include: { category: true } } }
    });
  }

  @Get('authors')
  async findAllAuthors(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.author.findMany({
        skip,
        take: limit,
        include: { _count: { select: { stories: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.author.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  @Post('authors')
  async createAuthor(@Body() data: { name: string, bio?: string, avatarUrl?: string }) {
    let slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!slug) slug = `author-${Date.now()}`;
    return this.prisma.author.create({
      data: {
        name: data.name,
        slug,
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
      }
    });
  }

  @Put('authors/:id')
  async updateAuthor(@Param('id') id: string, @Body() data: any) {
    return this.prisma.author.update({ where: { id }, data });
  }

  @Delete('authors/:id')
  async deleteAuthor(@Param('id') id: string) {
    return this.prisma.author.delete({ where: { id } });
  }

  @Get('categories')
  async findAllCategories(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        include: { _count: { select: { stories: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  @Post('categories')
  async createCategory(@Body() data: { name: string, description?: string }) {
    let slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!slug) slug = `cat-${Date.now()}`;
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || '',
      }
    });
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  @Get('users')
  async findAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: { profile: true, wallet: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    const { profile, wallet, ...userData } = data;
    return this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        profile: profile ? { update: profile } : undefined,
      }
    });
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  @Post('stories')
  async create(@Body() body: any) {
    const { chapters, categoryIds, ...storyData } = body;
    
    return this.prisma.$transaction(async (tx) => {
      // 1. Create story
      const story = await tx.story.create({
        data: {
          ...storyData,
          categories: categoryIds?.length ? {
            create: categoryIds.map((id: string) => ({ categoryId: id }))
          } : undefined
        }
      });

      // 2. Batch create chapters if present
      if (chapters && chapters.length > 0) {
        const BATCH_SIZE = 500;
        const now = new Date();
        for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
          const batchChapters = chapters.slice(i, i + BATCH_SIZE);
          const batch = batchChapters.map((ch: any, idx: number) => ({
            storyId: story.id,
            chapterNumber: parseInt(String(ch.order || ch.chapterNumber || i + idx + 1)),
            title: String(ch.title || `Chương ${ch.order || ch.chapterNumber || i + idx + 1}`),
            content: String(ch.content || ''),
            wordCount: ch.wordCount || (ch.content ? ch.content.trim().split(/\s+/).length : 0),
            status: 'PUBLISHED' as const,
            priceCoins: 0,
            publishedAt: now,
          }));
          await tx.chapter.createMany({ 
            data: batch,
            skipDuplicates: true 
          });
        }
      }

      return story;
    }, {
      timeout: 30000 // Increase timeout for large imports
    });
  }

  @Put('stories/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    const { chapters, categoryIds, ...storyData } = body;

    return this.prisma.$transaction(async (tx) => {
      // Update categories if provided
      if (categoryIds !== undefined) {
        await tx.storyCategory.deleteMany({ where: { storyId: id } });
        if (categoryIds.length > 0) {
          await tx.storyCategory.createMany({
            data: categoryIds.map((catId: string) => ({ storyId: id, categoryId: catId }))
          });
        }
      }

      // Update story metadata
      return tx.story.update({
        where: { id },
        data: storyData
      });
    });
  }

  @Delete('stories/:id')
  async delete(@Param('id') id: string) {
    return this.prisma.story.delete({ where: { id } });
  }

  @Post('stories/:id/chapters')
  async createChapter(@Param('id') storyId: string, @Body() data: any | any[]) {
    if (Array.isArray(data)) {
      const now = new Date();
      const batch = data.map((ch: any) => ({
        storyId,
        chapterNumber: parseInt(String(ch.order || ch.chapterNumber)),
        title: String(ch.title),
        content: String(ch.content || ''),
        wordCount: ch.wordCount || (ch.content ? ch.content.trim().split(/\s+/).length : 0),
        status: 'PUBLISHED' as const,
        priceCoins: 0,
        publishedAt: now,
      }));
      return this.prisma.chapter.createMany({
        data: batch,
        skipDuplicates: true
      });
    } else {
      return this.prisma.chapter.create({
        data: { ...data, storyId },
      });
    }
  }

  @Get('stories/:id/chapters')
  async findAllChapters(
    @Param('id') storyId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 50,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.chapter.findMany({
        where: { storyId },
        skip,
        take: limit,
        orderBy: { chapterNumber: 'asc' },
      }),
      this.prisma.chapter.count({ where: { storyId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  @Put('stories/chapters/:id')
  async updateChapter(@Param('id') id: string, @Body() data: any) {
    return this.prisma.chapter.update({ where: { id }, data });
  }

  @Delete('stories/chapters/:id')
  async deleteChapter(@Param('id') id: string) {
    return this.prisma.chapter.delete({ where: { id } });
  }
}
