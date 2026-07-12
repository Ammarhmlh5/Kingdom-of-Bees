import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDevUser() {
    console.log('👤 Creating development user...');

    try {
        // Delete existing dev user if exists to correct the ID
        await prisma.userProfile.deleteMany({
            where: { authId: '00000000-0000-0000-0000-000000000000' }
        });

        // Create the user profile with specific ID
        const devUser = await prisma.userProfile.create({
            data: {
                id: '00000000-0000-0000-0000-000000000000',
                authId: '00000000-0000-0000-0000-000000000000',
                fullName: 'مطور تجريبي',
                email: 'dev@test.com',
                userType: 'OWNER'
            }
        });

        console.log(`✅ Dev user created: ${devUser.fullName} (${devUser.authId})`);
        console.log('✨ You can now create apiaries!');
    } catch (error) {
        console.error('❌ Error creating dev user:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createDevUser()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
