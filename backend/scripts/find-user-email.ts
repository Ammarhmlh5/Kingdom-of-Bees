import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function findUserByEmail() {
    const email = 'alhomely10@gmail.com';

    console.log('🔍 Searching for user:', email);
    console.log('');

    const user = await prisma.userProfile.findUnique({
        where: { email }
    });

    if (!user) {
        console.log('❌ User NOT found in database!');
        console.log('');
        console.log('💡 This means the user was never registered, or:');
        console.log('   - Email is slightly different (check for typos)');
        console.log('   - User was deleted from database');
        console.log('');
        console.log('📋 Current users in database:');
        const allUsers = await prisma.userProfile.findMany();
        allUsers.forEach(u => {
            console.log(`   - ${u.email} (${u.fullName})`);
        });
        return;
    }

    console.log('✅ User FOUND!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.fullName}`);
    console.log(`🎭 Type: ${user.userType}`);
    console.log(`🔑 Has Password: ${user.password ? 'YES' : 'NO ❌'}`);
    console.log(`✅ Is Active: ${user.isActive}`);
    console.log(`📅 Created: ${user.createdAt}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    if (!user.password) {
        console.log('⚠️ User has NO password set!');
        console.log('🔧 Setting password to: 123456');

        const hash = await bcrypt.hash('123456', 10);
        await prisma.userProfile.update({
            where: { id: user.id },
            data: { password: hash }
        });

        console.log('✅ Password set successfully!');
        console.log('');
        console.log('📝 Try logging in with:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: 123456`);
    } else {
        console.log('💡 User has a password but it may not match what you remember.');
        console.log('');
        console.log('🔧 Resetting password to: 123456');

        const hash = await bcrypt.hash('123456', 10);
        await prisma.userProfile.update({
            where: { id: user.id },
            data: { password: hash }
        });

        console.log('✅ Password reset successfully!');
        console.log('');
        console.log('📝 Try logging in with:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: 123456`);
    }
}

findUserByEmail()
    .catch(console.error)
    .finally(() => prisma.$disconnect());