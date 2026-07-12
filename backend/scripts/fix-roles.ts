import { PrismaClient, UserType } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const existingAdmin = await prisma.userProfile.findUnique({ where: { email: 'admin@test.com' } });
    if (!existingAdmin) {
        await prisma.userProfile.create({
            data: {
                id: randomUUID(),
                authId: randomUUID(),
                email: 'admin@test.com',
                fullName: 'System Admin',
                userType: UserType.ADMIN
            }
        });
        console.log("✅ Created admin@test.com as ADMIN");
    } else {
        console.log("✅ admin@test.com already exists");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
