import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger';

const prisma = new PrismaClient();

async function main() {
    logger.info('🌱 Starting database seeding...');

    // Delete existing data to start fresh (Reverse order of dependencies)
    await prisma.alert.deleteMany({});
    await prisma.inspection.deleteMany({});
    await prisma.hive.deleteMany({});
    await prisma.apiary.deleteMany({});
    await prisma.userProfile.deleteMany({});

    logger.info('🧹 Cleaned existing data');

    // 2. Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.userProfile.create({
        data: {
            authId: uuidv4(),
            email: 'admin@kingdom.com',
            fullName: 'مدير النظام',
            userType: 'ADMIN',
            password: adminPassword,
            phone: '+966500000000',
            country: 'Saudi Arabia',
            region: 'Riyadh',
            city: 'Riyadh',
            language: 'ar',
            timezone: 'Asia/Riyadh',
            isActive: true,
            isVerified: true,
        },
    });
    logger.info('✅ Admin user created:', admin.email);

    // 3. Create owner user
    const ownerPassword = await bcrypt.hash('Owner@123', 10);
    const owner = await prisma.userProfile.create({
        data: {
            authId: uuidv4(),
            email: 'owner@kingdom.com',
            fullName: 'أحمد النحال',
            userType: 'OWNER',
            password: ownerPassword,
            phone: '+966501111111',
            country: 'Saudi Arabia',
            region: 'Riyadh',
            city: 'Riyadh',
            language: 'ar',
            timezone: 'Asia/Riyadh',
            isActive: true,
            isVerified: true,
        },
    });
    logger.info('✅ Owner user created:', owner.email);

    // 4. Create apiaries
    const apiary1 = await prisma.apiary.create({
        data: {
            name: 'منحل الرياض الأول',
            type: 'STATIONARY',
            locationLat: 24.7136,
            locationLng: 46.6753,
            address: 'الرياض، المملكة العربية السعودية',
            description: 'منحل ثابت في شمال الرياض',
            ownerId: owner.id,
            isActive: true,
            establishedDate: new Date('2023-01-15'),
            settings: {},
            equipment: {},
            stats: {},
        },
    });
    logger.info('✅ Apiary created:', apiary1.name);

    // 5. Create hives
    const hive1 = await prisma.hive.create({
        data: {
            apiary: { connect: { id: apiary1.id } },
            hiveNumber: 'H-001',
            hiveType: {
                create: {
                    id: uuidv4(),
                    nameAr: 'لانجستروث',
                    nameEn: 'Langstroth',
                    updatedAt: new Date()
                }
            },
            status: 'ACTIVE',
            installationDate: new Date('2023-02-01'),
            notes: 'خلية قوية بإنتاج جيد',
        },
    });
    logger.info('✅ Hive created:', hive1.hiveNumber);

    // 6. Create inspections
    await prisma.inspection.create({
        data: {
            hive: { connect: { id: hive1.id } },
            apiary: { connect: { id: apiary1.id } },
            inspectionDate: new Date(),
            inspectionType: 'ROUTINE',
            temperatureCelsius: 28,
            notes: 'الخلية في حالة ممتازة',
            overallAssessment: 'EXCELLENT',
        },
    });
    logger.info('✅ Inspection created for hive:', hive1.hiveNumber);

    // 7. Create alert
    await prisma.alert.create({
        data: {
            user: { connect: { id: owner.id } },
            apiary: { connect: { id: apiary1.id } },
            alertType: 'DISEASE',
            priority: 'URGENT',
            title: 'تنبيه: مرض محتمل',
            message: 'تم رصد علامات مرض في المنطقة المجاورة',
            status: 'ACTIVE',
            actionRequired: true,
        },
    });
    logger.info('✅ Alert created');

    // 8. Create default inspection settings
    const defaultInspectionSettings = [
        {
            type: 'ROUTINE',
            nameAr: 'فحص روتيني',
            nameEn: 'Routine Inspection',
            minInterval: 7,
            maxInterval: 14,
            isActive: true,
            description: 'فحص روتيني منتظم للخلايا',
        },
        {
            type: 'QUICK_CHECK',
            nameAr: 'فحص سريع',
            nameEn: 'Quick Check',
            minInterval: 0,
            maxInterval: 1,
            isActive: true,
            description: 'فحص سريع حسب الحاجة',
        },
        {
            type: 'DISEASE_CHECK',
            nameAr: 'فحص أمراض',
            nameEn: 'Disease Check',
            minInterval: 0,
            maxInterval: 3,
            isActive: true,
            description: 'فحص للمتابعة العلاجية',
        },
        {
            type: 'QUEEN_CHECK',
            nameAr: 'فحص ملكات',
            nameEn: 'Queen Check',
            minInterval: 14,
            maxInterval: 21,
            isActive: true,
            description: 'فحص بعد التربية أو جني الغذاء الملكي',
        },
    ];

    for (const setting of defaultInspectionSettings) {
        await prisma.inspectionSetting.upsert({
            where: { type: setting.type },
            create: setting,
            update: setting,
        });
        logger.info(`✅ Inspection setting created/updated: ${setting.nameAr}`);
    }

    logger.info('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        logger.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
