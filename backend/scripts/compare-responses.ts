import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'ueikGJAFa3UUatpOeodHaCoKT+7kJQ0DPAqvcDTUoVc=';

async function compareAdminAndOwnerLogin() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔍 مقارنة استجابة تسجيل الدخول بين ADMIN و OWNER');
    console.log('═══════════════════════════════════════════════════════════\n');

    const adminEmail = 'admin@kingdom.com';
    const ownerEmail = 'owner@kingdom.com';
    const password = '123456';

    // Login as ADMIN
    console.log('1️⃣ تسجيل الدخول كـ ADMIN:', adminEmail);
    console.log('───────────────────────────────────────────────────────────');
    const adminUser = await prisma.userProfile.findUnique({ where: { email: adminEmail } });

    if (adminUser) {
        const adminPasswordValid = await bcrypt.compare(password, adminUser.password);
        console.log(`   🔑 كلمة المرور صحيحة: ${adminPasswordValid}`);

        if (adminPasswordValid) {
            const adminToken = jwt.sign(
                { sub: adminUser.authId, id: adminUser.id, email: adminUser.email, role: adminUser.userType },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            const adminResponse = {
                user: {
                    ...adminUser,
                    role: adminUser.userType
                },
                accessToken: adminToken
            };

            console.log(`   📦 الاستجابة الكاملة (length: ${JSON.stringify(adminResponse).length}):`);
            console.log(`   ${JSON.stringify(adminResponse, null, 2).substring(0, 500)}...`);
        }
    }
    console.log('');

    // Login as OWNER
    console.log('2️⃣ تسجيل الدخول كـ OWNER:', ownerEmail);
    console.log('───────────────────────────────────────────────────────────');
    const ownerUser = await prisma.userProfile.findUnique({ where: { email: ownerEmail } });

    if (ownerUser) {
        const ownerPasswordValid = await bcrypt.compare(password, ownerUser.password);
        console.log(`   🔑 كلمة المرور صحيحة: ${ownerPasswordValid}`);

        if (ownerPasswordValid) {
            const ownerToken = jwt.sign(
                { sub: ownerUser.authId, id: ownerUser.id, email: ownerUser.email, role: ownerUser.userType },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            const ownerResponse = {
                user: {
                    ...ownerUser,
                    role: ownerUser.userType
                },
                accessToken: ownerToken
            };

            console.log(`   📦 الاستجابة الكاملة (length: ${JSON.stringify(ownerResponse).length}):`);
            console.log(`   ${JSON.stringify(ownerResponse, null, 2).substring(0, 500)}...`);
        }
    }
    console.log('');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 ملخص الفرق:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   ADMIN userType: ${adminUser?.userType}`);
    console.log(`   OWNER userType: ${ownerUser?.userType}`);
    console.log(`   كلاهما يرسل role في الاستجابة`);
    console.log('');
    console.log('💡 إذا كان admin-panel يقبل ADMIN فقط،');
    console.log('   فحاول تسجيل الدخول بـ: admin@kingdom.com / 123456');
}

compareAdminAndOwnerLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());