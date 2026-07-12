import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testOwnerLogin() {
    const email = 'owner@kingdom.com';
    const testPasswords = ['123456', 'password', 'admin', 'Owner123', 'owner123', 'Test@123'];

    console.log('🔐 Testing login for OWNER account:', email);
    console.log('');

    const user = await prisma.userProfile.findUnique({ where: { email } });

    if (!user) {
        console.log('❌ User not found!');
        return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   AuthID: ${user.authId}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Type: ${user.userType}`);
    console.log(`   Has Password: ${!!user.password}`);
    console.log('');

    if (user.password) {
        console.log('🔍 Testing common passwords...');
        for (const pwd of testPasswords) {
            try {
                const isValid = await bcrypt.compare(pwd, user.password);
                console.log(`   "${pwd}": ${isValid ? '✅ MATCH!' : '❌'}`);
                if (isValid) {
                    console.log(`\n🎯 Found working password: "${pwd}"`);
                    return;
                }
            } catch (e) {
                console.log(`   "${pwd}": Error comparing - ${e}`);
            }
        }
    }

    // Reset password if no match
    console.log('\n⚠️ No matching password found. Resetting password...');
    const newPassword = 'owner123';
    const hash = await bcrypt.hash(newPassword, 10);

    await prisma.userProfile.update({
        where: { email },
        data: { password: hash }
    });

    console.log(`✅ Password reset to: "${newPassword}"`);
}

testOwnerLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());