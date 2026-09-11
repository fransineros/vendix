import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VENDIX...');

  // System config - planes y costes configurables en backend
  await prisma.systemConfig.upsert({
    where: { key: 'PLANS' },
    update: { value: {
      FREE: { price: 0, credits: 3 },
      BASIC: { price: 4.99, credits: 50 },
      PRO: { price: 9.99, credits: 150 },
      BUSINESS: { price: 19.99, credits: 500 },
    }},
    create: { key: 'PLANS', value: {
      FREE: { price: 0, credits: 3 },
      BASIC: { price: 4.99, credits: 50 },
      PRO: { price: 9.99, credits: 150 },
      BUSINESS: { price: 19.99, credits: 500 },
    }},
  });

  await prisma.systemConfig.upsert({
    where: { key: 'CREDIT_COSTS' },
    update: { value: {
      ANALYZE: 1, DESCRIPTION: 1, HASHTAGS: 1, IMAGE_PROCESS: 2, IMAGE_GENERATE: 3, COMMERCIAL_CONTENT: 1
    }},
    create: { key: 'CREDIT_COSTS', value: {
      ANALYZE: 1, DESCRIPTION: 1, HASHTAGS: 1, IMAGE_PROCESS: 2, IMAGE_GENERATE: 3, COMMERCIAL_CONTENT: 1
    }},
  });

  // Admin user
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vendix.com' },
    update: {},
    create: {
      email: 'admin@vendix.com',
      passwordHash: adminHash,
      name: 'VENDIX Admin',
      role: 'ADMIN',
      creditWallet: { create: { balance: 1000 } }
    }
  });

  // Demo user
  const demoHash = await bcrypt.hash('Demo123!', 10);
  await prisma.user.upsert({
    where: { email: 'demo@vendix.com' },
    update: {},
    create: {
      email: 'demo@vendix.com',
      passwordHash: demoHash,
      name: 'Demo User',
      role: 'USER',
      creditWallet: { create: { balance: 3 } }
    }
  });

  console.log('✅ Seed completado: admin@vendix.com / Admin123! y demo@vendix.com / Demo123!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });