/**
 * نماذج البيانات للعلاجات
 * Treatment Data Models
 */

import { LocalizedString } from '../i18n/types';

/**
 * أنواع العلاجات
 * Treatment Types
 */
export enum TreatmentType {
  /** علاج كيميائي - Chemical treatment */
  CHEMICAL = 'chemical',
  /** علاج عضوي - Organic treatment */
  ORGANIC = 'organic',
  /** علاج بيولوجي - Biological treatment */
  BIOLOGICAL = 'biological',
  /** علاج ميكانيكي - Mechanical treatment */
  MECHANICAL = 'mechanical',
  /** علاج حراري - Thermal treatment */
  THERMAL = 'thermal',
  /** علاج غذائي - Nutritional treatment */
  NUTRITIONAL = 'nutritional',
}

/**
 * طرق التطبيق
 * Application Methods
 */
export enum ApplicationMethod {
  /** رش - Spray */
  SPRAY = 'spray',
  /** تبخير - Fumigation */
  FUMIGATION = 'fumigation',
  /** تغذية - Feeding */
  FEEDING = 'feeding',
  /** شرائط - Strips */
  STRIPS = 'strips',
  /** مسحوق - Powder */
  POWDER = 'powder',
  /** سائل - Liquid */
  LIQUID = 'liquid',
  /** حبوب - Pills */
  PILLS = 'pills',
  /** موضعي - Topical */
  TOPICAL = 'topical',
  /** ميكانيكي - Mechanical */
  MECHANICAL = 'mechanical',
  /** حراري - Thermal */
  THERMAL = 'thermal',
}

/**
 * وحدات القياس
 * Measurement Units
 */
export enum MeasurementUnit {
  /** ملليلتر - Milliliters */
  ML = 'ml',
  /** لتر - Liters */
  L = 'l',
  /** جرام - Grams */
  G = 'g',
  /** كيلوجرام - Kilograms */
  KG = 'kg',
  /** ملليجرام - Milligrams */
  MG = 'mg',
  /** قطعة - Pieces */
  PIECES = 'pieces',
  /** شريط - Strips */
  STRIPS = 'strips',
}

/**
 * الجرعة
 * Dosage Information
 */
export interface Dosage {
  /** الكمية - Amount */
  amount: number;
  /** الوحدة - Unit */
  unit: MeasurementUnit;
  /** لكل خلية - Per hive */
  perHive?: boolean;
  /** لكل إطار - Per frame */
  perFrame?: boolean;
  /** التكرار (مرات في اليوم) - Frequency (times per day) */
  frequency?: number;
  /** ملاحظات إضافية - Additional notes */
  notes?: LocalizedString;
}

/**
 * المدة الزمنية
 * Duration Information
 */
export interface Duration {
  /** عدد الأيام - Number of days */
  days?: number;
  /** عدد الأسابيع - Number of weeks */
  weeks?: number;
  /** عدد الأشهر - Number of months */
  months?: number;
  /** وصف نصي - Text description */
  description?: LocalizedString;
}

/**
 * فترة الأمان قبل الحصاد
 * Pre-Harvest Interval (PHI)
 */
export interface SafetyPeriod {
  /** عدد الأيام - Number of days */
  days: number;
  /** ملاحظات - Notes */
  notes?: LocalizedString;
  /** إلزامي قانونياً - Legally required */
  legallyRequired: boolean;
}

/**
 * التكلفة
 * Cost Information
 */
export interface Cost {
  /** السعر - Price */
  price: number;
  /** العملة - Currency */
  currency: string;
  /** لكل وحدة - Per unit */
  perUnit?: MeasurementUnit;
  /** التكلفة لكل خلية - Cost per hive */
  perHive?: number;
  /** التكلفة للدورة الكاملة - Cost per full treatment cycle */
  perCycle?: number;
  /** ملاحظات - Notes */
  notes?: LocalizedString;
}

/**
 * الآثار الجانبية
 * Side Effects
 */
export interface SideEffect {
  /** الوصف - Description */
  description: LocalizedString;
  /** مستوى الخطورة (1-5) - Severity level */
  severity: 1 | 2 | 3 | 4 | 5;
  /** الاحتمالية (نادر، شائع، متكرر) - Probability */
  probability: 'rare' | 'common' | 'frequent';
}

/**
 * الاحتياطات
 * Precautions
 */
export interface Precaution {
  /** الوصف - Description */
  description: LocalizedString;
  /** إلزامي - Mandatory */
  mandatory: boolean;
  /** الأولوية (1-5) - Priority */
  priority: 1 | 2 | 3 | 4 | 5;
}

/**
 * معلومات التخزين
 * Storage Information
 */
export interface StorageInfo {
  /** درجة الحرارة المثلى (مئوية) - Optimal temperature (Celsius) */
  temperature?: {
    min: number;
    max: number;
  };
  /** الرطوبة المثلى (%) - Optimal humidity (%) */
  humidity?: {
    min: number;
    max: number;
  };
  /** بعيداً عن الضوء - Away from light */
  awayFromLight?: boolean;
  /** في مكان جاف - In dry place */
  dryPlace?: boolean;
  /** في مكان بارد - In cool place */
  coolPlace?: boolean;
  /** ملاحظات إضافية - Additional notes */
  notes?: LocalizedString;
}

/**
 * معلومات الشركة المصنعة
 * Manufacturer Information
 */
export interface ManufacturerInfo {
  /** اسم الشركة - Company name */
  name: LocalizedString;
  /** البلد - Country */
  country: LocalizedString;
  /** الموقع الإلكتروني - Website */
  website?: string;
  /** رقم الهاتف - Phone number */
  phone?: string;
}

/**
 * العلاج
 * Treatment
 */
export interface Treatment {
  /** المعرف الفريد - Unique identifier */
  id: string;
  /** الاسم - Name */
  name: LocalizedString;
  /** الاسم التجاري - Trade name */
  tradeName?: LocalizedString;
  /** المادة الفعالة - Active ingredient */
  activeIngredient?: LocalizedString;
  /** الوصف - Description */
  description: LocalizedString;
  /** النوع - Type */
  type: TreatmentType;
  /** طريقة التطبيق - Application method */
  applicationMethod: ApplicationMethod;
  /** الجرعة - Dosage */
  dosage: Dosage;
  /** المدة - Duration */
  duration: Duration;
  /** فترة الأمان - Safety period */
  safetyPeriod?: SafetyPeriod;
  /** التكلفة - Cost */
  cost?: Cost;
  /** الأمراض المستهدفة (IDs) - Target diseases */
  targetDiseases: string[];
  /** الفعالية (1-5) - Effectiveness rating */
  effectiveness: 1 | 2 | 3 | 4 | 5;
  /** الآثار الجانبية - Side effects */
  sideEffects?: SideEffect[];
  /** الاحتياطات - Precautions */
  precautions?: Precaution[];
  /** معلومات التخزين - Storage information */
  storage?: StorageInfo;
  /** الشركة المصنعة - Manufacturer */
  manufacturer?: ManufacturerInfo;
  /** متوفر في الأسواق - Available in markets */
  availability?: LocalizedString;
  /** يتطلب وصفة طبية - Requires prescription */
  requiresPrescription?: boolean;
  /** معتمد عضوياً - Organic certified */
  organicCertified?: boolean;
  /** آمن للعسل - Safe for honey */
  safeForHoney?: boolean;
  /** الموسم الموصى به - Recommended season */
  recommendedSeason?: string[];
  /** درجة الحرارة المثلى للتطبيق - Optimal application temperature */
  optimalTemperature?: {
    min: number;
    max: number;
  };
  /** ملاحظات إضافية - Additional notes */
  notes?: LocalizedString;
  /** الصور - Images */
  images?: string[];
  /** تاريخ الإضافة - Date added */
  dateAdded?: Date;
  /** آخر تحديث - Last updated */
  lastUpdated?: Date;
}

/**
 * فلتر العلاجات
 * Treatment Filter
 */
export interface TreatmentFilter {
  /** النوع - Type */
  type?: TreatmentType | TreatmentType[];
  /** طريقة التطبيق - Application method */
  applicationMethod?: ApplicationMethod | ApplicationMethod[];
  /** المرض المستهدف - Target disease */
  targetDisease?: string;
  /** الحد الأدنى للفعالية - Minimum effectiveness */
  minEffectiveness?: 1 | 2 | 3 | 4 | 5;
  /** معتمد عضوياً فقط - Organic certified only */
  organicOnly?: boolean;
  /** آمن للعسل فقط - Safe for honey only */
  safeForHoneyOnly?: boolean;
  /** الحد الأقصى للتكلفة - Maximum cost */
  maxCost?: number;
  /** العملة - Currency */
  currency?: string;
  /** بدون وصفة طبية - No prescription required */
  noPrescription?: boolean;
  /** الموسم - Season */
  season?: string;
  /** نص البحث - Search text */
  searchText?: string;
}

/**
 * إحصائيات العلاجات
 * Treatment Statistics
 */
export interface TreatmentStatistics {
  /** إجمالي العلاجات - Total treatments */
  total: number;
  /** حسب النوع - By type */
  byType: Record<TreatmentType, number>;
  /** حسب طريقة التطبيق - By application method */
  byApplicationMethod: Record<ApplicationMethod, number>;
  /** متوسط الفعالية - Average effectiveness */
  averageEffectiveness: number;
  /** متوسط التكلفة - Average cost */
  averageCost?: number;
  /** العملة - Currency */
  currency?: string;
  /** عدد العلاجات العضوية - Organic treatments count */
  organicCount: number;
  /** عدد العلاجات الآمنة للعسل - Safe for honey count */
  safeForHoneyCount: number;
}

/**
 * سجل استخدام العلاج
 * Treatment Usage Record
 */
export interface TreatmentUsageRecord {
  /** المعرف - ID */
  id: string;
  /** معرف العلاج - Treatment ID */
  treatmentId: string;
  /** معرف الخلية - Hive ID */
  hiveId: string;
  /** تاريخ البدء - Start date */
  startDate: Date;
  /** تاريخ الانتهاء - End date */
  endDate?: Date;
  /** الجرعة المستخدمة - Dosage used */
  dosageUsed: Dosage;
  /** التكلفة الفعلية - Actual cost */
  actualCost?: number;
  /** الفعالية المقيمة (1-5) - Rated effectiveness */
  ratedEffectiveness?: 1 | 2 | 3 | 4 | 5;
  /** الآثار الجانبية الملاحظة - Observed side effects */
  observedSideEffects?: string[];
  /** ملاحظات - Notes */
  notes?: string;
  /** تاريخ الإنشاء - Created at */
  createdAt: Date;
  /** آخر تحديث - Updated at */
  updatedAt?: Date;
}
