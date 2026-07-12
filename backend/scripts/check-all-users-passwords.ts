import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkAllUsersPasswords() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🐝 فحص جميع المستخدمين في قاعدة البيانات');
    console.log('═══════════════════════════════════════════════════════════\n');

    const users = await prisma.userProfile.findMany({
        orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total users: ${users.length}\n`);

    for (const user of users) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email: ${user.email}`);
        console.log(`👤 Name: ${user.fullName}`);
        console.log(`🎭 Type: ${user.userType}`);
        console.log(`🆔 ID: ${user.id}`);
        console.log(`🔑 Has Password: ${user.password ? 'YES' : 'NO ✅'}`);
        console.log(`✅ Active: ${user.isActive}`);
        console.log(`📅 Created: ${user.createdAt}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('💡 إذا كان لدى المستخدم كلمة مرور، جرب تسجيل الدخول بكلمة مرور خاصة به.');
    console.log('   إذا لم يكن لديه كلمة مرور، يجب إعادة تعيينها.');
}

checkAllUsersPasswords()
    .catch(console.error)
    .finally(() => prisma.$disconnect());