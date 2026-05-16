import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('Cleaning up old quests...');
  // Delete quests that don't have 'seed-' in their ID
  const result = await prisma.dailyQuest.deleteMany({
    where: {
      NOT: {
        id: { startsWith: 'seed-' }
      }
    }
  });
  console.log(`Deleted ${result.count} old quests.`);
}
main().finally(() => prisma.$disconnect());
