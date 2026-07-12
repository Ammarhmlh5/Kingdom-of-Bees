import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('123456', 10);

    // dev@test.com - مطور
    const existing1 = await prisma.userProfile.findUnique({ where: { email: 'dev@test.com' } });
    if (!existing1) {
        await prisma.userProfile.create({
            data: {
                id: '00000000-0000-0000-0000-000000000001',
                authId: '00000000-0000-0000-0000-000000000001',
                email: 'dev@test.com',
                fullName: 'مطور تجريبي',
                userType: UserType.ADMIN,
                password: hash
            }
        });
        console.log('✅ Created dev@test.com (ADMIN) with password: 123456');
    } else {
        await prisma.userProfile.update({ where: { email: 'dev@test.com' }, data: { password: hash, userType: UserType.ADMIN } });
        console.log('✅ Updated dev@test.com password and role');
    }

    // admin@test.com
    const existing2 = await prisma.userProfile.findUnique({ where: { email: 'admin@test.com' } });
    if (!existing2) {
        await prisma.userProfile.create({
            data: {
                id: '00000000-0000-0000-0000-000000000002',
                authId: '00000000-0000-0000-0000-000000000002',
                email: 'admin@test.com',
                fullName: 'System Admin',
                userType: UserType.ADMIN,
                password: hash
            }
        });
        console.log('✅ Created admin@test.com (ADMIN) with password: 123456');
    } else {
        await prisma.userProfile.update({ where: { email: 'admin@test.com' }, data: { password: hash } });
        console.log('✅ Updated admin@test.com password');
    }

    console.log('\n🎉 Done! Both accounts available with password: 123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
