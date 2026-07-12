import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function main() {
    console.log('🌱 Seeding Feeding Types via Raw SQL...');

    const feedingTypes = [
        {
            name: 'محلول سكري 1:1 (تحفيزي)',
            category: 'SUGAR_SYRUP',
            description: 'محلول سكري خفيف لتنشيط الملكة وبناء الشمع. يستخدم في الربيع.',
            unit: 'LITER',
            seasonality: 'SPRING',
            defaultQuantity: 1.0,
        },
        {
            name: 'محلول سكري 2:1 (تخزيني)',
            category: 'SUGAR_SYRUP',
            description: 'محلول سكري كثيف لتخزين العلف لفصل الشتاء أو فترات القحط.',
            unit: 'LITER',
            seasonality: 'WINTER',
            defaultQuantity: 3.0,
        },
        {
            name: 'عجينة بروتينية (كاندي)',
            category: 'PROTEIN_PATTY',
            description: 'عجينة غنية بالبروتين لتعويض نقص حبوب اللقاح.',
            unit: 'GRAM',
            seasonality: 'ALL',
            defaultQuantity: 500,
        },
        {
            name: 'عجينة سكرية (فوندان)',
            category: 'CANDY',
            description: 'عجينة سكرية صلبة للتغذية الطارئة في الشتاء.',
            unit: 'KG',
            seasonality: 'WINTER',
            defaultQuantity: 1.0,
        },
        {
            name: 'سكر جاف',
            category: 'DRY_SUGAR',
            description: 'سكر ناعم لتنظيف النحل وتقليل الرطوبة.',
            unit: 'GRAM',
            seasonality: 'WINTER',
            defaultQuantity: 200,
        },
        {
            name: 'ماء نقي',
            category: 'WATER',
            description: 'تزويد النحل بالماء في الأيام الحارة.',
            unit: 'LITER',
            seasonality: 'SUMMER',
            defaultQuantity: 0.5,
        }
    ];

    // Debug: List all tables
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    console.log('📊 Tables in DB:', tables);

    for (const type of feedingTypes) {
        try {
            // Check if exists using explicit public schema
            const existing = await prisma.$queryRaw`SELECT id FROM public."feeding_type" WHERE name = ${type.name} LIMIT 1`;

            if (Array.isArray(existing) && existing.length === 0) {
                const id = getUUID();
                // Insert
                // Note: Casting the enum string explicitly to the enum type "FeedingCategory"
                await prisma.$executeRawUnsafe(
                    `INSERT INTO public."feeding_type" ("id", "name", "category", "description", "unit", "seasonality", "defaultQuantity") VALUES ($1, $2, $3::"FeedingCategory", $4, $5, $6, $7)`,
                    id,
                    type.name,
                    type.category,
                    type.description,
                    type.unit,
                    type.seasonality,
                    type.defaultQuantity
                );
                console.log(`✅ Created: ${type.name}`);
            } else {
                console.log(`ℹ️ Exists: ${type.name}`);
            }
        } catch (error) {
            console.error(`❌ Error seeding ${type.name}:`, error);
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
