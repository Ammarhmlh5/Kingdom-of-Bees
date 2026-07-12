const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('✅ Database connected!');
    process.exit(0);
  })
  .catch(e => {
    console.error('❌', e.message);
    process.exit(1);
  });