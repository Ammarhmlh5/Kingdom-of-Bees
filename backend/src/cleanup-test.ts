import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
const prisma = new PrismaClient();

async function main() {
    logger.info('🧹 Cleaning up test disease from database...');
    
    // Find the test disease
    const testDisease = await prisma.diseaseLibrary.findFirst({
        where: { nameEn: 'Test Disease' }
    });

    if (testDisease) {
        // Delete associated treatments first
        const deletedTreatments = await prisma.diseaseTreatment.deleteMany({
            where: { diseaseId: testDisease.id }
        });
        logger.info(`🗑️ Deleted ${deletedTreatments.count} test treatments`);

        // Delete the disease
        await prisma.diseaseLibrary.delete({
            where: { id: testDisease.id }
        });
        logger.info('🗑️ Deleted test disease successfully!');
    } else {
        logger.info('ℹ️ No test disease found to delete.');
    }
}

main()
    .catch(err => logger.error('❌ Error during cleanup:', err))
    .finally(() => prisma.$disconnect());
