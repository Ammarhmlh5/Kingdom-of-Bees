/**
 * قاعدة بيانات العلاجات العضوية
 * Organic Treatments Database
 */

import {
  Treatment,
  TreatmentType,
  ApplicationMethod,
  MeasurementUnit,
} from '../../types/treatment';

/**
 * العلاجات العضوية الشائعة
 * Common Organic Treatments
 */
export const organicTreatments: Treatment[] = [
  // 1. Oxalic Acid - حمض الأوكساليك
  {
    id: 'org-001',
    name: {
      ar: 'حمض الأوكساليك',
      en: 'Oxalic Acid',
      fr: 'Acide Oxalique',
    },
    activeIngredient: {
      ar: 'حمض الأوكساليك (Oxalic Acid)',
      en: 'Oxalic Acid',
      fr: 'Acide Oxalique',
    },
    description: {
      ar: 'علاج عضوي طبيعي وفعال جداً لمكافحة الفاروا. يستخدم بطريقتين: التبخير أو الرش. آمن للنحل عند الاستخدام الصحيح ولا يترك بقايا في العسل.',
      en: 'Natural organic treatment highly effective against Varroa. Used in two methods: vaporization or dripping. Safe for bees when used correctly and leaves no residue in honey.',
      fr: 'Traitement organique naturel très efficace contre le varroa. Utilisé de deux manières: vaporisation ou goutte à goutte. Sûr pour les abeilles lorsqu\'il est utilisé correctement et ne laisse aucun résidu dans le miel.',
    },
    type: TreatmentType.ORGANIC,
    applicationMethod: ApplicationMethod.FUMIGATION,
    dosage: {
      amount: 2,
      unit: MeasurementUnit.G,
      perHive: true,
      notes: {
        ar: '2 جرام لكل خلية (تبخير) أو 5 مل محلول 3.2% بين كل إطارين (رش)',
        en: '2g per hive (vaporization) or 5ml of 3.2% solution between each frame (dripping)',
        fr: '2g par ruche (vaporisation) ou 5ml de solution à 3,2% entre chaque cadre (goutte à goutte)',
      },
    },
    duration: {
      days: 1,
      description: {
        ar: 'جرعة واحدة، يمكن تكرارها بعد 5-7 أيام إذا لزم الأمر',
        en: 'Single dose, can be repeated after 5-7 days if needed',
        fr: 'Dose unique, peut être répétée après 5-7 jours si nécessaire',
      },
    },
    safetyPeriod: {
      days: 0,
      legallyRequired: false,
      notes: {
        ar: 'لا توجد فترة أمان، يمكن استخدامه في أي وقت',
        en: 'No safety period, can be used anytime',
        fr: 'Pas de période de sécurité, peut être utilisé à tout moment',
      },
    },
    cost: {
      price: 5,
      currency: 'USD',
      perUnit: MeasurementUnit.G,
      perHive: 5,
      perCycle: 5,
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 5,
    sideEffects: [
      {
        description: {
          ar: 'قد يسبب تهيج للنحل إذا استخدم بتركيز عالي',
          en: 'May irritate bees if used in high concentration',
          fr: 'Peut irriter les abeilles si utilisé à forte concentration',
        },
        severity: 2,
        probability: 'rare',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'استخدام معدات الحماية (قفازات، نظارات)',
          en: 'Use protective equipment (gloves, goggles)',
          fr: 'Utiliser un équipement de protection (gants, lunettes)',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'عدم استخدامه عند وجود حضنة مفتوحة (للتبخير)',
          en: 'Do not use when open brood is present (for vaporization)',
          fr: 'Ne pas utiliser en présence de couvain ouvert (pour vaporisation)',
        },
        mandatory: false,
        priority: 3,
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
    ],
    storage: {
      temperature: {
        min: 5,
        max: 30,
      },
      awayFromLight: true,
      dryPlace: true,
      notes: {
        ar: 'يحفظ في مكان جاف بعيداً عن الرطوبة',
        en: 'Store in dry place away from moisture',
        fr: 'Conserver dans un endroit sec à l\'abri de l\'humidité',
      },
    },
    requiresPrescription: false,
    organicCertified: true,
    safeForHoney: true,
    recommendedSeason: ['fall', 'winter'],
    optimalTemperature: {
      min: 5,
      max: 25,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 2. Formic Acid - حمض الفورميك
  {
    id: 'org-002',
    name: {
      ar: 'حمض الفورميك',
      en: 'Formic Acid',
      fr: 'Acide Formique',
    },
    tradeName: {
      ar: 'ميتي أسيد / فورميك برو',
      en: 'Mite-Away / Formic Pro',
      fr: 'Mite-Away / Formic Pro',
    },
    activeIngredient: {
      ar: 'حمض الفورميك (Formic Acid)',
      en: 'Formic Acid',
      fr: 'Acide Formique',
    },
    description: {
      ar: 'علاج عضوي قوي لمكافحة الفاروا. يتبخر داخل الخلية ويقتل الفاروا حتى تحت أغطية الحضنة. معتمد عضوياً ولا يترك بقايا.',
      en: 'Powerful organic treatment for Varroa control. Vaporizes inside hive and kills Varroa even under brood caps. Organically certified and leaves no residue.',
      fr: 'Traitement organique puissant contre le varroa. Se vaporise dans la ruche et tue le varroa même sous les opercules du couvain. Certifié biologique et ne laisse aucun résidu.',
    },
    type: TreatmentType.ORGANIC,
    applicationMethod: ApplicationMethod.FUMIGATION,
    dosage: {
      amount: 1,
      unit: MeasurementUnit.STRIPS,
      perHive: true,
      notes: {
        ar: 'شريط واحد أو شريطان حسب قوة الخلية وحجمها',
        en: 'One or two strips depending on hive strength and size',
        fr: 'Une ou deux lanières selon la force et la taille de la ruche',
      },
    },
    duration: {
      days: 14,
      description: {
        ar: '14 يوم (يتبخر تلقائياً)',
        en: '14 days (evaporates automatically)',
        fr: '14 jours (s\'évapore automatiquement)',
      },
    },
    safetyPeriod: {
      days: 0,
      legallyRequired: false,
      notes: {
        ar: 'لا توجد فترة أمان، معتمد للاستخدام أثناء جمع العسل',
        en: 'No safety period, approved for use during honey flow',
        fr: 'Pas de période de sécurité, approuvé pour utilisation pendant la miellée',
      },
    },
    cost: {
      price: 20,
      currency: 'USD',
      perUnit: MeasurementUnit.STRIPS,
      perHive: 20,
      perCycle: 20,
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 4,
    sideEffects: [
      {
        description: {
          ar: 'قد يسبب موت بعض الحضنة في درجات الحرارة العالية',
          en: 'May cause some brood mortality in high temperatures',
          fr: 'Peut causer une certaine mortalité du couvain à températures élevées',
        },
        severity: 2,
        probability: 'common',
      },
      {
        description: {
          ar: 'قد يسبب هجرة الملكة في حالات نادرة',
          en: 'May cause queen absconding in rare cases',
          fr: 'Peut causer l\'essaimage de la reine dans de rares cas',
        },
        severity: 3,
        probability: 'rare',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'عدم استخدامه عند درجة حرارة أعلى من 30 درجة مئوية',
          en: 'Do not use when temperature exceeds 30°C',
          fr: 'Ne pas utiliser lorsque la température dépasse 30°C',
        },
        mandatory: true,
        priority: 5,
      },
      {
        description: {
          ar: 'توفير تهوية جيدة للخلية',
          en: 'Provide good hive ventilation',
          fr: 'Assurer une bonne ventilation de la ruche',
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
    organicCertified: true,
    safeForHoney: true,
    recommendedSeason: ['spring', 'fall'],
    optimalTemperature: {
      min: 10,
      max: 25,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 3. Thymol - الزعتر (Thymol)
  {
    id: 'org-003',
    name: {
      ar: 'زيت الزعتر (ثيمول)',
      en: 'Thymol',
      fr: 'Thymol',
    },
    tradeName: {
      ar: 'أبيلايف فار / ثيموفار',
      en: 'Apilifevar / Thymovar',
      fr: 'Apilifevar / Thymovar',
    },
    activeIngredient: {
      ar: 'ثيمول (Thymol)',
      en: 'Thymol',
      fr: 'Thymol',
    },
    description: {
      ar: 'علاج عضوي طبيعي مستخرج من الزعتر. فعال ضد الفاروا ومعتمد عضوياً. يأتي على شكل جل أو شرائط تتبخر ببطء داخل الخلية.',
      en: 'Natural organic treatment extracted from thyme. Effective against Varroa and organically certified. Comes as gel or strips that slowly evaporate inside hive.',
      fr: 'Traitement organique naturel extrait du thym. Efficace contre le varroa et certifié biologique. Se présente sous forme de gel ou de lanières qui s\'évaporent lentement dans la ruche.',
    },
    type: TreatmentType.ORGANIC,
    applicationMethod: ApplicationMethod.STRIPS,
    dosage: {
      amount: 1,
      unit: MeasurementUnit.STRIPS,
      perHive: true,
      notes: {
        ar: 'شريط واحد لكل خلية، يوضع فوق الإطارات',
        en: 'One strip per hive, placed on top of frames',
        fr: 'Une lanière par ruche, placée sur les cadres',
      },
    },
    duration: {
      weeks: 3,
      description: {
        ar: '3-4 أسابيع',
        en: '3-4 weeks',
        fr: '3-4 semaines',
      },
    },
    safetyPeriod: {
      days: 0,
      legallyRequired: false,
      notes: {
        ar: 'لا توجد فترة أمان، معتمد عضوياً',
        en: 'No safety period, organically certified',
        fr: 'Pas de période de sécurité, certifié biologique',
      },
    },
    cost: {
      price: 18,
      currency: 'USD',
      perUnit: MeasurementUnit.STRIPS,
      perHive: 18,
      perCycle: 18,
    },
    targetDiseases: ['para-001'], // Varroa
    effectiveness: 3,
    sideEffects: [
      {
        description: {
          ar: 'قد يؤثر على طعم العسل إذا استخدم بكثرة',
          en: 'May affect honey taste if overused',
          fr: 'Peut affecter le goût du miel en cas de surutilisation',
        },
        severity: 2,
        probability: 'rare',
      },
      {
        description: {
          ar: 'فعالية أقل في درجات الحرارة المنخفضة',
          en: 'Less effective in low temperatures',
          fr: 'Moins efficace à basses températures',
        },
        severity: 2,
        probability: 'common',
      },
    ],
    precautions: [
      {
        description: {
          ar: 'يعمل بشكل أفضل في درجات حرارة 15-25 درجة مئوية',
          en: 'Works best at temperatures 15-25°C',
          fr: 'Fonctionne mieux à des températures de 15-25°C',
        },
        mandatory: false,
        priority: 3,
      },
      {
        description: {
          ar: 'إزالة الشرائط بعد 3-4 أسابيع',
          en: 'Remove strips after 3-4 weeks',
          fr: 'Retirer les lanières après 3-4 semaines',
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
    organicCertified: true,
    safeForHoney: true,
    recommendedSeason: ['spring', 'summer', 'fall'],
    optimalTemperature: {
      min: 15,
      max: 25,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },

  // 4. Essential Oils Mix - خليط الزيوت العطرية
  {
    id: 'org-004',
    name: {
      ar: 'خليط الزيوت العطرية',
      en: 'Essential Oils Mix',
      fr: 'Mélange d\'Huiles Essentielles',
    },
    tradeName: {
      ar: 'أبيجارد / هوب جارد',
      en: 'ApiGuard / HopGuard',
      fr: 'ApiGuard / HopGuard',
    },
    activeIngredient: {
      ar: 'زيوت عطرية (نعناع، زعتر، كافور)',
      en: 'Essential oils (mint, thyme, eucalyptus)',
      fr: 'Huiles essentielles (menthe, thym, eucalyptus)',
    },
    description: {
      ar: 'خليط من الزيوت العطرية الطبيعية لمكافحة الفاروا والأمراض الفطرية. آمن تماماً ومعتمد عضوياً. يعمل عن طريق التبخر البطيء.',
      en: 'Mix of natural essential oils for Varroa and fungal disease control. Completely safe and organically certified. Works through slow evaporation.',
      fr: 'Mélange d\'huiles essentielles naturelles contre le varroa et les maladies fongiques. Totalement sûr et certifié biologique. Fonctionne par évaporation lente.',
    },
    type: TreatmentType.ORGANIC,
    applicationMethod: ApplicationMethod.STRIPS,
    dosage: {
      amount: 2,
      unit: MeasurementUnit.STRIPS,
      perHive: true,
      notes: {
        ar: 'شريطان لكل خلية، يوضعان فوق الإطارات',
        en: 'Two strips per hive, placed on top of frames',
        fr: 'Deux lanières par ruche, placées sur les cadres',
      },
    },
    duration: {
      weeks: 4,
      description: {
        ar: '4 أسابيع',
        en: '4 weeks',
        fr: '4 semaines',
      },
    },
    safetyPeriod: {
      days: 0,
      legallyRequired: false,
      notes: {
        ar: 'لا توجد فترة أمان، آمن تماماً',
        en: 'No safety period, completely safe',
        fr: 'Pas de période de sécurité, totalement sûr',
      },
    },
    cost: {
      price: 22,
      currency: 'USD',
      perUnit: MeasurementUnit.STRIPS,
      perHive: 22,
      perCycle: 22,
    },
    targetDiseases: ['para-001', 'brood-003'], // Varroa, Chalkbrood
    effectiveness: 3,
    sideEffects: [],
    precautions: [
      {
        description: {
          ar: 'تجديد الشرائط كل 2 أسبوع',
          en: 'Replace strips every 2 weeks',
          fr: 'Remplacer les lanières toutes les 2 semaines',
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
    organicCertified: true,
    safeForHoney: true,
    recommendedSeason: ['spring', 'summer', 'fall'],
    optimalTemperature: {
      min: 10,
      max: 30,
    },
    dateAdded: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-01'),
  },
];
