import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './shared/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CurrencyType } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  
  console.log('🌱 Seeding via NestJS context...');
  
  const hash = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@storyverse.vn' },
    update: {},
    create: {
      email: 'admin@storyverse.vn',
      passwordHash: hash,
      role: 'ADMIN',
      profile: { create: { displayName: 'Admin' } },
      wallet: { create: { linhThach: 1000 } }
    }
  });

  // 1. Create Author
  const author = await prisma.author.upsert({
    where: { slug: 'vong-ngu' },
    update: {},
    create: { 
      name: 'Vong Ngữ', 
      slug: 'vong-ngu',
      bio: 'Tác giả huyền thoại của dòng tiên hiệp.'
    }
  });

  // 2. Create Categories
  const tienHiep = await prisma.category.upsert({
    where: { slug: 'tien-hiep' },
    update: {},
    create: { name: 'Tiên Hiệp', slug: 'tien-hiep' }
  });

  // 3. Create Sample Story: Phàm Nhân Tu Tiên
  const story = await prisma.story.upsert({
    where: { slug: 'pham-nhan-tu-tien' },
    update: {},
    create: {
      title: 'Phàm Nhân Tu Tiên',
      slug: 'pham-nhan-tu-tien',
      description: 'Một người bình thường, con đường tu tiên đầy gian truân nhưng cũng không kém phần rực rỡ.',
      authorId: author.id,
      status: 'ONGOING',
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      chapters: {
        create: [
          {
            chapterNumber: 1,
            title: 'Chương 1: Phàm Nhân',
            content: 'Làng nhỏ phía sau núi, Hàn Lập đang ngồi nhìn lên bầu trời. Hắn không ngờ rằng cuộc đời mình sẽ rẽ sang một hướng hoàn toàn khác...',
            wordCount: 1500,
            status: 'PUBLISHED'
          },
          {
            chapterNumber: 2,
            title: 'Chương 2: Thất Huyền Môn',
            content: 'Gia nhập Thất Huyền Môn là bước ngoặt đầu tiên. Tại đây, hắn đã tìm thấy bình nhỏ màu xanh bí ẩn...',
            wordCount: 1800,
            status: 'PUBLISHED'
          },
          {
            chapterNumber: 3,
            title: 'Chương 3: Trường Sinh Lộ',
            content: 'Con đường trường sinh không dành cho kẻ yếu lòng. Hàn Lập bắt đầu bước những bước đầu tiên vào thế giới tu chân khốc liệt.',
            wordCount: 2000,
            status: 'PUBLISHED'
          }
        ]
      },
      categories: {
        create: { categoryId: tienHiep.id }
      }
    }
  });

  // 4. Create Daily Quests
  const quests = [
    {
      name: 'Tân Thủ Tập Sự',
      description: 'Đọc truyện trong 5 phút',
      targetSeconds: 300,
      rewardAmount: 50,
      rewardCurrency: 'LINH_THACH' as CurrencyType
    },
    {
      name: 'Độc Giả Chuyên Cần',
      description: 'Đọc truyện trong 15 phút',
      targetSeconds: 900,
      rewardAmount: 150,
      rewardCurrency: 'LINH_THACH' as CurrencyType
    },
    {
      name: 'Đại Lão Tu Luyện',
      description: 'Đọc truyện trong 30 phút',
      targetSeconds: 1800,
      rewardAmount: 500,
      rewardCurrency: 'LINH_THACH' as CurrencyType
    }
  ];

  for (const q of quests) {
    await prisma.dailyQuest.upsert({
      where: { id: q.name }, // Using name as a simple seed ID
      update: q,
      create: q
    });
  }

  console.log('✅ Seed completed successfully! Added: Phàm Nhân Tu Tiên & Daily Quests.');
  await app.close();
}

bootstrap();
