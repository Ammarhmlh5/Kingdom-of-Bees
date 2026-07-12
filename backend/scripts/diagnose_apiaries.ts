
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- START DIAGNOSIS ---');

    // 1. Count all users
    const userCount = await prisma.userProfile.count();
    console.log(`Total Users: ${userCount}`);

    // 2. List all users (limit to 10 if too many)
    const users = await prisma.userProfile.findMany({ select: { id: true, email: true, fullName: true, authId: true } });
    console.log('Users:');
    users.forEach(u => console.log(` - ID: ${u.id}, Email: ${u.email}, AuthID: ${u.authId}`));

    // 3. Count all apiaries
    const apiaryCount = await prisma.apiary.count();
    console.log(`\nTotal Apiaries: ${apiaryCount}`);

    // 4. List all apiaries with owner info
    const apiaries = await prisma.apiary.findMany({
        include: { owner: { select: { email: true, id: true } } }
    });

    console.log('Apiaries:');
    apiaries.forEach(a => {
        console.log(` - ID: ${a.id}, Name: "${a.name}", Active: ${a.isActive}, OwnerID: ${a.ownerId}, OwnerEmail: ${a.owner?.email || 'N/A'}`);
    });

    // 5. Check for Legacy ID ownership
    const legacyId = "550e8400-e29b-41d4-a716-446655440000";
    const legacyApiaries = await prisma.apiary.count({ where: { ownerId: legacyId } });
    console.log(`\nLegacy ID (${legacyId}) owns ${legacyApiaries} apiaries.`);

    console.log('--- END DIAGNOSIS ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
