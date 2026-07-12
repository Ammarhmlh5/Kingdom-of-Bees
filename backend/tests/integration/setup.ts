import { prisma } from '../../src/config/prisma';

beforeAll(async () => {
    console.log('Cleaning database...');
    try {
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "user_profile" RESTART IDENTITY CASCADE;');
        console.log('Database cleaned.');
    } catch (error) {
        console.error('Failed to clean database:', error);
    }
});

afterAll(async () => {
    await prisma.$disconnect();
});

afterEach(async () => {
    // Clean up database afterEach(async () => {
    try {
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "user_profile" RESTART IDENTITY CASCADE;');
    } catch (error) {
        console.error('Failed to clean database in afterEach:', error);
    }
});
