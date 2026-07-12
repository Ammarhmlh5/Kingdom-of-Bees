import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser(email: string, password: string, fullName: string, userType: UserType = 'ADMIN') {
    const hash = await bcrypt.hash(password, 10);

    const existing = await prisma.userProfile.findUnique({ where: { email } });
    
    if (existing) {
        await prisma.userProfile.update({
            where: { email },
            data: { password: hash, fullName, userType }
        });
        console.log(`✅ Updated user: ${email}`);
    } else {
        await prisma.userProfile.create({
            data: {
                id: `custom-${Date.now()}`,
                authId: `custom-${Date.now()}`,
                email,
                fullName,
                userType,
                password: hash
            }
        });
        console.log(`✅ Created user: ${email}`);
    }
}

// ═══════════════════════════════════════════════════════
// 👤 أنشئ حسابك الخاص - عدل القيم أدناه:
// ═══════════════════════════════════════════════════════
// EMAIL: بريدك الإلكتروني
// PASSWORD: كلمة المرور
// FULLNAME: اسمك الكامل
// TYPE: 'OWNER' أو 'ADMIN'
// ═══════════════════════════════════════════════════════

createUser('YOUR_EMAIL_HERE', 'YOUR_PASSWORD_HERE', 'اسمك هنا', 'ADMIN')
    .catch(console.error)
    .finally(() => prisma.$disconnect());