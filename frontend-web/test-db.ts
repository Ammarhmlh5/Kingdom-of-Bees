import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CURRENT_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

async function main() {
    try {
        console.log("Testing Hive query...");
        const hives = await prisma.hive.findMany({
            where: { apiary: { ownerId: CURRENT_USER_ID } },
            include: { apiary: true, _count: { select: { inspections: true, honeyHarvests: true } as any } },
            orderBy: { hiveNumber: 'asc' } as any
        });
        console.log("Success! Found " + hives.length + " hives.");
    } catch (e: any) {
        console.error("Query failed!");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
