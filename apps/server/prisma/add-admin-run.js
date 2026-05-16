const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding admin account...');
  const email = 'admin@gmail.com';
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: email },
    update: {
      passwordHash: hash,
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    create: {
      email: email,
      passwordHash: hash,
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: {
        create: { displayName: 'Administrator' }
      },
      wallet: {
        create: {
          linhThach: 999999,
          tienNgoc: 999999,
          thanTinh: 999999
        }
      }
    }
  });

  console.log('SUCCESS:', admin.email, '| role:', admin.role, '| status:', admin.status);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
