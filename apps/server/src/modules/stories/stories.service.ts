import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.story.findMany({
        skip,
        take: limit,
        orderBy: { viewCount: 'desc' },
        include: {
          author: true,
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.story.count(),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string) {
    const story = await this.prisma.story.findUnique({
      where: { slug },
      include: {
        author: true,
        publisher: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        _count: {
          select: { chapters: { where: { status: 'PUBLISHED' } } }
        }
      },
    });

    if (!story) throw new NotFoundException('Không tìm thấy truyện');
    return story;
  }

  async findChapter(slug: string, chapterNumber: number) {
    const story = await this.prisma.story.findUnique({ where: { slug } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');

    const chapter = await this.prisma.chapter.findFirst({
      where: {
        storyId: story.id,
        chapterNumber,
        status: 'PUBLISHED',
      },
      include: { audio: true },
    });

    if (!chapter) throw new NotFoundException('Không tìm thấy chương');

    // increment view count async
    void this.prisma.story.update({
      where: { id: story.id },
      data: { viewCount: { increment: 1 } },
    });

    return chapter;
  }

  async findChaptersPaginated(slug: string, page = 1, limit = 100) {
    const story = await this.prisma.story.findUnique({ where: { slug } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');

    const skip = (page - 1) * limit;
    const [chapters, total] = await this.prisma.$transaction([
      this.prisma.chapter.findMany({
        where: { storyId: story.id, status: 'PUBLISHED' },
        orderBy: { chapterNumber: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          chapterNumber: true,
          title: true,
          priceCoins: true,
          wordCount: true,
          publishedAt: true,
        },
      }),
      this.prisma.chapter.count({
        where: { storyId: story.id, status: 'PUBLISHED' },
      }),
    ]);

    return {
      chapters,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async incrementView(id: string) {
    await this.prisma.story.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }
}
