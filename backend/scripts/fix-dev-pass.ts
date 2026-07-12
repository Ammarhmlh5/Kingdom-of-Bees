import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("Updating password for dev@test.com to '123456'...");
    const hash = await bcrypt.hash('123456', 10);
    
    const updated = await prisma.userProfile.updateMany({
        where: { email: 'dev@test.com' },
        data: { password: hash }
    });
    
    console.log("Updated users:", updated.count);
    
    const u = await prisma.userProfile.findUnique({ where: { email: 'dev@test.com' } });
    console.log("Verified user:", u?.email, "Has Password:", !!u?.password);
}

main().catch(console.error).finally(() => prisma.$disconnect());
