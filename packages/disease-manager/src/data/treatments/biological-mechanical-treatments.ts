/**
 * قاعدة بيانات العلاجات البيولوجية والميكانيكية
 * Biological and Mechanical Treatments Database
 */

import {
  Treatment,
  TreatmentType,
  ApplicationMethod,
  MeasurementUnit,
} from '../../types/treatment';

/**
 * العلاجات البيولوجية والميكانيكية
 * Biological and Mechanical Treatments
 */
export const biologicalMechanicalTreatments: Treatment[] = [
  // 1. Drone Brood Removal - إزالة حضنة الذكور
  {
    id: 'mech-001',
    name: {
      ar: 'إزالة حضنة الذكور',
      en: 'Drone Brood Removal',
      fr: 'Retrait du Couvain de Mâles',
    },
    description: {
      ar: 'طريقة ميكانيكية فعالة لتقليل أعداد الفاروا. يتم وضع إطار خاص لحضنة الذكور، وعندما يتم تغطيته يتم إزالته وتجميده لقتل الفاروا. الفاروا تفضل حضنة الذكور 10 مرات أكثر من حضنة الشغالات.',
      en: 'Effective mechanical method to reduce Varroa numbers. A special drone frame is placed, and when capped it is removed and frozen to kill Varroa. Varroa prefer drone brood 10 times more than worker brood.',
      fr: 'Méthode mécanique efficace pour réduire le nombre de varroas. Un cadre spécial pour mâles est placé, et une fois operculé il est retiré et congelé pour tuer les varroas. Les varroas préfèrent le couvain de mâles 10 fois plus que celui des ouvrières.',
    },
    type: TreatmentType.MECHANICAL,
    applicationMethod: ApplicationMethod.MECHANICAL,
    dosage: {
      amount: 1,
      unit: MeasurementUnit.PIECES,
      perHive: true,
      frequency: 1,
      notes: {
        ar: 'إطار واحد لحضنة الذكور، يتم إزالته كل 24 يوم',
        en: 'One drone frame, removed every 24 days',
        fr: 'Un cadre à mâles, retiré tous les 24 jours',
      },
    },
    duration: {
      months: 3,
      description: {
        ar: 'يستمر طوال موسم النشاط (3-4 أشهر)',
        en: 'Continues throughout active season (3-4 months)',
        fr: 'Continue pendant toute la saison active (3-4 mois)',
      },
    },
    cost: {
      price: 10,
      currency: 'USD',
      perUnit: MeasurementUnit.PIECES,
      perHive: 10,
      perCycle: 10,
      notes: {
        ar: 'تكلفة الإطار فقط، يمكن إعادة استخدامه',
        en: 'Frame cost only, reusable',
        fr: 'Coût du cadre uniquement, réutilisable',
      },
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 3,
    sideEffects: [
      {
        description: {
          ar: 'يقلل من أعداد الذكور في الخلية',
          en: 'Reduces drone population in hive',
          fr: 'Réduit la population de mâles dans la ruche',
        },
        severity: 1,
        probability: 'frequent',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'عدم إزالة كل حضنة الذكور، ترك بعضها للتكاثر',
          en: 'Do not remove all drone brood, leave some for reproduction',
          fr: 'Ne pas retirer tout le couvain de mâles, en laisser pour la reproduction',
        },
        mandatory: true,
        priority: 4,
      },
      {
        description: {
          ar: 'إزالة الإطار عندما يكون مغطى بالكامل',
          en: 'Remove frame when fully capped',
          fr: 'Retirer le cadre lorsqu\'il est complètement operculé',
        },
        mandatory: true,
        priority: 5,
      },
    ],
    requiresPrescription: false,
    organicCertified: true,
    safeForHoney: true,
    recommendedSeason: ['spring', 'summer'],
    optimalTemperature: {
      min: 15,
      max: 35,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 2. Brood Break - كسر دورة الحضنة
  {
    id: 'mech-002',
    name: {
      ar: 'كسر دورة الحضنة',
      en: 'Brood Break',
      fr: 'Rupture du Cycle de Couvain',
    },
    description: {
      ar: 'طريقة ميكانيكية فعالة جداً. يتم حبس الملكة في قفص لمدة 21-25 يوم لإيقاف وضع البيض. عندما تخرج كل الحضنة، يتم معالجة الخلية بعلاج عضوي لقتل الفاروا المتبقية.',
      en: 'Highly effective mechanical method. Queen is caged for 21-25 days to stop egg laying. When all brood emerges, hive is treated with organic treatment to kill remaining Varroa.',
      fr: 'Méthode mécanique très efficace. La reine est mise en cage pendant 21-25 jours pour arrêter la ponte. Lorsque tout le couvain émerge, la ruche est traitée avec un traitement organique pour tuer les varroas restants.',
    },
    type: TreatmentType.MECHANICAL,
    applicationMethod: ApplicationMethod.MECHANICAL,
    dosage: {
      amount: 1,
      unit: MeasurementUnit.PIECES,
      perHive: true,
      notes: {
        ar: 'قفص ملكة واحد لمدة 21-25 يوم',
        en: 'One queen cage for 21-25 days',
        fr: 'Une cage à reine pendant 21-25 jours',
      },
    },
    duration: {
      days: 25,
      description: {
        ar: '21-25 يوم',
        en: '21-25 days',
        fr: '21-25 jours',
      },
    },
    cost: {
      price: 5,
      currency: 'USD',
      perUnit: MeasurementUnit.PIECES,
      perHive: 5,
      perCycle: 5,
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 5,
    sideEffects: [
      {
        description: {
          ar: 'توقف إنتاج الحضنة مؤقتاً',
          en: 'Temporary stop in brood production',
          fr: 'Arrêt temporaire de la production de couvain',
        },
        severity: 2,
        probability: 'frequent',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'استخدامه في الصيف أو أوائل الخريف فقط',
          en: 'Use only in summer or early fall',
          fr: 'Utiliser uniquement en été ou début d\'automne',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'التأكد من وجود غذاء كافي في الخلية',
          en: 'Ensure sufficient food in hive',
          fr: 'Assurer une nourriture suffisante dans la ruche',
        },
        mandatory: true,
        priority: 5,
      },
    ],
    requiresPrescription: false,
    organicCertified: true,
    safeForHoney: true,
    recommendedSeason: ['summer', 'fall'],
    optimalTemperature: {
      min: 20,
      max: 35,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 3. Thermal Treatment - العلاج الحراري
  {
    id: 'therm-001',
    name: {
      ar: 'العلاج الحراري',
      en: 'Thermal Treatment',
      fr: 'Traitement Thermique',
    },
    description: {
      ar: 'علاج حراري يستخدم درجات حرارة عالية (40-42 درجة مئوية) لقتل الفاروا دون الإضرار بالنحل. يتطلب معدات خاصة ولكنه فعال جداً وآمن تماماً.',
      en: 'Thermal treatment using high temperatures (40-42°C) to kill Varroa without harming bees. Requires special equipment but is highly effective and completely safe.',
      fr: 'Traitement thermique utilisant des températures élevées (40-42°C) pour tuer les varroas sans nuire aux abeilles. Nécessite un équipement spécial mais est très efficace et totalement sûr.',
    },
    type: TreatmentType.THERMAL,
    applicationMethod: ApplicationMethod.THERMAL,
    dosage: {
      amount: 1,
      unit: MeasurementUnit.PIECES,
      perHive: true,
      notes: {
        ar: 'جلسة واحدة لمدة 2-3 ساعات عند 40-42 درجة مئوية',
        en: 'One session for 2-3 hours at 40-42°C',
        fr: 'Une séance de 2-3 heures à 40-42°C',
      },
    },
    duration: {
      days: 1,
      description: {
        ar: 'جلسة واحدة',
        en: 'Single session',
        fr: 'Séance unique',
      },
    },
    cost: {
      price: 50,
      currency: 'USD',
      perHive: 50,
      perCycle: 50,
      notes: {
        ar: 'يتطلب معدات خاصة (صندوق حراري)',
        en: 'Requires special equipment (thermal box)',
        fr: 'Nécessite un équipement spécial (boîte thermique)',
      },
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 4,
    sideEffects: [],
    precautions: [
      {
        description: {
          ar: 'استخدام معدات معتمدة فقط',
          en: 'Use certified equipment only',
          fr: 'Utiliser uniquement un équipement certifié',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'مراقبة درجة الحرارة بدقة',
          en: 'Monitor temperature precisely',
          fr: 'Surveiller la température avec précision',
        },
        mandatory: true,
        priority: 5,
      },
    ],
    requiresPrescription: false,
    organicCertified: true,
    safeForHoney: true,
    recommendedSeason: ['spring', 'summer', 'fall'],
    optimalTemperature: {
      min: 15,
      max: 35,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 4. Sugar Dusting - رش السكر البودرة
  {
    id: 'mech-003',
    name: {
      ar: 'رش السكر البودرة',
      en: 'Sugar Dusting',
      fr: 'Saupoudrage de Sucre',
    },
    description: {
      ar: 'طريقة ميكانيكية بسيطة وآمنة. يتم رش السكر البودرة على النحل، مما يجعلهم يقومون بتنظيف أنفسهم وبعضهم البعض، وبالتالي إسقاط الفاروا. فعالية متوسطة لكنه آمن تماماً.',
      en: 'Simple and safe mechanical method. Powdered sugar is dusted on bees, causing them to groom themselves and each other, thus dislodging Varroa. Moderate effectiveness but completely safe.',
      fr: 'Méthode mécanique simple et sûre. Le sucre en poudre est saupoudré sur les abeilles, les amenant à se toiletter mutuellement, délogeant ainsi les varroas. Efficacité modérée mais totalement sûr.',
    },
    type: TreatmentType.MECHANICAL,
    applicationMethod: ApplicationMethod.POWDER,
    dosage: {
      amount: 50,
      unit: MeasurementUnit.G,
      perHive: true,
      frequency: 1,
      notes: {
        ar: '50 جرام سكر بودرة لكل خلية، مرة واحدة أسبوعياً',
        en: '50g powdered sugar per hive, once weekly',
        fr: '50g de sucre en poudre par ruche, une fois par semaine',
      },
    },
    duration: {
      weeks: 4,
      description: {
        ar: '4 أسابيع (جرعة أسبوعية)',
        en: '4 weeks (weekly dose)',
        fr: '4 semaines (dose hebdomadaire)',
      },
    },
    cost: {
      price: 2,
      currency: 'USD',
      perHive: 2,
      perCycle: 8,
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 2,
    sideEffects: [],
    precautions: [
      {
        description: {
          ar: 'استخدام سكر بودرة نقي بدون إضافات',
          en: 'Use pure powdered sugar without additives',
          fr: 'Utiliser du sucre en poudre pur sans additifs',
        },
        mandatory: true,
        priority: 4,
      },
    ],
    requiresPrescription: false,
    organicCertified: true,
    safeForHoney: true,
    recommendedSeason: ['spring', 'summer', 'fall'],
    optimalTemperature: {
      min: 15,
      max: 35,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },
];
