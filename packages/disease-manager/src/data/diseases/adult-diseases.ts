/**
 * Adult Bee Diseases Database
 * قاعدة بيانات أمراض النحل البالغ
 */

import type { Disease } from '../../types/disease';
import { createLocalizedString } from '../../i18n/types';

/**
 * Nosema
 * النوزيما
 */
export const nosema: Disease = {
  id: 'nos-001',
  name: createLocalizedString(
    'النوزيما',
    'Nosema',
    'Nosémose'
  ),
  scientificName: 'Nosema apis / Nosema ceranae',
  category: 'adult',
  severity: 'high',
  description: createLocalizedString(
    'مرض طفيلي يصيب الجهاز الهضمي للنحل البالغ ويسبب الإسهال وضعف الطائفة.',
    'A parasitic disease affecting the digestive system of adult bees causing diarrhea and colony weakness.',
    'Une maladie parasitaire affectant le système digestif des abeilles adultes causant la diarrhée et l\'affaiblissement de la colonie.'
  ),
  symptoms: [
    {
      id: 'nos-s1',
      description: createLocalizedString(
        'إسهال بني على مقدمة الخلية',
        'Brown diarrhea on hive front',
        'Diarrhée brune sur le devant de la ruche'
      ),
      category: 'visual',
      severity: 'high',
    },
    {
      id: 'nos-s2',
      description: createLocalizedString(
        'نحل زاحف غير قادر على الطيران',
        'Crawling bees unable to fly',
        'Abeilles rampantes incapables de voler'
      ),
      category: 'behavioral',
      severity: 'high',
    },
    {
      id: 'nos-s3',
      description: createLocalizedString(
        'بطون منتفخة',
        'Swollen abdomens',
        'Abdomens gonflés'
      ),
      category: 'visual',
      severity: 'medium',
    },
    {
      id: 'nos-s4',
      description: createLocalizedString(
        'ضعف عام في الطائفة',
        'General colony weakness',
        'Faiblesse générale de la colonie'
      ),
      category: 'behavioral',
      severity: 'high',
    },
    {
      id: 'nos-s5',
      description: createLocalizedString(
        'انخفاض إنتاج العسل',
        'Reduced honey production',
        'Production de miel réduite'
      ),
      category: 'behavioral',
      severity: 'medium',
    },
  ],
  causes: [
    createLocalizedString(
      'طفيلي Nosema apis أو Nosema ceranae',
      'Nosema apis or Nosema ceranae parasite',
      'Parasite Nosema apis ou Nosema ceranae'
    ),
    createLocalizedString(
      'الطقس البارد والرطب',
      'Cold and wet weather',
      'Temps froid et humide'
    ),
    createLocalizedString(
      'سوء التغذية',
      'Poor nutrition',
      'Mauvaise nutrition'
    ),
    createLocalizedString(
      'الإجهاد',
      'Stress',
      'Stress'
    ),
  ],
  seasonality: ['spring', 'fall', 'winter'],
  regions: ['worldwide'],
  images: [],
  treatmentIds: ['nos-t1', 'nos-t2'],
  preventionMeasures: [
    createLocalizedString(
      'توفير تغذية جيدة',
      'Providing good nutrition',
      'Fournir une bonne nutrition'
    ),
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
  prevalence: 0.25,
  mortalityRate: 0.50,
  incubationPeriod: { min: 7, max: 14 },
  contagiousness: 'medium',
};

/**
 * Amoeba
 * الأميبا
 */
export const amoeba: Disease = {
  id: 'amo-001',
  name: createLocalizedString(
    'الأميبا',
    'Amoeba',
    'Amibiase'
  ),
  scientificName: 'Malpighamoeba mellificae',
  category: 'adult',
  severity: 'medium',
  description: createLocalizedString(
    'مرض طفيلي يصيب أنابيب مالبيجي في النحل البالغ، غالباً ما يظهر مع النوزيما.',
    'A parasitic disease affecting Malpighian tubules in adult bees, often appears with Nosema.',
    'Une maladie parasitaire affectant les tubes de Malpighi chez les abeilles adultes, apparaît souvent avec la nosémose.'
  ),
  symptoms: [
    {
      id: 'amo-s1',
      description: createLocalizedString(
        'أعراض مشابهة للنوزيما',
        'Symptoms similar to Nosema',
        'Symptômes similaires à la nosémose'
      ),
      category: 'visual',
      severity: 'medium',
    },
    {
      id: 'amo-s2',
      description: createLocalizedString(
        'نحل ضعيف وبطيء الحركة',
        'Weak and slow-moving bees',
        'Abeilles faibles et lentes'
      ),
      category: 'behavioral',
      severity: 'medium',
    },
    {
      id: 'amo-s3',
      description: createLocalizedString(
        'انخفاض عدد النحل',
        'Reduced bee population',
        'Population d\'abeilles réduite'
      ),
      category: 'behavioral',
      severity: 'high',
    },
  ],
  causes: [
    createLocalizedString(
      'طفيلي Malpighamoeba mellificae',
      'Malpighamoeba mellificae parasite',
      'Parasite Malpighamoeba mellificae'
    ),
    createLocalizedString(
      'غالباً ما يظهر مع النوزيما',
      'Often appears with Nosema',
      'Apparaît souvent avec la nosémose'
    ),
  ],
  seasonality: ['spring', 'fall'],
  regions: ['worldwide'],
  images: [],
  treatmentIds: ['amo-t1'],
  preventionMeasures: [
    createLocalizedString(
      'نفس إجراءات الوقاية من النوزيما',
      'Same prevention measures as Nosema',
      'Mêmes mesures de prévention que la nosémose'
    ),
    createLocalizedString(
      'تحسين النظافة',
      'Improving hygiene',
      'Améliorer l\'hygiène'
    ),
  ],
  prevalence: 0.10,
  mortalityRate: 0.30,
  incubationPeriod: { min: 7, max: 14 },
  contagiousness: 'low',
};

/**
 * Paralysis
 * الشلل
 */
export const paralysis: Disease = {
  id: 'par-001',
  name: createLocalizedString(
    'شلل النحل',
    'Bee Paralysis',
    'Paralysie des abeilles'
  ),
  scientificName: 'Chronic Bee Paralysis Virus (CBPV) / Acute Bee Paralysis Virus (ABPV)',
  category: 'adult',
  severity: 'high',
  description: createLocalizedString(
    'مرض فيروسي يسبب الشلل والارتعاش في النحل البالغ، يمكن أن يكون حاداً أو مزمناً.',
    'A viral disease causing paralysis and trembling in adult bees, can be acute or chronic.',
    'Une maladie virale causant la paralysie et le tremblement chez les abeilles adultes, peut être aiguë ou chronique.'
  ),
  symptoms: [
    {
      id: 'par-s1',
      description: createLocalizedString(
        'نحل يرتعش ويرتجف',
        'Trembling and shaking bees',
        'Abeilles tremblantes et secouées'
      ),
      category: 'behavioral',
      severity: 'high',
    },
    {
      id: 'par-s2',
      description: createLocalizedString(
        'نحل أسود لامع بدون شعر',
        'Black shiny hairless bees',
        'Abeilles noires brillantes sans poils'
      ),
      category: 'visual',
      severity: 'high',
    },
    {
      id: 'par-s3',
      description: createLocalizedString(
        'نحل زاحف غير قادر على الطيران',
        'Crawling bees unable to fly',
        'Abeilles rampantes incapables de voler'
      ),
      category: 'behavioral',
      severity: 'critical',
    },
    {
      id: 'par-s4',
      description: createLocalizedString(
        'نحل ميت أمام الخلية',
        'Dead bees in front of hive',
        'Abeilles mortes devant la ruche'
      ),
      category: 'visual',
      severity: 'high',
    },
    {
      id: 'par-s5',
      description: createLocalizedString(
        'نحل عدواني يهاجم النحل المصاب',
        'Aggressive bees attacking infected bees',
        'Abeilles agressives attaquant les abeilles infectées'
      ),
      category: 'behavioral',
      severity: 'medium',
    },
  ],
  causes: [
    createLocalizedString(
      'فيروس الشلل المزمن (CBPV)',
      'Chronic Bee Paralysis Virus (CBPV)',
      'Virus de la paralysie chronique (CBPV)'
    ),
    createLocalizedString(
      'فيروس الشلل الحاد (ABPV)',
      'Acute Bee Paralysis Virus (ABPV)',
      'Virus de la paralysie aiguë (ABPV)'
    ),
    createLocalizedString(
      'الاكتظاظ',
      'Overcrowding',
      'Surpeuplement'
    ),
    createLocalizedString(
      'الإجهاد',
      'Stress',
      'Stress'
    ),
  ],
  seasonality: ['summer', 'fall'],
  regions: ['worldwide'],
  images: [],
  treatmentIds: ['par-t1'],
  preventionMeasures: [
    createLocalizedString(
      'تجنب الاكتظاظ',
      'Avoiding overcrowding',
      'Éviter le surpeuplement'
    ),
    createLocalizedString(
      'تقوية الطوائف',
      'Strengthening colonies',
      'Renforcer les colonies'
    ),
    createLocalizedString(
      'تحسين التهوية',
      'Improving ventilation',
      'Améliorer la ventilation'
    ),
    createLocalizedString(
      'إزالة النحل المصاب',
      'Removing infected bees',
      'Retirer les abeilles infectées'
    ),
  ],
  prevalence: 0.12,
  mortalityRate: 0.70,
  incubationPeriod: { min: 5, max: 10 },
  contagiousness: 'high',
};

/**
 * جميع أمراض النحل البالغ
 */
export const adultDiseases: Disease[] = [
  nosema,
  amoeba,
  paralysis,
];
