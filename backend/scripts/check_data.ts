
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Database Content ---');

    try {
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`));

        const apiaries = await prisma.apiary.findMany();
        console.log(`\nFound ${apiaries.length} apiaries:`);
        apiaries.forEach(a => console.log(`- ID: ${a.id}, Name: ${a.name}, OwnerId: ${a.ownerId}`));

        // Check for the legacy user specifically
        const legacyId = "550e8400-e29b-41d4-a716-446655440000";
        const legacyApiaries = apiaries.filter(a => a.ownerId === legacyId);
        console.log(`\nApiaries owned by Legacy Dummy User (${legacyId}): ${legacyApiaries.length}`);

    } catch (e) {
        console.error("Error querying DB:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
