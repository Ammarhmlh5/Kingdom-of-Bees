/**
 * Disease Data Models
 * نماذج بيانات الأمراض
 */

import type { LocalizedString } from '../i18n/types';

/**
 * فئات الأمراض
 */
export type DiseaseCategory = 
  | 'brood'      // أمراض الحضنة
  | 'adult'      // أمراض النحل البالغ
  | 'parasite'   // الطفيليات
  | 'virus'      // الفيروسات
  | 'queen';     // مشاكل الملكة

/**
 * مستويات الخطورة
 */
export type SeverityLevel = 
  | 'low'        // منخفض
  | 'medium'     // متوسط
  | 'high'       // عالي
  | 'critical';  // حرج

/**
 * فئات الأعراض
 */
export type SymptomCategory =
  | 'visual'         // مرئي
  | 'behavioral'     // سلوكي
  | 'structural'     // هيكلي
  | 'environmental'; // بيئي

/**
 * المواسم
 */
export type Season = 
  | 'spring'   // الربيع
  | 'summer'   // الصيف
  | 'fall'     // الخريف
  | 'winter';  // الشتاء

/**
 * واجهة العرض (Symptom)
 */
export interface Symptom {
  /**
   * معرف فريد
   */
  id: string;

  /**
   * الوصف
   */
  description: LocalizedString;

  /**
   * الفئة
   */
  category: SymptomCategory;

  /**
   * مستوى الخطورة
   */
  severity: SeverityLevel;

  /**
   * المؤشرات المرئية (اختياري)
   */
  visualIndicators?: string[];

  /**
   * الصور المرجعية (اختياري)
   */
  referenceImages?: string[];
}

/**
 * مرجع الصورة
 */
export interface ImageReference {
  /**
   * معرف الصورة
   */
  id: string;

  /**
   * رابط الصورة
   */
  url: string;

  /**
   * الوصف
   */
  description?: LocalizedString;

  /**
   * نوع الصورة
   */
  type: 'symptom' | 'treatment' | 'prevention' | 'general';

  /**
   * البيانات الوصفية
   */
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  };
}

/**
 * واجهة المرض (Disease)
 */
export interface Disease {
  /**
   * معرف فريد
   */
  id: string;

  /**
   * الاسم
   */
  name: LocalizedString;

  /**
   * الاسم العلمي
   */
  scientificName: string;

  /**
   * الفئة
   */
  category: DiseaseCategory;

  /**
   * مستوى الخطورة
   */
  severity: SeverityLevel;

  /**
   * الوصف
   */
  description: LocalizedString;

  /**
   * الأعراض
   */
  symptoms: Symptom[];

  /**
   * الأسباب
   */
  causes: LocalizedString[];

  /**
   * الموسمية
   */
  seasonality: Season[];

  /**
   * المناطق الجغرافية
   */
  regions: string[];

  /**
   * الصور
   */
  images: ImageReference[];

  /**
   * معرفات العلاجات
   */
  treatmentIds: string[];

  /**
   * إجراءات الوقاية
   */
  preventionMeasures: LocalizedString[];

  /**
   * معدل الانتشار (0-1)
   */
  prevalence?: number;

  /**
   * معدل الوفيات (0-1)
   */
  mortalityRate?: number;

  /**
   * فترة الحضانة (بالأيام)
   */
  incubationPeriod?: {
    min: number;
    max: number;
  };

  /**
   * قابلية العدوى
   */
  contagiousness?: 'low' | 'medium' | 'high';

  /**
   * البيانات الوصفية
   */
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

/**
 * فلتر الأمراض
 */
export interface DiseaseFilter {
  /**
   * الفئة
   */
  category?: DiseaseCategory;

  /**
   * مستوى الخطورة
   */
  severity?: SeverityLevel;

  /**
   * الموسم
   */
  season?: Season;

  /**
   * المنطقة
   */
  region?: string;

  /**
   * البحث النصي
   */
  search?: string;

  /**
   * الترتيب
   */
  orderBy?: 'name' | 'severity' | 'prevalence';

  /**
   * اتجاه الترتيب
   */
  orderDirection?: 'asc' | 'desc';

  /**
   * الحد الأقصى للنتائج
   */
  limit?: number;

  /**
   * الإزاحة
   */
  offset?: number;
}

/**
 * إحصائيات المرض
 */
export interface DiseaseStatistics {
  /**
   * معرف المرض
   */
  diseaseId: string;

  /**
   * عدد الحالات المسجلة
   */
  totalCases: number;

  /**
   * عدد الحالات النشطة
   */
  activeCases: number;

  /**
   * عدد الحالات المعالجة
   */
  treatedCases: number;

  /**
   * معدل النجاح
   */
  successRate: number;

  /**
   * متوسط مدة العلاج (بالأيام)
   */
  averageTreatmentDuration: number;

  /**
   * التوزيع الجغرافي
   */
  geographicDistribution: {
    region: string;
    count: number;
  }[];

  /**
   * التوزيع الموسمي
   */
  seasonalDistribution: {
    season: Season;
    count: number;
  }[];
}
