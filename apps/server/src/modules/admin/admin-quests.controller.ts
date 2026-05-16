import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AdminGuard } from './admin.guard';

@Controller('admin/quests')
@UseGuards(AdminGuard)
export class AdminQuestsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.dailyQuest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dailyQuest.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  @Post()
  async create(@Body() data: any) {
    return this.prisma.dailyQuest.create({ data });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.dailyQuest.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.prisma.dailyQuest.delete({
      where: { id },
    });
  }
}
