import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
    console.log('🌱 Starting test data seeding for architectural verification...');

    // Get the existing apiary (from main seed)
    const apiary = await prisma.apiary.findFirst({
        where: { name: 'منحل الرياض الأول' },
    });

    if (!apiary) {
        console.error('❌ No apiary found. Please run main seed first.');
        return;
    }

    console.log(`✅ Found apiary: ${apiary.name} (${apiary.id})`);

    // Get existing hives
    const hives = await prisma.hive.findMany({
        where: { apiaryId: apiary.id },
        take: 5,
    });

    if (hives.length === 0) {
        console.log('⚠️  No hives found. Creating test hives...');

        // Create 5 test hives
        for (let i = 1; i <= 5; i++) {
            await prisma.hive.create({
                data: {
                    apiaryId: apiary.id,
                    hiveNumber: `H-00${i}`,
                    hiveType: 'LANGSTROTH',
                    status: i <= 3 ? 'ACTIVE' : 'WEAK',
                    condition: i === 1 ? 'EXCELLENT' : i === 2 ? 'VERY_GOOD' : i === 3 ? 'GOOD' : 'WEAK',
                    strengthRating: (i <= 2 ? 'STRONG' : i === 3 ? 'AVERAGE' : 'WEAK') as any,
                    installationDate: new Date('2024-01-15'),
                    notes: `خلية اختبار رقم ${i}`,
                },
            });
        }

        console.log('✅ Created 5 test hives');
    }

    // Refresh hives list
    const testHives = await prisma.hive.findMany({
        where: { apiaryId: apiary.id },
        take: 5,
    });

    // 1. Seed Feeding Types (if not exist)
    console.log('\n📦 Seeding Feeding Types...');

    const feedingTypes: any[] = [
        { name: 'محلول سكري 1:1', category: 'SYRUP', unit: 'لتر', description: 'محلول سكري للتغذية السريعة' },
        { name: 'محلول سكري 2:1', category: 'SYRUP', unit: 'لتر', description: 'محلول سكري مركز للتخزين' },
        { name: 'عجينة بروتينية', category: 'PROTEIN', unit: 'كجم', description: 'عجينة غنية بالبروتين' },
        { name: 'كاندي', category: 'CANDY', unit: 'كجم', description: 'عجينة سكرية صلبة' },
        { name: 'حبوب لقاح', category: 'POLLEN', unit: 'جرام', description: 'حبوب لقاح طبيعية' },
    ];

    // Check if types already exist
    const existingTypes = await prisma.feedingType.findMany();

    if (existingTypes.length === 0) {
        await prisma.feedingType.createMany({
            data: feedingTypes,
        });
        console.log('✅ Feeding types seeded');
    } else {
        console.log('✅ Feeding types already exist, skipping');
    }

    // 2. Seed Feeding Records
    console.log('\n🍯 Seeding Feeding Records...');

    const types = await prisma.feedingType.findMany();
    const owner = await prisma.userProfile.findFirst({ where: { email: 'owner@kingdom.com' } });

    if (!owner) {
        console.error('❌ Owner not found');
        return;
    }

    // Create feeding records for the last 30 days
    const now = new Date();
    for (let i = 0; i < 15; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        const randomHive = testHives[Math.floor(Math.random() * testHives.length)];
        const randomType = types[Math.floor(Math.random() * types.length)];

        await prisma.feedingRecord.create({
            data: {
                apiaryId: apiary.id,
                hiveId: randomHive.id,
                typeId: randomType.id,
                quantity: Math.random() * 5 + 1, // 1-6 liters/kg
                feedingDate: date,
                notes: `تغذية اختبارية - ${randomType.name}`,
                cost: Math.random() * 50 + 10,
                createdById: owner.id,
            },
        });
    }

    // Create some external (apiary-wide) feeding records
    for (let i = 0; i < 5; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        const randomType = types[Math.floor(Math.random() * 2)]; // Only syrup for external

        await prisma.feedingRecord.create({
            data: {
                apiaryId: apiary.id,
                hiveId: null, // External feeding
                typeId: randomType.id,
                quantity: Math.random() * 20 + 10, // 10-30 liters
                feedingDate: date,
                notes: 'تغذية خارجية جماعية',
                cost: Math.random() * 200 + 100,
                createdById: owner.id,
            },
        });
    }

    console.log('✅ Created 20 feeding records (15 internal + 5 external)');

    // 3. Seed Feeding Recommendations
    console.log('\n💡 Seeding Feeding Recommendations...');

    // Create recommendations for weak hives
    const weakHives = testHives.filter(h => h.status === 'WEAK' || h.condition === 'WEAK');

    for (const hive of weakHives) {
        const syrupType = types.find(t => t.name === 'محلول سكري 1:1');
        if (syrupType) {
            await prisma.feedingRecommendation.create({
                data: {
                    apiaryId: apiary.id,
                    hiveId: hive.id,
                    typeId: syrupType.id,
                    quantity: 2.5,
                    reason: 'خلية ضعيفة تحتاج تغذية تحفيزية',
                    status: 'PENDING',
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                },
            });
        }
    }

    console.log(`✅ Created ${weakHives.length} feeding recommendations`);

    // 4. Seed Inspections
    console.log('\n🔍 Seeding Inspections...');

    for (let i = 0; i < 10; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 60));

        const randomHive = testHives[Math.floor(Math.random() * testHives.length)];

        await prisma.inspection.create({
            data: {
                apiaryId: apiary.id,
                hiveId: randomHive.id,
                inspectionDate: date,
                inspectionType: 'ROUTINE',
                temperatureCelsius: Math.floor(Math.random() * 10) + 25,
                overallAssessment: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'][Math.floor(Math.random() * 4)] as any,
                notes: `فحص روتيني - خلية ${randomHive.hiveNumber}`,
            },
        });
    }

    console.log('✅ Created 10 inspection records');

    // 5. Seed Harvest Records
    console.log('\n🍯 Seeding Harvest Records...');

    for (let i = 0; i < 8; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 180));

        const randomHive = testHives[Math.floor(Math.random() * testHives.length)];

        await prisma.harvestRecord.create({
            data: {
                apiaryId: apiary.id,
                harvestType: Math.random() > 0.2 ? 'HONEY' : 'POLLEN',
                harvestDate: date,
                totalQuantity: Math.random() * 15 + 5,
                unit: 'KG',
                notes: `حصاد ${randomHive.hiveNumber}`,
            },
        });
    }

    console.log('✅ Created 8 harvest records');

    // 6. Seed Alerts
    console.log('\n🚨 Seeding Alerts...');

    // Create 2 urgent alerts
    for (let i = 0; i < 2; i++) {
        await prisma.alert.create({
            data: {
                userId: owner.id,
                apiaryId: apiary.id,
                alertType: 'HEALTH',
                priority: 'URGENT',
                title: 'تنبيه عاجل: خلية تحتاج فحص فوري',
                message: 'تم رصد علامات ضعف شديد في إحدى الخلايا',
                status: 'ACTIVE',
                actionRequired: true,
            },
        });
    }

    // Create 3 normal alerts
    for (let i = 0; i < 3; i++) {
        await prisma.alert.create({
            data: {
                userId: owner.id,
                apiaryId: apiary.id,
                alertType: ['WEATHER', 'FEEDING', 'INSPECTION'][i] as any,
                priority: 'ROUTINE' as any,
                title: 'تنبيه: موعد فحص قادم',
                message: 'يرجى جدولة الفحص الدوري',
                status: 'ACTIVE',
                actionRequired: false,
            },
        });
    }

    console.log('✅ Created 5 alerts (2 urgent + 3 normal)');

    console.log('\n🎉 Test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Apiary: ${apiary.name}`);
    console.log(`   - Hives: ${testHives.length}`);
    console.log(`   - Feeding Types: ${types.length}`);
    console.log(`   - Feeding Records: 20`);
    console.log(`   - Recommendations: ${weakHives.length}`);
    console.log(`   - Inspections: 10`);
    console.log(`   - Harvests: 8`);
    console.log(`   - Alerts: 5`);
}

seedTestData()
    .catch((e) => {
        console.error('❌ Error seeding test data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
