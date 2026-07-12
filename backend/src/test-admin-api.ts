import { adminDiseaseService } from './services/admin-disease.service';
import { logger } from './utils/logger';

async function runTest() {
    logger.info('🧪 Starting Admin Disease Service Integration Test...\n');

    // 1. Create a disease
    logger.info('1. Creating a test disease...');
    const disease = await adminDiseaseService.createDisease({
        nameAr: 'مرض تعفن الحضنة الأمريكي',
        nameEn: 'American Foulbrood',
        scientificName: 'Paenibacillus larvae',
        diseaseType: 'BACTERIAL',
        severity: 'SEVERE',
        contagiousness: 'HIGH',
        mortalityRate: 90,
        symptoms: ['يرقات ميتة بنية اللون', 'رائحة كريهة تشبه الغراء', 'غطاء حضنة مثقوب ومقعر'],
        diagnosisMethods: ['فحص عود الثقاب', 'اختبار شريط التشخيص السريع'],
        treatable: true,
        burningRequired: true,
        quarantineRequired: true,
        quarantineDurationDays: 30,
        reportingMandatory: true,
        preventionMethods: ['الحفاظ على خلايا قوية', 'تطهير الأدوات بشكل مستمر'],
    });
    logger.info('👉 Disease created successfully with ID:', disease.id);

    // 2. Create treatments for this disease
    logger.info('\n2. Creating a test treatment...');
    const treatment = await adminDiseaseService.createTreatment(disease.id, {
        nameAr: 'مضاد حيوي تيراميسين',
        nameEn: 'Terramycin Soluble Powder',
        description: 'مضاد حيوي لمعالجة ومنع تعفن الحضنة البكتيري.',
        type: 'CHEMICAL',
        applicationMethod: 'الغبار الجاف فوق حواف إطارات التربية',
        dosage: '200 ملغ لكل خلية',
        durationDays: 21,
        frequency: 'مرة واحدة في الأسبوع لمدة 3 أسابيع',
        season: ['SPRING', 'AUTUMN'],
        temperatureMin: 15,
        temperatureMax: 30,
        honeySafe: false,
        withdrawalPeriod: 42, // 6 weeks before honey flow
        effectiveness: 85
    });
    logger.info('👉 Treatment created successfully with ID:', treatment.id);

    // 3. Fetch all diseases to check if they load together with treatments
    logger.info('\n3. Fetching all diseases from the library with their treatments...');
    const allDiseases = await adminDiseaseService.getAllDiseases();
    logger.info(`👉 Total diseases in database: ${allDiseases.length}`);
    
    const foundDisease = allDiseases.find(d => d.id === disease.id);
    if (foundDisease) {
        logger.info('✨ Verification Succeeded!');
        logger.info('   Disease Name:', foundDisease.nameAr);
        logger.info('   Associated Treatments Count:', foundDisease.treatments.length);
        logger.info('   Associated Treatment Name:', foundDisease.treatments[0]?.nameAr);
    } else {
        logger.error('❌ Created disease was not found in the list!');
    }

    // 4. Clean up test data
    logger.info('\n4. Cleaning up test data...');
    await adminDiseaseService.deleteDisease(disease.id);
    logger.info('👉 Test data cleaned up successfully.');
}

runTest()
    .then(() => logger.info('\n🎉 Test completed successfully! All backend services are functional.'))
    .catch(err => {
        logger.error('❌ Test failed:', err);
        process.exit(1);
    });
