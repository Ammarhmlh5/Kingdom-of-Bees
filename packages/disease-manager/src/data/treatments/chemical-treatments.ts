/**
 * قاعدة بيانات العلاجات الكيميائية
 * Chemical Treatments Database
 */

import {
  Treatment,
  TreatmentType,
  ApplicationMethod,
  MeasurementUnit,
} from '../../types/treatment';

/**
 * العلاجات الكيميائية الشائعة
 * Common Chemical Treatments
 */
export const chemicalTreatments: Treatment[] = [
  // 1. Apistan (Fluvalinate) - لعلاج الفاروا
  {
    id: 'chem-001',
    name: {
      ar: 'أبيستان',
      en: 'Apistan',
      fr: 'Apistan',
    },
    tradeName: {
      ar: 'أبيستان',
      en: 'Apistan',
      fr: 'Apistan',
    },
    activeIngredient: {
      ar: 'فلوفالينات (Fluvalinate)',
      en: 'Fluvalinate',
      fr: 'Fluvalinate',
    },
    description: {
      ar: 'علاج كيميائي فعال لمكافحة طفيل الفاروا. يأتي على شكل شرائط بلاستيكية تعلق داخل الخلية. يعمل عن طريق ملامسة النحل للشرائط ونقل المادة الفعالة إلى باقي الخلية.',
      en: 'Effective chemical treatment for Varroa mite control. Comes as plastic strips hung inside the hive. Works through bee contact with strips and transfer of active ingredient throughout the colony.',
      fr: 'Traitement chimique efficace contre le varroa. Se présente sous forme de lanières plastiques suspendues dans la ruche. Fonctionne par contact des abeilles avec les lanières et transfert du principe actif dans toute la colonie.',
    },
    type: TreatmentType.CHEMICAL,
    applicationMethod: ApplicationMethod.STRIPS,
    dosage: {
      amount: 2,
      unit: MeasurementUnit.STRIPS,
      perHive: true,
      notes: {
        ar: 'شريطان لكل خلية، يعلقان بين الإطارات في منطقة الحضنة',
        en: 'Two strips per hive, hung between frames in brood area',
        fr: 'Deux lanières par ruche, suspendues entre les cadres dans la zone de couvain',
      },
    },
    duration: {
      weeks: 6,
      description: {
        ar: '6 أسابيع (42 يوم)',
        en: '6 weeks (42 days)',
        fr: '6 semaines (42 jours)',
      },
    },
    safetyPeriod: {
      days: 14,
      legallyRequired: true,
      notes: {
        ar: 'يجب إزالة الشرائط قبل 14 يوم على الأقل من وضع العاسلات',
        en: 'Strips must be removed at least 14 days before adding honey supers',
        fr: 'Les lanières doivent être retirées au moins 14 jours avant la pose des hausses',
      },
    },
    cost: {
      price: 25,
      currency: 'USD',
      perUnit: MeasurementUnit.STRIPS,
      perHive: 25,
      perCycle: 25,
      notes: {
        ar: 'السعر تقريبي ويختلف حسب المنطقة والموزع',
        en: 'Price is approximate and varies by region and distributor',
        fr: 'Le prix est approximatif et varie selon la région et le distributeur',
      },
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 4,
    sideEffects: [
      {
        description: {
          ar: 'قد يسبب مقاومة للفاروا عند الاستخدام المتكرر',
          en: 'May cause Varroa resistance with repeated use',
          fr: 'Peut causer une résistance du varroa en cas d\'utilisation répétée',
        },
        severity: 3,
        probability: 'common',
      },
      {
        description: {
          ar: 'قد يتراكم في الشمع',
          en: 'May accumulate in wax',
          fr: 'Peut s\'accumuler dans la cire',
        },
        severity: 2,
        probability: 'frequent',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'عدم استخدامه أثناء فترة جمع العسل',
          en: 'Do not use during honey flow',
          fr: 'Ne pas utiliser pendant la miellée',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'إزالة الشرائط بعد 6 أسابيع بالضبط',
          en: 'Remove strips after exactly 6 weeks',
          fr: 'Retirer les lanières après exactement 6 semaines',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'عدم استخدامه أكثر من مرتين في السنة',
          en: 'Do not use more than twice per year',
          fr: 'Ne pas utiliser plus de deux fois par an',
        },
        mandatory: true,
        priority: 4,
      },
    ],
    storage: {
      temperature: {
        min: 5,
        max: 25,
      },
      awayFromLight: true,
      dryPlace: true,
      coolPlace: true,
      notes: {
        ar: 'يحفظ في مكان بارد وجاف بعيداً عن الضوء المباشر',
        en: 'Store in cool, dry place away from direct light',
        fr: 'Conserver dans un endroit frais et sec à l\'abri de la lumière directe',
      },
    },
    requiresPrescription: false,
    organicCertified: false,
    safeForHoney: false,
    recommendedSeason: ['spring', 'fall'],
    optimalTemperature: {
      min: 10,
      max: 30,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 2. Apivar (Amitraz) - لعلاج الفاروا
  {
    id: 'chem-002',
    name: {
      ar: 'أبيفار',
      en: 'Apivar',
      fr: 'Apivar',
    },
    tradeName: {
      ar: 'أبيفار',
      en: 'Apivar',
      fr: 'Apivar',
    },
    activeIngredient: {
      ar: 'أميتراز (Amitraz)',
      en: 'Amitraz',
      fr: 'Amitraz',
    },
    description: {
      ar: 'علاج كيميائي حديث وفعال جداً لمكافحة الفاروا. يأتي على شكل شرائط بلاستيكية. يتميز بفعالية عالية ومقاومة أقل من العلاجات الأخرى.',
      en: 'Modern and highly effective chemical treatment for Varroa control. Comes as plastic strips. Features high effectiveness and less resistance than other treatments.',
      fr: 'Traitement chimique moderne et très efficace contre le varroa. Se présente sous forme de lanières plastiques. Caractérisé par une grande efficacité et moins de résistance que d\'autres traitements.',
    },
    type: TreatmentType.CHEMICAL,
    applicationMethod: ApplicationMethod.STRIPS,
    dosage: {
      amount: 2,
      unit: MeasurementUnit.STRIPS,
      perHive: true,
      notes: {
        ar: 'شريطان لكل خلية، يعلقان في منطقة الحضنة',
        en: 'Two strips per hive, hung in brood area',
        fr: 'Deux lanières par ruche, suspendues dans la zone de couvain',
      },
    },
    duration: {
      weeks: 6,
      description: {
        ar: '6-8 أسابيع (42-56 يوم)',
        en: '6-8 weeks (42-56 days)',
        fr: '6-8 semaines (42-56 jours)',
      },
    },
    safetyPeriod: {
      days: 0,
      legallyRequired: false,
      notes: {
        ar: 'يمكن استخدامه أثناء فترة جمع العسل في بعض البلدان، لكن يفضل إزالته قبل وضع العاسلات',
        en: 'Can be used during honey flow in some countries, but removal before adding supers is recommended',
        fr: 'Peut être utilisé pendant la miellée dans certains pays, mais le retrait avant la pose des hausses est recommandé',
      },
    },
    cost: {
      price: 30,
      currency: 'USD',
      perUnit: MeasurementUnit.STRIPS,
      perHive: 30,
      perCycle: 30,
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 5,
    sideEffects: [
      {
        description: {
          ar: 'مقاومة أقل مقارنة بالعلاجات الأخرى',
          en: 'Less resistance compared to other treatments',
          fr: 'Moins de résistance par rapport aux autres traitements',
        },
        severity: 1,
        probability: 'rare',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'إزالة الشرائط بعد 6-8 أسابيع',
          en: 'Remove strips after 6-8 weeks',
          fr: 'Retirer les lanières après 6-8 semaines',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'عدم استخدامه مع علاجات أخرى في نفس الوقت',
          en: 'Do not use with other treatments simultaneously',
          fr: 'Ne pas utiliser avec d\'autres traitements simultanément',
        },
        mandatory: true,
        priority: 4,
      },
    ],
    storage: {
      temperature: {
        min: 5,
        max: 25,
      },
      awayFromLight: true,
      dryPlace: true,
      coolPlace: true,
    },
    requiresPrescription: false,
    organicCertified: false,
    safeForHoney: true,
    recommendedSeason: ['spring', 'summer', 'fall'],
    optimalTemperature: {
      min: 10,
      max: 35,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 3. CheckMite+ (Coumaphos) - لعلاج الفاروا
  {
    id: 'chem-003',
    name: {
      ar: 'تشيك مايت بلس',
      en: 'CheckMite+',
      fr: 'CheckMite+',
    },
    tradeName: {
      ar: 'تشيك مايت بلس',
      en: 'CheckMite+',
      fr: 'CheckMite+',
    },
    activeIngredient: {
      ar: 'كوماف وس (Coumaphos)',
      en: 'Coumaphos',
      fr: 'Coumaphos',
    },
    description: {
      ar: 'علاج كيميائي قوي لمكافحة الفاروا. فعال جداً لكن يجب استخدامه بحذر بسبب احتمالية التراكم في الشمع والعسل.',
      en: 'Powerful chemical treatment for Varroa control. Very effective but must be used carefully due to potential accumulation in wax and honey.',
      fr: 'Traitement chimique puissant contre le varroa. Très efficace mais doit être utilisé avec précaution en raison de l\'accumulation potentielle dans la cire et le miel.',
    },
    type: TreatmentType.CHEMICAL,
    applicationMethod: ApplicationMethod.STRIPS,
    dosage: {
      amount: 2,
      unit: MeasurementUnit.STRIPS,
      perHive: true,
      notes: {
        ar: 'شريطان لكل خلية',
        en: 'Two strips per hive',
        fr: 'Deux lanières par ruche',
      },
    },
    duration: {
      weeks: 6,
      description: {
        ar: '6 أسابيع (42 يوم)',
        en: '6 weeks (42 days)',
        fr: '6 semaines (42 jours)',
      },
    },
    safetyPeriod: {
      days: 14,
      legallyRequired: true,
      notes: {
        ar: 'يجب إزالة الشرائط قبل 14 يوم على الأقل من وضع العاسلات',
        en: 'Strips must be removed at least 14 days before adding honey supers',
        fr: 'Les lanières doivent être retirées au moins 14 jours avant la pose des hausses',
      },
    },
    cost: {
      price: 28,
      currency: 'USD',
      perUnit: MeasurementUnit.STRIPS,
      perHive: 28,
      perCycle: 28,
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 5,
    sideEffects: [
      {
        description: {
          ar: 'يتراكم في الشمع بشكل كبير',
          en: 'Accumulates significantly in wax',
          fr: 'S\'accumule considérablement dans la cire',
        },
        severity: 4,
        probability: 'frequent',
      },
      {
        description: {
          ar: 'قد يسبب مقاومة للفاروا',
          en: 'May cause Varroa resistance',
          fr: 'Peut causer une résistance du varroa',
        },
        severity: 3,
        probability: 'common',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'عدم استخدامه أثناء فترة جمع العسل نهائياً',
          en: 'Never use during honey flow',
          fr: 'Ne jamais utiliser pendant la miellée',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'استخدامه فقط كملاذ أخير',
          en: 'Use only as last resort',
          fr: 'Utiliser uniquement en dernier recours',
        },
        mandatory: false,
        priority: 4,
      },
      {
        description: {
          ar: 'تجنب الاستخدام المتكرر',
          en: 'Avoid repeated use',
          fr: 'Éviter l\'utilisation répétée',
        },
        mandatory: true,
        priority: 5,
      },
    ],
    storage: {
      temperature: {
        min: 5,
        max: 25,
      },
      awayFromLight: true,
      dryPlace: true,
      coolPlace: true,
    },
    requiresPrescription: true,
    organicCertified: false,
    safeForHoney: false,
    recommendedSeason: ['fall'],
    optimalTemperature: {
      min: 10,
      max: 30,
    },
    notes: {
      ar: 'ملاحظة: هذا العلاج محظور في بعض البلدان بسبب مخاوف التراكم. تحقق من القوانين المحلية قبل الاستخدام.',
      en: 'Note: This treatment is banned in some countries due to accumulation concerns. Check local regulations before use.',
      fr: 'Note: Ce traitement est interdit dans certains pays en raison de préoccupations d\'accumulation. Vérifiez les réglementations locales avant utilisation.',
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 4. Fumagilin-B - لعلاج النوزيما
  {
    id: 'chem-004',
    name: {
      ar: 'فوماجيلين-بي',
      en: 'Fumagilin-B',
      fr: 'Fumagilin-B',
    },
    tradeName: {
      ar: 'فوماجيلين-بي',
      en: 'Fumagilin-B',
      fr: 'Fumagilin-B',
    },
    activeIngredient: {
      ar: 'فوماجيلين (Fumagillin)',
      en: 'Fumagillin',
      fr: 'Fumagillin',
    },
    description: {
      ar: 'علاج كيميائي فعال لمرض النوزيما. يخلط مع شراب السكر ويقدم للنحل. يعمل على تثبيط نمو طفيل النوزيما في أمعاء النحل.',
      en: 'Effective chemical treatment for Nosema disease. Mixed with sugar syrup and fed to bees. Works by inhibiting Nosema parasite growth in bee intestines.',
      fr: 'Traitement chimique efficace contre la nosémose. Mélangé avec du sirop de sucre et donné aux abeilles. Fonctionne en inhibant la croissance du parasite Nosema dans les intestins des abeilles.',
    },
    type: TreatmentType.CHEMICAL,
    applicationMethod: ApplicationMethod.FEEDING,
    dosage: {
      amount: 1,
      unit: MeasurementUnit.G,
      perHive: true,
      frequency: 1,
      notes: {
        ar: '1 جرام لكل 4 لتر من شراب السكر (1:1)، يقدم على 4 جرعات أسبوعية',
        en: '1 gram per 4 liters of sugar syrup (1:1), given in 4 weekly doses',
        fr: '1 gramme pour 4 litres de sirop de sucre (1:1), donné en 4 doses hebdomadaires',
      },
    },
    duration: {
      weeks: 4,
      description: {
        ar: '4 أسابيع (جرعة واحدة أسبوعياً)',
        en: '4 weeks (one dose weekly)',
        fr: '4 semaines (une dose par semaine)',
      },
    },
    safetyPeriod: {
      days: 30,
      legallyRequired: true,
      notes: {
        ar: 'يجب التوقف عن العلاج قبل 30 يوم من بدء موسم جمع العسل',
        en: 'Treatment must stop 30 days before honey flow begins',
        fr: 'Le traitement doit s\'arrêter 30 jours avant le début de la miellée',
      },
    },
    cost: {
      price: 20,
      currency: 'USD',
      perUnit: MeasurementUnit.G,
      perHive: 20,
      perCycle: 20,
    },
    targetDiseases: ['adult-001'], // Nosema
    effectiveness: 4,
    sideEffects: [
      {
        description: {
          ar: 'قد يؤثر على الملكة إذا استخدم بجرعات عالية',
          en: 'May affect queen if used in high doses',
          fr: 'Peut affecter la reine si utilisé à fortes doses',
        },
        severity: 2,
        probability: 'rare',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'عدم استخدامه أثناء فترة جمع العسل',
          en: 'Do not use during honey flow',
          fr: 'Ne pas utiliser pendant la miellée',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'الالتزام بالجرعة المحددة بدقة',
          en: 'Follow dosage precisely',
          fr: 'Suivre la posologie avec précision',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'تحضير الشراب طازجاً في كل مرة',
          en: 'Prepare fresh syrup each time',
          fr: 'Préparer du sirop frais à chaque fois',
        },
        mandatory: true,
        priority: 4,
      },
    ],
    storage: {
      temperature: {
        min: 2,
        max: 8,
      },
      awayFromLight: true,
      dryPlace: true,
      coolPlace: true,
      notes: {
        ar: 'يحفظ في الثلاجة (2-8 درجة مئوية)',
        en: 'Store in refrigerator (2-8°C)',
        fr: 'Conserver au réfrigérateur (2-8°C)',
      },
    },
    requiresPrescription: true,
    organicCertified: false,
    safeForHoney: false,
    recommendedSeason: ['spring', 'fall'],
    optimalTemperature: {
      min: 10,
      max: 25,
    },
    notes: {
      ar: 'ملاحظة: محظور في بعض البلدان (مثل الاتحاد الأوروبي). تحقق من القوانين المحلية.',
      en: 'Note: Banned in some countries (e.g., European Union). Check local regulations.',
      fr: 'Note: Interdit dans certains pays (par exemple, l\'Union européenne). Vérifiez les réglementations locales.',
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 5. Oxytetracycline (Terramycin) - لعلاج تعفن الحضنة
  {
    id: 'chem-005',
    name: {
      ar: 'أوكسي تتراسيكلين (تيراميسين)',
      en: 'Oxytetracycline (Terramycin)',
      fr: 'Oxytétracycline (Terramycine)',
    },
    tradeName: {
      ar: 'تيراميسين',
      en: 'Terramycin',
      fr: 'Terramycine',
    },
    activeIngredient: {
      ar: 'أوكسي تتراسيكلين (Oxytetracycline)',
      en: 'Oxytetracycline',
      fr: 'Oxytétracycline',
    },
    description: {
      ar: 'مضاد حيوي واسع الطيف لعلاج تعفن الحضنة الأمريكي والأوروبي. يخلط مع السكر البودرة ويرش على الإطارات أو يخلط مع شراب السكر.',
      en: 'Broad-spectrum antibiotic for treating American and European Foulbrood. Mixed with powdered sugar and dusted on frames or mixed with sugar syrup.',
      fr: 'Antibiotique à large spectre pour traiter la loque américaine et européenne. Mélangé avec du sucre en poudre et saupoudré sur les cadres ou mélangé avec du sirop de sucre.',
    },
    type: TreatmentType.CHEMICAL,
    applicationMethod: ApplicationMethod.POWDER,
    dosage: {
      amount: 200,
      unit: MeasurementUnit.MG,
      perHive: true,
      frequency: 1,
      notes: {
        ar: '200 ملغ مخلوطة مع 30 جرام سكر بودرة، 3 جرعات بفاصل 4-5 أيام',
        en: '200 mg mixed with 30g powdered sugar, 3 doses 4-5 days apart',
        fr: '200 mg mélangés avec 30g de sucre en poudre, 3 doses à 4-5 jours d\'intervalle',
      },
    },
    duration: {
      weeks: 2,
      description: {
        ar: 'أسبوعين (3 جرعات)',
        en: '2 weeks (3 doses)',
        fr: '2 semaines (3 doses)',
      },
    },
    safetyPeriod: {
      days: 30,
      legallyRequired: true,
      notes: {
        ar: 'يجب التوقف عن العلاج قبل 30 يوم من وضع العاسلات',
        en: 'Treatment must stop 30 days before adding honey supers',
        fr: 'Le traitement doit s\'arrêter 30 jours avant la pose des hausses',
      },
    },
    cost: {
      price: 15,
      currency: 'USD',
      perUnit: MeasurementUnit.G,
      perHive: 15,
      perCycle: 15,
    },
    targetDiseases: ['brood-001', 'brood-002'], // AFB, EFB
    effectiveness: 3,
    sideEffects: [
      {
        description: {
          ar: 'لا يقضي على الجراثيم، فقط يثبط البكتيريا النشطة',
          en: 'Does not kill spores, only suppresses active bacteria',
          fr: 'Ne tue pas les spores, supprime seulement les bactéries actives',
        },
        severity: 4,
        probability: 'frequent',
      },
      {
        description: {
          ar: 'قد يسبب مقاومة بكتيرية',
          en: 'May cause bacterial resistance',
          fr: 'Peut causer une résistance bactérienne',
        },
        severity: 3,
        probability: 'common',
      },
      {
        description: {
          ar: 'قد يتراكم في العسل والشمع',
          en: 'May accumulate in honey and wax',
          fr: 'Peut s\'accumuler dans le miel et la cire',
        },
        severity: 3,
        probability: 'common',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'عدم استخدامه أثناء فترة جمع العسل',
          en: 'Do not use during honey flow',
          fr: 'Ne pas utiliser pendant la miellée',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'يتطلب وصفة طبية بيطرية في معظم البلدان',
          en: 'Requires veterinary prescription in most countries',
          fr: 'Nécessite une ordonnance vétérinaire dans la plupart des pays',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'لا يستخدم كعلاج وقائي، فقط علاجي',
          en: 'Do not use as preventive, only as treatment',
          fr: 'Ne pas utiliser en prévention, seulement en traitement',
        },
        mandatory: true,
        priority: 4,
      },
    ],
    storage: {
      temperature: {
        min: 5,
        max: 25,
      },
      awayFromLight: true,
      dryPlace: true,
      coolPlace: true,
    },
    requiresPrescription: true,
    organicCertified: false,
    safeForHoney: false,
    recommendedSeason: ['spring', 'fall'],
    optimalTemperature: {
      min: 15,
      max: 30,
    },
    notes: {
      ar: 'تحذير: استخدام المضادات الحيوية يجب أن يكون تحت إشراف بيطري. لا يقضي على جراثيم AFB، لذلك قد يعود المرض. في حالة AFB، يفضل حرق الخلية المصابة.',
      en: 'Warning: Antibiotic use should be under veterinary supervision. Does not kill AFB spores, so disease may return. In AFB cases, burning infected hive is preferred.',
      fr: 'Attention: L\'utilisation d\'antibiotiques doit être sous supervision vétérinaire. Ne tue pas les spores de la loque américaine, donc la maladie peut revenir. En cas de loque américaine, brûler la ruche infectée est préférable.',
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },
];
