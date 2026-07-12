import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';

const prisma = new PrismaClient();

async function seedHiveTypes() {
    logger.info('🐝 Seeding hive types...');

    const hiveTypes = [
        {
            nameAr: 'لانجستروث',
            nameEn: 'Langstroth',
            description: 'الخلية الأكثر شيوعاً في العالم، ذات الإطارات القابلة للإزالة',
            defaultFrames: 10,
        },
        {
            nameAr: 'بلدي (تقليدي)',
            nameEn: 'Baladi (Traditional)',
            description: 'الخلية التقليدية المستخدمة في المنطقة العربية',
            defaultFrames: 8,
        },
        {
            nameAr: 'كيني (جذع الشجرة الأفقي)',
            nameEn: 'Kenyan Top Bar',
            description: 'خلية أفقية بأعمدة علوية، شائعة في إفريقيا',
            defaultFrames: 20,
        },
        {
            nameAr: 'وار (Warré)',
            nameEn: 'Warré',
            description: 'خلية عمودية شعبية ذات إطارات بسيطة',
            defaultFrames: 8,
        },
        {
            nameAr: 'أخرى',
            nameEn: 'Other',
            description: 'أنواع خلايا أخرى',
            defaultFrames: 10,
        },
    ];

    for (const type of hiveTypes) {
        // Check if already exists (by nameEn to avoid duplicates)
        const existing = await prisma.hiveType.findFirst({
            where: { nameEn: { equals: type.nameEn, mode: 'insensitive' } }
        });

        if (existing) {
            logger.info(`⚠️  Already exists: ${type.nameEn} (id: ${existing.id})`);
        } else {
            const created = await prisma.hiveType.create({ data: type });
            logger.info(`✅ Created: ${type.nameEn} (id: ${created.id})`);
        }
    }

    // Show all hive types after seeding
    const all = await prisma.hiveType.findMany();
    logger.info('\n📋 All hive types in DB:');
    all.forEach(t => logger.info(`  - [${t.id}] ${t.nameEn} / ${t.nameAr}`));

    logger.info('\n🎉 Hive types seeding complete!');
}

seedHiveTypes()
    .catch(e => {
        logger.error('❌ Error:', e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
