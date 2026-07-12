import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
const prisma = new PrismaClient();

async function main() {
    const diseases = await prisma.diseaseLibrary.findMany({
        include: {
            treatments: true
        }
    });
    logger.info('--- DISEASES IN DATABASE ---');
    logger.info(JSON.stringify(diseases, null, 2));
}

main().finally(() => prisma.$disconnect());
