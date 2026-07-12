
import { PrismaClient, DiseaseType, DiseaseSeverity, Contagiousness, TreatmentType } from '@prisma/client';

const prisma = new PrismaClient();

const diseases = [
    {
        nameAr: 'فاروا المدمرة',
        nameEn: 'Varroa Destructor',
        scientificName: 'Varroa destructor',
        diseaseType: 'PEST' as DiseaseType,
        severity: 'SEVERE' as DiseaseSeverity,
        contagiousness: 'HIGH' as Contagiousness,
        symptoms: {
            en: ['Deformed wings', 'Mites visible on larvae', 'Spotty brood'],
            ar: ['تشوه الأجنحة', 'رؤية الحلم على اليرقات', 'حضانة مثقبة']
        },
        treatments: [
            {
                nameAr: 'شرائط الأبستان',
                nameEn: 'Apistan Strips',
                type: TreatmentType.CHEMICAL,
                applicationMethod: 'Insert strips between brood frames',
                durationDays: 42,
                season: ['SPRING', 'FALL'],
                temperatureMin: 15,
                honeySafe: false,
                withdrawalPeriod: 14 // days
            },
            {
                nameAr: 'أوكساليك أسيد (تبخير)',
                nameEn: 'Oxalic Acid Vaporization',
                type: TreatmentType.ORGANIC,
                applicationMethod: 'Vaporization',
                frequency: 'Once when broodless',
                season: ['WINTER'],
                honeySafe: true,
                temperatureMin: 5
            }
        ]
    },
    {
        nameAr: 'تعفن الحضنة الأمريكي',
        nameEn: 'American Foulbrood (AFB)',
        scientificName: 'Paenibacillus larvae',
        diseaseType: 'BACTERIAL' as DiseaseType,
        severity: 'CATASTROPHIC' as DiseaseSeverity,
        contagiousness: 'EXTREMELY_HIGH' as Contagiousness,
        burningRequired: true,
        reportingMandatory: true,
        symptoms: {
            en: ['Ropiness test positive', 'Scale in cells', 'Foul smell'],
            ar: ['اختبار اللزوجة إيجابي', 'قشور في العيون', 'رائحة كريهة']
        },
        treatments: [
            {
                nameAr: 'حرق الخلية',
                nameEn: 'Burning',
                description: 'Complete destruction of hive and bees',
                type: TreatmentType.PHYSICAL,
                applicationMethod: 'Fire',
                effectiveness: 100
            }
        ]
    },
    {
        nameAr: 'نوزيما',
        nameEn: 'Nosema',
        scientificName: 'Nosema apis/ceranae',
        diseaseType: 'FUNGAL' as DiseaseType,
        severity: 'MODERATE' as DiseaseSeverity,
        contagiousness: 'MEDIUM' as Contagiousness,
        symptoms: {
            en: ['Dysentery', 'Crawling bees', 'Weak colony'],
            ar: ['إسهال', 'زحف النحل', 'ضعف الطائفة']
        },
        treatments: [
            {
                nameAr: 'تغذية مع مكملات',
                nameEn: 'Feeding with supplements',
                type: TreatmentType.DIETARY,
                applicationMethod: 'Syrup feeding',
                season: ['SPRING'],
                honeySafe: true
            },
            {
                nameAr: 'فيوماجيلين (تاريخي)',
                nameEn: 'Fumagillin',
                type: TreatmentType.CHEMICAL,
                applicationMethod: 'Syrup drench',
                honeySafe: false,
                withdrawalPeriod: 30
            }
        ]
    },
    {
        nameAr: 'دودة الشمع',
        nameEn: 'Wax Moth',
        scientificName: 'Galleria mellonella',
        diseaseType: 'PEST' as DiseaseType,
        severity: 'MODERATE' as DiseaseSeverity,
        contagiousness: 'LOW' as Contagiousness,
        symptoms: {
            en: ['Webbing on combs', 'Tunnels in wax', 'Cocoons on frames'],
            ar: ['خيوط عنكبوتية على الإطارات', 'أنفاق في الشمع', 'شرانق']
        },
        treatments: [
            {
                nameAr: 'تجميد الإطارات',
                nameEn: 'Freezing Frames',
                type: TreatmentType.PHYSICAL,
                applicationMethod: 'Freezer for 48h',
                honeySafe: true
            },
            {
                nameAr: 'مكافحة حيوية (B401)',
                nameEn: 'B401 (Certan)',
                type: TreatmentType.BIOLOGICAL,
                applicationMethod: 'Spray on combs',
                honeySafe: true
            }
        ]
    }
];

async function main() {
    console.log('🦠 Seeding Diseases & Treatments...');

    for (const disease of diseases) {
        const treatments = disease.treatments;
        // Remove treatments from data object before creation
        const { treatments: _, ...diseaseData } = disease;

        const existing = await prisma.diseaseLibrary.findFirst({
            where: { nameEn: disease.nameEn }
        });

        let diseaseId = existing?.id;

        if (!existing) {
            const created = await prisma.diseaseLibrary.create({
                data: diseaseData,
            });
            diseaseId = created.id;
            console.log(`✅ Created Disease: ${disease.nameEn}`);
        } else {
            console.log(`⏩ Skipped Disease (Exists): ${disease.nameEn}`);
        }

        // Add Treatments if disease exists (newly created or found)
        if (diseaseId) {
            for (const treatment of treatments) {
                const existingTx = await prisma.diseaseTreatment.findFirst({
                    where: {
                        diseaseId: diseaseId,
                        nameEn: treatment.nameEn
                    }
                });

                if (!existingTx) {
                    await prisma.diseaseTreatment.create({
                        data: {
                            ...treatment,
                            diseaseId: diseaseId
                        }
                    });
                    console.log(`   💊 Added Treatment: ${treatment.nameEn}`);
                }
            }
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
