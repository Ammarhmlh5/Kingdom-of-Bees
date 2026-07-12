
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hiveTypes = [
    {
        nameAr: 'لنجستروث',
        nameEn: 'Langstroth',
        description: 'الخلية الأكثر شيوعاً عالمياً، تتميز بإطارات متحركة وسهولة الفحص.',
        defaultFrames: 10,
        dimensions: '50.5 x 41.3 x 24.1 cm (Deep)',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80',
    },
    {
        nameAr: 'دادت',
        nameEn: 'Dadant',
        description: 'خلية بإطارات أعمق من لنجستروث، شائعة في أوروبا.',
        defaultFrames: 12,
        dimensions: '50 x 30 cm (Frame)',
        imageUrl: null,
    },
    {
        nameAr: 'زيان',
        nameEn: 'Zian',
        description: 'خلية مطورة حديثاً تناسب البيئة العربية.',
        defaultFrames: 8,
        dimensions: 'Custom',
        imageUrl: null,
    },
    {
        nameAr: 'بلدي (تقليدي)',
        nameEn: 'Baladi (Traditional)',
        description: 'الخلايا الطينية أو الخشبي التقليدية (العيدان).',
        defaultFrames: 0, // Traditional often don't have frames in standard sense
        dimensions: 'Variable',
        imageUrl: null,
    },
    {
        nameAr: 'توب بار',
        nameEn: 'Top Bar',
        description: 'خلية أفقية تعتمد على العوارض العلوية فقط.',
        defaultFrames: 20,
        dimensions: 'Variable Length',
        imageUrl: null,
    },
];

async function main() {
    console.log('🌱 Seeding Hive Types...');

    for (const type of hiveTypes) {
        const existing = await prisma.hiveType.findFirst({
            where: { nameEn: type.nameEn }
        });

        if (!existing) {
            await prisma.hiveType.create({
                data: type,
            });
            console.log(`✅ Created: ${type.nameEn}`);
        } else {
            console.log(`⏩ Skipped (Exists): ${type.nameEn}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
