import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
    const newPassword = '123456'; // كلمة المرور الجديدة

    console.log('🔐 Resetting passwords...\n');

    const users = [
        { email: 'admin@kingdom.com', name: 'مدير النظام', type: 'ADMIN' },
        { email: 'owner@kingdom.com', name: 'أحمد النحال', type: 'OWNER' }
    ];

    for (const user of users) {
        const hash = await bcrypt.hash(newPassword, 10);

        await prisma.userProfile.update({
            where: { email: user.email },
            data: { password: hash }
        });

        console.log(`✅ Reset password for: ${user.email}`);
        console.log(`   New password: ${newPassword}`);
    }

    console.log('\n🎉 All passwords reset successfully!');
}

resetPassword()
    .catch(console.error)
    .finally(() => prisma.$disconnect());