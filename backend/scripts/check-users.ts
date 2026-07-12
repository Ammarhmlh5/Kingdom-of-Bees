import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    console.log('👥 Users in database:\n');

    const users = await prisma.userProfile.findMany();
    
    users.forEach(user => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`👤 Name: ${user.fullName}`);
        console.log(`🔐 Role: ${user.userType}`);
        console.log(`🔑 Has Password: ${user.password ? 'YES' : 'NO'}`);
        console.log(`🆔 ID: ${user.id}`);
        console.log(`🔗 AuthID: ${user.authId}`);
    });

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 Total users: ${users.length}`);
}

checkUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());