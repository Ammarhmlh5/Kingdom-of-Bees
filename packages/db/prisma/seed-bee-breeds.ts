
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const beeBreeds = [
    {
        nameAr: 'نحل يمني',
        nameEn: 'Yemeni Bee',
        origin: 'Yemen',
        aggressionLevel: 'Medium',
        hardiness: 'High',
        productivity: 'High',
        characteristics: {
            native_region: 'Mountains',
            drought_tolerance: 'Excellent',
            swarming_tendency: 'High'
        }
    },
    {
        nameAr: 'نحل مصري',
        nameEn: 'Egyptian Bee (Lamarckii)',
        origin: 'Egypt',
        aggressionLevel: 'High',
        hardiness: 'High',
        productivity: 'Medium',
        characteristics: {
            color: 'Yellow bands',
            disease_resistance: 'Very High',
            historical_significance: 'Ancient'
        }
    },
    {
        nameAr: 'نحل كرنيولي',
        nameEn: 'Carniolan',
        origin: 'Europe (Slovenia)',
        aggressionLevel: 'Low',
        hardiness: 'Medium',
        productivity: 'Very High',
        characteristics: {
            wintering_ability: 'Excellent',
            propolis_production: 'Low',
            gentleness: 'Very Gentle'
        }
    },
    {
        nameAr: 'نحل إيطالي',
        nameEn: 'Italian',
        origin: 'Europe (Italy)',
        aggressionLevel: 'Low',
        hardiness: 'Low',
        productivity: 'High',
        characteristics: {
            brood_rearing: 'Excellent',
            robbing_tendency: 'High',
            color: 'Light Yellow'
        }
    },
    {
        nameAr: 'نحل أفريقي',
        nameEn: 'African Bee (Scutellata)',
        origin: 'Africa',
        aggressionLevel: 'Very High',
        hardiness: 'Very High',
        productivity: 'High',
        characteristics: {
            defensiveness: 'Extreme',
            foraging_range: 'Long'
        }
    },
    {
        nameAr: 'نحل أسيوي',
        nameEn: 'Asian Bee (Cerana)',
        origin: 'Asia',
        aggressionLevel: 'Medium',
        hardiness: 'High',
        productivity: 'Medium',
        characteristics: {
            varroa_resistance: 'Natural',
            size: 'Small'
        }
    }
];

async function main() {
    console.log('🐝 Seeding Bee Breeds...');

    for (const breed of beeBreeds) {
        const existing = await prisma.beeBreed.findFirst({
            where: { nameEn: breed.nameEn }
        });

        if (!existing) {
            await prisma.beeBreed.create({
                data: breed,
            });
            console.log(`✅ Created: ${breed.nameEn}`);
        } else {
            console.log(`⏩ Skipped (Exists): ${breed.nameEn}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
