const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  // Clean existing data in proper order
  await prisma.apiLog.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.base.deleteMany();

  // Hash a password
  const password = await bcrypt.hash('password123', 10);

  // Create bases
  const baseAlpha = await prisma.base.create({
    data: {
      name: 'Base Alpha',
      location: 'Northern Region',
    },
  });

  const baseBravo = await prisma.base.create({
    data: {
      name: 'Base Bravo',
      location: 'Eastern Zone',
    },
  });

  // Create users
  await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        password,
        role: 'ADMIN',
      },
      {
        username: 'commander1',
        password,
        role: 'BASE_COMMANDER',
        baseId: baseAlpha.id,
      },
      {
        username: 'logistics1',
        password,
        role: 'LOGISTICS_OFFICER',
        baseId: baseBravo.id,
      },
    ],
  });

  // Create assets
  const asset1 = await prisma.asset.create({
    data: {
      name: 'Rifle',
      type: 'Weapon',
      quantity: 100,
      purchaseDate: new Date(),
      baseId: baseAlpha.id,
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      name: 'Jeep',
      type: 'Vehicle',
      quantity: 10,
      purchaseDate: new Date(),
      baseId: baseBravo.id,
    },
  });

  // Create purchases
  await prisma.purchase.createMany({
    data: [
      {
        assetId: asset1.id,
        baseId: baseAlpha.id,
        quantity: 100,
        cost: 50000,
        supplier: 'Arms Co.',
        purchasedAt: new Date(),
      },
      {
        assetId: asset2.id,
        baseId: baseBravo.id,
        quantity: 10,
        cost: 200000,
        supplier: 'Auto Ltd.',
        purchasedAt: new Date(),
      },
    ],
  });

  // Create assignment
  await prisma.assignment.create({
    data: {
      assetId: asset1.id,
      baseId: baseAlpha.id,
      assignee: 'Lt. Sharma',
      quantity: 10,
      createdAt: new Date(),
    },
  });

  // Create transfer
  await prisma.transfer.create({
    data: {
      assetId: asset2.id,
      fromBaseId: baseBravo.id,
      toBaseId: baseAlpha.id,
      quantity: 2,
      createdAt: new Date(),
    },
  });

  // Create expenditure
  await prisma.expenditure.create({
    data: {
      assetId: asset1.id,
      baseId: baseAlpha.id,
      quantity: 5,
      reason: 'Damaged during training',
      recordedAt: new Date("2025-06-30T11:17:49.575Z"),
    },
  });

  // Create an API log example
  await prisma.apiLog.create({
  data: {
    userId: 1,
    action: "Viewed Assets",
    endpoint: "/api/assets",
    timestamp: new Date("2025-06-30T11:20:59.316Z"), // optional override
    details: "Initial seed log for viewing assets",  // optional
  },
  });

  console.log('🌱 Seeding complete');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
