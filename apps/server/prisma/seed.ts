const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('🌱 Start seeding...');
  console.log('Using URL:', process.env.DATABASE_URL);
  
  const hash = await bcrypt.hash('admin123', 10);
  
  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@storyverse.vn' },
    update: {},
    create: {
      email: 'admin@storyverse.vn',
      passwordHash: hash,
      role: 'ADMIN',
      profile: {
        create: { displayName: 'Admin' }
      },
      wallet: {
        create: { points: 1000 }
      }
    }
  });
  console.log('✅ Admin created');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
