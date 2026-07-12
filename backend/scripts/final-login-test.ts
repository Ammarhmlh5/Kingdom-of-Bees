import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'ueikGJAFa3UUatpOeodHaCoKT+7kJQ0DPAqvcDTUoVc=';

async function finalLoginTest() {
    const testCredentials = [
        { email: 'admin@kingdom.com', password: '123456', name: 'مدير النظام' },
        { email: 'owner@kingdom.com', password: '123456', name: 'أحمد النحال (النحال)' },
        { email: 'dev@test.com', password: '123456', name: 'مطور تجريبي' },
    ];

    console.log('═══════════════════════════════════════════');
    console.log('🐝 اختبار تسجيل الدخول النهائي');
    console.log('═══════════════════════════════════════════\n');

    for (const cred of testCredentials) {
        console.log(`📧 ${cred.email} (${cred.name})`);
        console.log('──────────────────────────────────────────');

        const user = await prisma.userProfile.findUnique({ where: { email: cred.email } });

        if (!user) {
            console.log('❌ المستخدم غير موجود!\n');
            continue;
        }

        if (!user.password) {
            console.log('❌ لا يوجد كلمة مرور!\n');
            continue;
        }

        const isValid = await bcrypt.compare(cred.password, user.password);

        if (isValid) {
            const token = jwt.sign(
                { sub: user.authId, id: user.id, email: user.email, role: user.userType },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            console.log(`✅ نجح تسجيل الدخول!`);
            console.log(`   Role: ${user.userType}`);
            console.log(`   Token: ${token.substring(0, 60)}...\n`);
        } else {
            // Find the password
            const passwords = ['123456', 'password', 'admin', '12345678', 'test123', 'Test@123', 'Ammar12345'];
            let found = false;
            for (const p of passwords) {
                if (await bcrypt.compare(p, user.password)) {
                    console.log(`⚠️ كلمة المرور مختلفة: "${p}"`);
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log('❌ كلمة المرور غير صحيحة\n');
            }
        }
    }

    console.log('═══════════════════════════════════════════');
    console.log('💡 إذا كان تسجيل الدخول لا يعمل من المتصفح:');
    console.log('   1. تأكد من تشغيل الـ backend على المنفذ 4000');
    console.log('   2. تأكد من تشغيل الـ frontend-web على المنفذ 5173');
    console.log('   3. افتح Console في المتصفح واعرض الأخطاء');
    console.log('═══════════════════════════════════════════');
}

finalLoginTest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());