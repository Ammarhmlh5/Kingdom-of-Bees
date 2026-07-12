import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
    const email = 'admin@kingdom.com';
    const password = '123456'; // جرب كلمة المرور الافتراضية أولاً

    console.log(`🔐 Testing login for: ${email}`);
    console.log(`📝 Password: ${password}\n`);

    const user = await prisma.userProfile.findUnique({ where: { email } });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log('✅ User found:', user.email);
    console.log('🔑 Has password:', !!user.password);

    if (user.password) {
        const isValid = await bcrypt.compare(password, user.password);
        console.log('🔓 Password valid:', isValid);
    }

    // جرب مع جميع كلمات المرور المحتملة
    const testPasswords = ['123456', 'admin', 'password', '12345678', 'Amar12345'];
    
    for (const pwd of testPasswords) {
        if (user.password) {
            const match = await bcrypt.compare(pwd, user.password);
            if (match) {
                console.log(`\n🎯 PASSWORD FOUND: "${pwd}"`);
            }
        }
    }
}

testLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());