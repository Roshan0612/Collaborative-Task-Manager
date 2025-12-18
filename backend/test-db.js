const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✓ Database connected successfully');
    const users = await prisma.user.findMany();
    console.log(`✓ Found ${users.length} users`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✗ Database error:', error.message);
    process.exit(1);
  }
}

test();
