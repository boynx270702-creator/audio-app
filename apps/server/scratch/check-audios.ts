import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const audios = await prisma.audio.findMany({
    take: 10,
    include: {
      chapter: {
        select: {
          title: true,
          chapterNumber: true
        }
      }
    }
  });
  console.log('--- Audio Records ---');
  console.log(JSON.stringify(audios, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
