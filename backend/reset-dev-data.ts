import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDevData() {
    console.log('🧹 Resetting development data...');

    try {
        // Simply delete all apiaries - this is dev data anyway
        const result = await prisma.$executeRaw`
            TRUNCATE TABLE "apiary" CASCADE;
        `;
        console.log(`✅ Cleared all apiaries`);

        // Check if we need to create/update the dev user
        // First, let's just make sure we have a clean slate
        console.log('✨ Database reset complete!');
        console.log('ℹ️  You can now create apiaries with the UUID: 00000000-0000-0000-0000-000000000000');

    } catch (error) {
        console.error('❌ Error during reset:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

resetDevData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
