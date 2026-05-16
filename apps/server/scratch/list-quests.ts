import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const quests = await prisma.dailyQuest.findMany({ select: { name: true, id: true } });
  console.log('Quests in DB:', quests.length);
  quests.forEach(q => console.log(`- ${q.name} (${q.id})`));
}
main().finally(() => prisma.$disconnect());
