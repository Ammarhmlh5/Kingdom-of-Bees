/**
 * Brood Diseases Database
 * قاعدة بيانات أمراض الحضنة
 */

import type { Disease } from '../../types/disease';
import { createLocalizedString } from '../../i18n/types';

/**
 * American Foulbrood (AFB)
 * تعفن الحضنة الأمريكي
 */
export const americanFoulbrood: Disease = {
  id: 'afb-001',
  name: createLocalizedString(
    'تعفن الحضنة الأمريكي',
    'American Foulbrood',
    'Loque américaine'
  ),
  scientificName: 'Paenibacillus larvae',
  category: 'brood',
  severity: 'critical',
  description: createLocalizedString(
    'مرض بكتيري خطير يصيب يرقات النحل ويسبب موتها. يعتبر من أخطر أمراض النحل وأكثرها عدوى.',
    'A serious bacterial disease affecting bee larvae causing their death. Considered one of the most dangerous and contagious bee diseases.',
    'Une maladie bactérienne grave affectant les larves d\'abeilles causant leur mort. Considérée comme l\'une des maladies les plus dangereuses et contagieuses des abeilles.'
  ),
  symptoms: [
    {
      id: 'afb-s1',
      description: createLocalizedString(
        'حضنة غير منتظمة مع خلايا فارغة متناثرة',
        'Irregular brood pattern with scattered empty cells',
        'Motif de couvain irrégulier avec des cellules vides dispersées'
      ),
      category: 'visual',
      severity: 'high',
    },
    {
      id: 'afb-s2',
      description: createLocalizedString(
        'أغطية الخلايا غارقة ومثقوبة',
        'Sunken and perforated cell cappings',
        'Opercules de cellules enfoncés et perforés'
      ),
      category: 'visual',
      severity: 'critical',
    },
    {
      id: 'afb-s3',
      description: createLocalizedString(
        'يرقات ميتة بنية اللون ولزجة',
        'Dead larvae brown and sticky',
        'Larves mortes brunes et collantes'
      ),
      category: 'visual',
      severity: 'critical',
    },
    {
      id: 'afb-s4',
      description: createLocalizedString(
        'رائحة كريهة تشبه رائحة الغراء',
        'Foul smell resembling glue',
        'Odeur nauséabonde ressemblant à de la colle'
      ),
      category: 'environmental',
      severity: 'high',
    },
    {
      id: 'afb-s5',
      description: createLocalizedString(
        'اختبار العود الإيجابي (تمدد اليرقة الميتة)',
        'Positive rope test (dead larva stretches)',
        'Test de la ficelle positif (la larve morte s\'étire)'
      ),
      category: 'structural',
      severity: 'critical',
    },
  ],
  causes: [
    createLocalizedString(
      'بكتيريا Paenibacillus larvae',
      'Paenibacillus larvae bacteria',
      'Bactérie Paenibacillus larvae'
    ),
    createLocalizedString(
      'انتقال العدوى عبر الأدوات الملوثة',
      'Transmission through contaminated equipment',
      'Transmission par équipement contaminé'
    ),
    createLocalizedString(
      'سرقة العسل من خلايا مصابة',
      'Robbing honey from infected hives',
      'Vol de miel de ruches infectées'
    ),
    createLocalizedString(
      'استخدام شمع ملوث',
      'Using contaminated wax',
      'Utilisation de cire contaminée'
    ),
  ],
  seasonality: ['spring', 'summer', 'fall'],
  regions: ['worldwide'],
  images: [],
  treatmentIds: ['afb-t1', 'afb-t2'],
  preventionMeasures: [
    createLocalizedString(
      'فحص دوري للخلايا',
      'Regular hive inspections',
      'Inspections régulières des ruches'
    ),
    createLocalizedString(
      'حرق الخلايا المصابة بشدة',
      'Burning severely infected hives',
      'Brûler les ruches gravement infectées'
    ),
    createLocalizedString(
      'تعقيم الأدوات بين الخلايا',
      'Sterilizing equipment between hives',
      'Stériliser l\'équipement entre les ruches'
    ),
    createLocalizedString(
      'استخدام ملكات مقاومة',
      'Using resistant queens',
      'Utiliser des reines résistantes'
    ),
  ],
  prevalence: 0.15,
  mortalityRate: 0.95,
  incubationPeriod: { min: 3, max: 7 },
  contagiousness: 'high',
};

/**
 * European Foulbrood (EFB)
 * تعفن الحضنة الأوروبي
 */
export const europeanFoulbrood: Disease = {
  id: 'efb-001',
  name: createLocalizedString(
    'تعفن الحضنة الأوروبي',
    'European Foulbrood',
    'Loque européenne'
  ),
  scientificName: 'Melissococcus plutonius',
  category: 'brood',
  severity: 'high',
  description: createLocalizedString(
    'مرض بكتيري يصيب يرقات النحل الصغيرة قبل تغطية الخلايا. أقل خطورة من التعفن الأمريكي لكنه يحتاج علاج سريع.',
    'A bacterial disease affecting young bee larvae before cell capping. Less severe than AFB but requires prompt treatment.',
    'Une maladie bactérienne affectant les jeunes larves d\'abeilles avant l\'operculation. Moins grave que la loque américaine mais nécessite un traitement rapide.'
  ),
  symptoms: [
    {
      id: 'efb-s1',
      description: createLocalizedString(
        'يرقات ميتة ملتوية في قاع الخلية',
        'Dead twisted larvae at cell bottom',
        'Larves mortes tordues au fond de la cellule'
      ),
      category: 'visual',
      severity: 'high',
    },
    {
      id: 'efb-s2',
      description: createLocalizedString(
        'يرقات صفراء أو بنية فاتحة',
        'Yellow or light brown larvae',
        'Larves jaunes ou brun clair'
      ),
      category: 'visual',
      severity: 'medium',
    },
    {
      id: 'efb-s3',
      description: createLocalizedString(
        'رائحة حامضة خفيفة',
        'Mild sour smell',
        'Odeur aigre légère'
      ),
      category: 'environmental',
      severity: 'medium',
    },
    {
      id: 'efb-s4',
      description: createLocalizedString(
        'حضنة غير منتظمة',
        'Irregular brood pattern',
        'Motif de couvain irrégulier'
      ),
      category: 'visual',
      severity: 'high',
    },
  ],
  causes: [
    createLocalizedString(
      'بكتيريا Melissococcus plutonius',
      'Melissococcus plutonius bacteria',
      'Bactérie Melissococcus plutonius'
    ),
    createLocalizedString(
      'ضعف التغذية',
      'Poor nutrition',
      'Mauvaise nutrition'
    ),
    createLocalizedString(
      'الإجهاد البيئي',
      'Environmental stress',
      'Stress environnemental'
    ),
  ],
  seasonality: ['spring', 'summer'],
  regions: ['worldwide'],
  images: [],
  treatmentIds: ['efb-t1', 'efb-t2'],
  preventionMeasures: [
    createLocalizedString(
      'تقوية الطوائف الضعيفة',
      'Strengthening weak colonies',
      'Renforcer les colonies faibles'
    ),
    createLocalizedString(
      'توفير تغذية جيدة',
      'Providing good nutrition',
      'Fournir une bonne nutrition'
    ),
    createLocalizedString(
      'استبدال الملكات القديمة',
      'Replacing old queens',
      'Remplacer les vieilles reines'
    ),
  ],
  prevalence: 0.10,
  mortalityRate: 0.60,
  incubationPeriod: { min: 2, max: 5 },
  contagiousness: 'medium',
};

/**
 * Chalkbrood
 * الحضنة الطباشيرية
 */
export const chalkbrood: Disease = {
  id: 'cb-001',
  name: createLocalizedString(
    'الحضنة الطباشيرية',
    'Chalkbrood',
    'Couvain plâtré'
  ),
  scientificName: 'Ascosphaera apis',
  category: 'brood',
  severity: 'medium',
  description: createLocalizedString(
    'مرض فطري يصيب يرقات النحل ويحولها إلى كتل صلبة بيضاء تشبه الطباشير.',
    'A fungal disease affecting bee larvae turning them into hard white chalk-like masses.',
    'Une maladie fongique affectant les larves d\'abeilles les transformant en masses blanches dures ressemblant à de la craie.'
  ),
  symptoms: [
    {
      id: 'cb-s1',
      description: createLocalizedString(
        'يرقات متحجرة بيضاء أو رمادية',
        'Mummified white or gray larvae',
        'Larves momifiées blanches ou grises'
      ),
      category: 'visual',
      severity: 'high',
    },
    {
      id: 'cb-s2',
      description: createLocalizedString(
        'يرقات صلبة تشبه الطباشير',
        'Hard chalk-like larvae',
        'Larves dures ressemblant à de la craie'
      ),
      category: 'structural',
      severity: 'high',
    },
    {
      id: 'cb-s3',
      description: createLocalizedString(
        'يرقات ميتة أمام الخلية',
        'Dead larvae in front of hive',
        'Larves mortes devant la ruche'
      ),
      category: 'visual',
      severity: 'medium',
    },
  ],
  causes: [
    createLocalizedString(
      'فطر Ascosphaera apis',
      'Ascosphaera apis fungus',
      'Champignon Ascosphaera apis'
    ),
    createLocalizedString(
      'الرطوبة العالية',
      'High humidity',
      'Humidité élevée'
    ),
    createLocalizedString(
      'التهوية السيئة',
      'Poor ventilation',
      'Mauvaise ventilation'
    ),
    createLocalizedString(
      'الطقس البارد والرطب',
      'Cold and wet weather',
      'Temps froid et humide'
    ),
  ],
  seasonality: ['spring', 'fall'],
  regions: ['worldwide'],
  images: [],
  treatmentIds: ['cb-t1'],
  preventionMeasures: [
    createLocalizedString(
      'تحسين التهوية',
      'Improving ventilation',
      'Améliorer la ventilation'
    ),
    createLocalizedString(
      'تقليل الرطوبة',
      'Reducing humidity',
      'Réduire l\'humidité'
    ),
    createLocalizedString(
      'استبدال الإطارات القديمة',
      'Replacing old frames',
      'Remplacer les vieux cadres'
    ),
  ],
  prevalence: 0.20,
  mortalityRate: 0.30,
  incubationPeriod: { min: 3, max: 7 },
  contagiousness: 'low',
};

/**
 * Sacbrood
 * الحضنة الكيسية
 */
export const sacbrood: Disease = {
  id: 'sb-001',
  name: createLocalizedString(
    'الحضنة الكيسية',
    'Sacbrood',
    'Couvain sacciforme'
  ),
  scientificName: 'Sacbrood virus (SBV)',
  category: 'brood',
  severity: 'medium',
  description: createLocalizedString(
    'مرض فيروسي يصيب يرقات النحل ويحولها إلى أكياس مملوءة بسائل.',
    'A viral disease affecting bee larvae turning them into fluid-filled sacs.',
    'Une maladie virale affectant les larves d\'abeilles les transformant en sacs remplis de liquide.'
  ),
  symptoms: [
    {
      id: 'sb-s1',
      description: createLocalizedString(
        'يرقات على شكل كيس مملوء بسائل',
        'Larvae shaped like fluid-filled sac',
        'Larves en forme de sac rempli de liquide'
      ),
      category: 'visual',
      severity: 'high',
    },
    {
      id: 'sb-s2',
      description: createLocalizedString(
        'يرقات صفراء شاحبة',
        'Pale yellow larvae',
        'Larves jaune pâle'
      ),
      category: 'visual',
      severity: 'medium',
    },
    {
      id: 'sb-s3',
      description: createLocalizedString(
        'رأس اليرقة داكن اللون',
        'Dark colored larva head',
        'Tête de larve de couleur foncée'
      ),
      category: 'visual',
      severity: 'medium',
    },
    {
      id: 'sb-s4',
      description: createLocalizedString(
        'يرقات جافة على شكل قارب',
        'Dried boat-shaped larvae',
        'Larves séchées en forme de bateau'
      ),
      category: 'visual',
      severity: 'high',
    },
  ],
  causes: [
    createLocalizedString(
      'فيروس الحضنة الكيسية (SBV)',
      'Sacbrood virus (SBV)',
      'Virus du couvain sacciforme (SBV)'
    ),
    createLocalizedString(
      'ضعف الطائفة',
      'Weak colony',
      'Colonie faible'
    ),
  ],
  seasonality: ['spring', 'summer'],
  regions: ['worldwide'],
  images: [],
  treatmentIds: ['sb-t1'],
  preventionMeasures: [
    createLocalizedString(
      'تقوية الطوائف',
      'Strengthening colonies',
      'Renforcer les colonies'
    ),
    createLocalizedString(
      'استبدال الملكات',
      'Replacing queens',
      'Remplacer les reines'
    ),
    createLocalizedString(
      'تحسين التغذية',
      'Improving nutrition',
      'Améliorer la nutrition'
    ),
  ],
  prevalence: 0.08,
  mortalityRate: 0.40,
  incubationPeriod: { min: 5, max: 10 },
  contagiousness: 'low',
};

/**
 * جميع أمراض الحضنة
 */
export const broodDiseases: Disease[] = [
  americanFoulbrood,
  europeanFoulbrood,
  chalkbrood,
  sacbrood,
];
