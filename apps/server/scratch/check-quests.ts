import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.dailyQuest.count();
  const quests = await prisma.dailyQuest.findMany({ take: 5 });
  console.log('Total Quests:', count);
  console.log('Sample Quests:', JSON.stringify(quests, null, 2));
}
main().finally(() => prisma.$disconnect());
