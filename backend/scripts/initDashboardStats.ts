/**
 * Script: initDashboardStats.ts
 * Purpose: Initialize DashboardStats records for all existing users.
 * Run: npx ts-node scripts/initDashboardStats.ts
 */

import { PrismaClient } from '@prisma/client';
import { updateDashboardStats } from '../src/lib/stats';

const prisma = new PrismaClient();

async function main() {
  console.log('[initDashboardStats] Starting...');

  const users = await prisma.userProfile.findMany({
    select: { id: true, email: true },
  });

  console.log(`[initDashboardStats] Found ${users.length} users to process.`);

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    try {
      await updateDashboardStats(user.id);
      successCount++;
      console.log(`  ✓ ${user.email}`);
    } catch (error) {
      failCount++;
      console.error(`  ✗ ${user.email}:`, (error as Error).message);
    }
  }

  console.log('\n[initDashboardStats] Done.');
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed:  ${failCount}`);
}

main()
  .catch((e) => {
    console.error('[initDashboardStats] Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
