import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    
    // Auto-migrate default admin
    try {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await this.user.upsert({
        where: { email: 'hieunt270702@gmail.com' },
        update: { 
          role: 'ADMIN',
          passwordHash: hashedPassword 
        },
        create: {
          email: 'hieunt270702@gmail.com',
          passwordHash: hashedPassword,
          role: 'ADMIN',
          profile: {
            create: {
              displayName: 'Admin Hieu'
            }
          }
        }
      });
      console.log('Default admin seeded/updated successfully');
    } catch (error) {
      console.error('Failed to seed default admin:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
