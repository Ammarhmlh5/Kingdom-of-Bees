import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createAlhomelyUser() {
    const email = 'alhomely10@gmail.com';
    const password = '123456';
    const fullName = 'alhomely';
    const userType = 'OWNER';

    console.log('🐝 Creating new user for alhomely10@gmail.com');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Check if user already exists
    const existing = await prisma.userProfile.findUnique({ where: { email } });

    if (existing) {
        console.log('✅ User already exists! Resetting password...');

        const hash = await bcrypt.hash(password, 10);
        await prisma.userProfile.update({
            where: { id: existing.id },
            data: { password: hash }
        });

        console.log('✅ Password reset to:', password);
    } else {
        console.log('📝 Creating new user...');

        const hash = await bcrypt.hash(password, 10);

        // Generate proper UUIDs
        const userId = crypto.randomUUID();
        const authId = crypto.randomUUID();

        const user = await prisma.userProfile.create({
            data: {
                id: userId,
                authId: authId,
                email,
                fullName,
                userType: userType as UserType,
                password: hash,
                isActive: true,
                isVerified: true,
                language: 'ar',
                timezone: 'Asia/Riyadh',
                country: 'Saudi Arabia',
                subscriptionStatus: 'FREE'
            }
        });

        console.log('✅ User created successfully!');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.fullName}`);
        console.log(`   Type: ${user.userType}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n💡 You can change your password after logging in!');
}

createAlhomelyUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());