
import { PrismaClient, ApiaryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetEmail = 'alhomely5@gmail.com'; // based on previous diagnosis
    console.log(`Looking for user with email: ${targetEmail}...`);

    const user = await prisma.userProfile.findUnique({
        where: { email: targetEmail }
    });

    if (!user) {
        console.error(`User ${targetEmail} not found!`);
        console.log('Listing available users to help debug:');
        const users = await prisma.userProfile.findMany({ take: 5 });
        users.forEach(u => console.log(` - ${u.email} (${u.id})`));
        return;
    }

    console.log(`Found user: ${user.fullName} (${user.id})`);
    console.log('Creating 3 new apiaries...');

    const newApiaries = [
        { name: 'منحل الوادي', type: ApiaryType.FIXED, desc: 'منحل ثابت في الوادي' },
        { name: 'منحل الجبل', type: ApiaryType.MOBILE, desc: 'منحل متنقل في الجبل' },
        { name: 'منحل المزرعة', type: ApiaryType.FIXED, desc: 'منحل صغير في المزرعة' }
    ];

    for (const apiaryData of newApiaries) {
        try {
            const timestamp = Date.now().toString().slice(-4);
            const uniqueName = `${apiaryData.name} ${timestamp}`;

            const created = await prisma.apiary.create({
                data: {
                    name: uniqueName,
                    description: apiaryData.desc,
                    type: apiaryData.type,
                    ownerId: user.id,
                    isActive: true,
                    members: {
                        create: {
                            userId: user.id,
                            role: 'OWNER',
                            status: 'ACTIVE',
                            permissions: { all: true }
                        }
                    }
                }
            });
            console.log(`✅ Created apiary: ${created.name} (ID: ${created.id})`);
        } catch (e) {
            console.error(`❌ Failed to create ${apiaryData.name}:`, e);
        }
    }

    console.log('--- SEEDING COMPLETE ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
