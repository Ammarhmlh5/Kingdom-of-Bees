import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupInvalidUUIDs() {
    console.log('🧹 Starting cleanup of invalid UUIDs...');

    try {
        // Delete all records with invalid UUIDs
        // This is safer than trying to update them

        const result = await prisma.$executeRawUnsafe(`
            DELETE FROM "apiary" 
            WHERE "owner_id" NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        `);

        console.log(`✅ Deleted ${result} records with invalid owner_id`);

        // Also clean up any other tables that might have invalid UUIDs
        const userResult = await prisma.$executeRawUnsafe(`
            DELETE FROM "user" 
            WHERE "id" NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        `);

        console.log(`✅ Deleted ${userResult} users with invalid id`);

        console.log('✨ Cleanup complete!');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

cleanupInvalidUUIDs()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
