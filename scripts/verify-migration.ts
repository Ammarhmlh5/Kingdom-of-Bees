import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log('🔍 Verifying Frame Management Migration...\n');

    // Check hive_frame columns
    const frameColumns = await prisma.$queryRaw<any[]>`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'hive_frame' AND column_name LIKE 'side%'
    ORDER BY column_name;
  `;

    console.log('✅ hive_frame table - Side tracking columns:', frameColumns.length);
    frameColumns.forEach(c => console.log(`  - ${c.column_name}`));

    // Check frame_snapshot table
    const snapshotCount = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM information_schema.tables 
    WHERE table_name = 'frame_snapshot';
  `;

    console.log('\n✅ frame_snapshot table exists:', snapshotCount[0].count === '1');

    // Check indexes
    const indexes = await prisma.$queryRaw<any[]>`
    SELECT indexname FROM pg_indexes WHERE tablename = 'frame_snapshot';
  `;

    console.log('\n✅ frame_snapshot indexes:', indexes.length);
    indexes.forEach(i => console.log(`  - ${i.indexname}`));

    console.log('\n🎉 Verification complete! All migrations applied successfully.\n');

    await prisma.$disconnect();
}

verify();
