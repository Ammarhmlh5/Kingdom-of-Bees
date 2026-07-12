import { prisma } from '../src/config/database';

async function main() {
    try {
        await prisma.$connect();
        console.log('Successfully connected to database');
        const userCount = await prisma.userProfile.count();
        console.log(`User count: ${userCount}`);
    } catch (error) {
        console.error('Failed to connect:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
