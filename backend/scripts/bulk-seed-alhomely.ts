
import { PrismaClient, ApiaryType, HiveStatus, HarvestUnit, InspectionType, OverallAssessment, ActionType, FinancialType, ApiaryOperationType, FindingType, Severity, WeatherSource, FeedingLocation, FeedingContentType, FeedingPurpose } from '@prisma/client';

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Configuration
const ACCOUNTS = ['alhomely@gmail.com', 'alhomely2@gmail.com', 'alhomely3@gmail.com', 'alhomely4@gmail.com', 'alhomely5@gmail.com'];
const PASSWORD_PLAIN = '123456';
const YEARS = [2023, 2024, 2025];
const BATCH_SIZE_INSPECTIONS = 1000;
const HARVEST_UNIT = 'KG';


// Regions Configuration
const REGIONS = [
    { name: 'Asir (Abha)', lat: 18.216, lng: 42.505, elevation: 2200, climate: 'COOL_RAINY' },
    { name: 'Riyadh', lat: 24.713, lng: 46.675, elevation: 600, climate: 'HOT_DRY' },
    { name: 'Jazan', lat: 16.889, lng: 42.551, elevation: 10, climate: 'HUMID_MODERATE' }
];

async function main() {
    console.log('🚀 Starting Bulk Seeding for Alhomely Accounts...');

    // 1. Ensure Password Hash
    const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10);

    // 2. Get/Create BeeBreed
    let breed = await prisma.beeBreed.findFirst();
    if (!breed) {
        breed = await prisma.beeBreed.create({
            data: {
                nameAr: 'نحل بلدي',
                nameEn: 'Local Bee (Baladi)',
                description: 'سلالة محلية متكيفة مع ظروف المنطقة',
                origin: 'Saudi Arabia'
            }
        });
        console.log('✅ Created BeeBreed:', breed.nameEn);
    }

    // 3. Get HiveType
    const hiveType = await prisma.hiveType.findFirst({
        where: { nameEn: { contains: 'Langstroth', mode: 'insensitive' } }
    });
    if (!hiveType) throw new Error('Langstroth HiveType not found. Please seed standard types first.');

    for (const email of ACCOUNTS) {
        console.log(`\n👤 Processing User: ${email}`);
        
        // Ensure User Profile
        let user = await prisma.userProfile.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.userProfile.create({
                data: {
                    email,
                    fullName: email.split('@')[0],
                    password: passwordHash,
                    authId: uuidv4(),
                    userType: 'OWNER',
                    language: 'ar'
                }
            });
            console.log('   ✅ Created User');
        }

        // Loop through 3 Apiaries for this user (one in each region)
        for (let i = 0; i < REGIONS.length; i++) {
            const region = REGIONS[i];
            const apiaryName = `منحل ${region.name} - ${user.fullName}`;
            
            let apiary = await prisma.apiary.findFirst({
                where: { name: apiaryName, ownerId: user.id }
            });

            if (!apiary) {
                apiary = await prisma.apiary.create({
                    data: {
                        name: apiaryName,
                        ownerId: user.id,
                        type: i === 1 ? 'STATIONARY' : 'MIGRATORY',
                        locationLat: region.lat,
                        locationLng: region.lng,
                        elevation: region.elevation,
                        establishedDate: new Date('2022-12-01'),
                        isActive: true
                    }
                });
                console.log(`   🏞️ Created Apiary: ${apiaryName}`);
            }

            // Create 100 Hives if they don't exist
            const existingHives = await prisma.hive.count({ where: { apiaryId: apiary.id } });
            if (existingHives < 100) {
                const hivesToCreate = 100 - existingHives;
                console.log(`   🐝 Creating ${hivesToCreate} hives for ${apiaryName}...`);
                
                const hiveDataArray: any[] = Array.from({ length: hivesToCreate }).map((_, idx) => ({
                    apiaryId: apiary.id,
                    hiveNumber: `H-${(existingHives + idx + 1).toString().padStart(3, '0')}`,
                    hiveTypeId: hiveType.id,
                    beeBreedId: breed!.id,
                    status: 'ACTIVE' as HiveStatus,
                    strengthScore: 80,
                    installationDate: new Date('2022-12-15')
                }));


                await prisma.hive.createMany({ data: hiveDataArray });
            }

            // --- History Generation logic ---
            await generateHistory(apiary, region, user.id);
        }
    }

    console.log('\n🏁 Bulk Seeding Completed Successfully!');
}

/**
 * Generates 3 years of weekly history for an apiary
 */
async function generateHistory(apiary: any, region: any, ownerId: string) {
    console.log(`      ⏳ Generating 3 years of history for ${apiary.name}...`);
    
    const hives = await prisma.hive.findMany({ where: { apiaryId: apiary.id } });
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2025-12-31');

    // 1. Generate Daily Weather Data (in memory first, then batch)
    const weatherDataBatch: any[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        weatherDataBatch.push(generateWeatherForDate(apiary.id, currentDate, region.climate, ownerId));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    await prisma.weatherData.createMany({ data: weatherDataBatch, skipDuplicates: true });
    console.log(`         🌦️  Inserted ${weatherDataBatch.length} weather records`);

    // 2. State Management for Hives (Health/Issues)
    const hiveStates = new Map<string, { inTrouble: boolean, weekCount: number, issueType: string }>();
    hives.forEach(h => hiveStates.set(h.id, { inTrouble: false, weekCount: 0, issueType: '' }));

    // 3. Weekly Inspections Loop
    let inspectionBatch: any[] = [];
    let findingBatch: any[] = [];
    let actionBatch: any[] = [];
    let operationBatch: any[] = [];

    const weeks = 156; // 3 years * 52
    for (let w = 0; w < weeks; w++) {
        const weekDate = new Date(startDate);
        weekDate.setDate(weekDate.getDate() + (w * 7));

        for (const hive of hives) {
            const state = hiveStates.get(hive.id)!;
            let diseasesDetected = false;
            let overallScore = 80;
            let inspectionId = uuidv4();

            // Logic: 2% chance to get sick if healthy
            if (!state.inTrouble && Math.random() < 0.02) {
                state.inTrouble = true;
                state.weekCount = 0;
                state.issueType = Math.random() > 0.5 ? 'VARROA' : 'NOSEMA';
            }

            if (state.inTrouble) {
                state.weekCount++;
                if (state.weekCount === 1) {
                    // WEEK 1: DETECTED
                    diseasesDetected = true;
                    overallScore = 40;
                    findingBatch.push({
                        id: uuidv4(),
                        inspectionId: inspectionId,
                        findingType: 'DISEASE',
                        severity: 'HIGH',
                        title: `إصابة بـ ${state.issueType}`,
                        description: `تم اكتشاف علامات ${state.issueType} في الحضنة`
                    });
                } else if (state.weekCount === 2) {
                    // WEEK 2: TREATED
                    overallScore = 45; // Just started treatment
                    actionBatch.push({
                        inspectionId: inspectionId,
                        actionType: 'TREATED',
                        description: `تم وضع شرائط المعالجة لـ ${state.issueType}`
                    });
                    operationBatch.push({
                        apiaryId: apiary.id,
                        operationNumber: Math.floor(Math.random() * 100000), // Random placeholder
                        operationType: 'TREATMENT',
                        hiveId: hive.id,
                        description: `علاج كيميائي طارئ لـ ${state.issueType}`,
                        operationDate: weekDate,
                        performedBy: ownerId
                    });
                } else if (state.weekCount >= 5) {
                    // WEEK 5: FIXED
                    state.inTrouble = false;
                    overallScore = 80;
                } else {
                    // WEEKS 3-4: RECOVERING
                    overallScore = 45 + (state.weekCount * 10);
                }
            }

            inspectionBatch.push({
                id: inspectionId,
                hiveId: hive.id,
                apiaryId: apiary.id,
                inspectionDate: weekDate,
                inspectionType: 'ROUTINE',
                overallAssessment: getAssessment(overallScore),
                overallScore: overallScore,
                diseasesDetected: diseasesDetected,
                inspectedBy: ownerId
            });

            // Batch execution
            if (inspectionBatch.length >= BATCH_SIZE_INSPECTIONS) {
                await flushBatches(inspectionBatch, findingBatch, actionBatch, operationBatch);
                inspectionBatch = []; findingBatch = []; actionBatch = []; operationBatch = [];
            }
        }

        // Add periodic Harvests (April and October)
        const month = weekDate.getMonth();
        if ((month === 3 || month === 9) && weekDate.getDate() <= 7) { // First week of April/Oct
            console.log(`         🍯 Recording Harvest for ${weekDate.toDateString()}...`);
            const harvestRecordId = uuidv4();
            await prisma.harvestRecord.create({
                data: {
                    id: harvestRecordId,
                    apiaryId: apiary.id,
                    harvestType: 'HONEY',
                    harvestDate: weekDate,
                    totalQuantity: 1000, // 10kg * 100 hives
                    unit: 'KG',
                    harvestedBy: ownerId,
                    honeyHarvests: {
                        createMany: {
                            data: hives.map(h => ({
                                hiveId: h.id,
                                quantityKg: 10 + Math.random() * 5,
                                botanicalSource: month === 3 ? 'Sidr' : 'Wildflower'
                            }))
                        }
                    }
                }
            });
        }

        // Add Feeding in Winter (Dec, Jan)
        if ((month === 11 || month === 0) && weekDate.getDate() <= 7) {
            await prisma.feedingRecord.createMany({
                data: hives.map(h => ({
                    apiaryId: apiary.id,
                    hiveId: h.id,
                    feedingDate: weekDate,
                    feedingLocation: 'INTERNAL' as FeedingLocation,
                    contentType: 'SUGAR_SYRUP' as FeedingContentType,
                    purpose: 'STIMULATION' as FeedingPurpose,
                    fedBy: ownerId
                }))
            });
        }

    }


    // Final flush
    await flushBatches(inspectionBatch, findingBatch, actionBatch, operationBatch);
}

function generateWeatherForDate(apiaryId: string, date: Date, climate: string, recordedBy: string) {
    let temp = 25;
    let hum = 50;
    const month = date.getMonth();

    if (climate === 'HOT_DRY') {
        temp = month >= 5 && month <= 8 ? 40 + Math.random() * 5 : 20 + Math.random() * 10;
        hum = 10 + Math.random() * 10;
    } else if (climate === 'COOL_RAINY') {
        temp = month >= 5 && month <= 8 ? 15 + Math.random() * 5 : 5 + Math.random() * 5;
        hum = 60 + Math.random() * 20;
    } else {
        temp = 25 + Math.random() * 10;
        hum = 60 + Math.random() * 20;
    }

    return {
        apiaryId,
        date: new Date(date),
        source: 'SENSOR' as WeatherSource,
        temperatureCelsius: temp,
        humidityPercentage: Math.round(hum),
        recordedBy
    };

}

function getAssessment(score: number): OverallAssessment {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 50) return 'FAIR';
    if (score >= 30) return 'POOR';
    return 'CRITICAL';
}

async function flushBatches(inspections: any[], findings: any[], actions: any[], operations: any[]) {
    if (inspections.length > 0) await prisma.inspection.createMany({ data: inspections });
    if (findings.length > 0) await prisma.inspectionFinding.createMany({ data: findings });
    if (actions.length > 0) await prisma.inspectionAction.createMany({ data: actions });
    if (operations.length > 0) {
        // Handle operationNumber sequentially per apiary logic
        // If apiaryOperation is missing from client, we'll try to cast to 'any'
        const p = prisma as any;
        if (p.apiaryOperation) {
            await p.apiaryOperation.createMany({ 
                data: operations.map(op => ({
                    ...op,
                    operationNumber: Math.floor(Math.random() * 10000000)
                })), 
                skipDuplicates: true 
            });
        } else {
            console.warn('⚠️ ApiaryOperation model not found in Prisma Client. Skipping operation insertion.');
        }
    }
}



main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
