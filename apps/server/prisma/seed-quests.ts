import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding attractive quests...');

  const quests = [
    // --- DAILY MILESTONES (Progressive Reading) ---
    {
      name: 'Khởi động ngày mới',
      description: 'Đọc truyện trong 5 phút để nhận quà khởi đầu.',
      type: 'READING',
      targetSeconds: 300,
      rewardAmount: 5,
      rewardCurrency: 'LINH_THACH',
      period: 'DAILY',
      milestone: 1,
    },
    {
      name: 'Tập trung cao độ',
      description: 'Đọc truyện trong 15 phút. Bạn đang làm rất tốt!',
      type: 'READING',
      targetSeconds: 900,
      rewardAmount: 15,
      rewardCurrency: 'LINH_THACH',
      period: 'DAILY',
      milestone: 2,
    },
    {
      name: 'Mọt sách chính hiệu',
      description: 'Đọc truyện trong 30 phút. Một hành trình thú vị!',
      type: 'READING',
      targetSeconds: 1800,
      rewardAmount: 30,
      rewardCurrency: 'LINH_THACH',
      period: 'DAILY',
      milestone: 3,
    },
    {
      name: 'Thức đêm cùng truyện',
      description: 'Đọc truyện trong 60 phút. Bạn là một độc giả thực thụ.',
      type: 'READING',
      targetSeconds: 3600,
      rewardAmount: 60,
      rewardCurrency: 'LINH_THACH',
      period: 'DAILY',
      milestone: 4,
    },

    // --- WEEKLY CHALLENGES (Engagement) ---
    {
      name: 'Kiên trì mỗi tuần',
      description: 'Đọc tổng cộng 5 giờ trong tuần này.',
      type: 'READING',
      targetSeconds: 18000,
      rewardAmount: 200,
      rewardCurrency: 'LINH_THACH',
      period: 'WEEKLY',
      milestone: 1,
    },
    {
      name: 'Nhà phê bình văn học',
      description: 'Để lại 10 bình luận chất lượng trong tuần.',
      type: 'READING', // Changed to READING but used targetCount for simplicity in current controller
      targetSeconds: 0,
      targetCount: 10,
      rewardAmount: 50,
      rewardCurrency: 'TIEN_NGOC',
      period: 'WEEKLY',
      milestone: 1,
    },
    {
      name: 'Người ủng hộ tác giả',
      description: 'Mở khóa 5 chương truyện mới bằng Linh Thạch/Tiên Ngọc.',
      type: 'UNLOCKING',
      targetSeconds: 0,
      targetCount: 5,
      rewardAmount: 100,
      rewardCurrency: 'TIEN_NGOC',
      period: 'WEEKLY',
      milestone: 1,
    },

    // --- MONTHLY MARATHON (Loyalty) ---
    {
      name: 'Hành trình vạn dặm',
      description: 'Đọc tổng cộng 20 giờ trong tháng này.',
      type: 'READING',
      targetSeconds: 72000,
      rewardAmount: 1000,
      rewardCurrency: 'LINH_THACH',
      period: 'MONTHLY',
      milestone: 1,
    },
    {
      name: 'Fan cứng của tháng',
      description: 'Điểm danh liên tục 25 ngày trong tháng.',
      type: 'STREAK',
      targetSeconds: 0,
      targetCount: 25,
      rewardAmount: 500,
      rewardCurrency: 'TIEN_NGOC',
      period: 'MONTHLY',
      milestone: 1,
    },
    {
      name: 'Đại gia sở hữu',
      description: 'Mở khóa 50 chương truyện trong tháng.',
      type: 'UNLOCKING',
      targetSeconds: 0,
      targetCount: 50,
      rewardAmount: 10,
      rewardCurrency: 'THAN_TINH', // Gems!
      period: 'MONTHLY',
      milestone: 1,
    },
  ];

  for (const quest of quests) {
    await prisma.dailyQuest.upsert({
      where: { id: `seed-${quest.name.toLowerCase().replace(/ /g, '-')}` },
      update: quest as any,
      create: {
        id: `seed-${quest.name.toLowerCase().replace(/ /g, '-')}`,
        ...quest as any,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
