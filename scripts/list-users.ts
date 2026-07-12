const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.userProfile.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                userType: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('--- Registered Users ---');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            console.table(users);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
