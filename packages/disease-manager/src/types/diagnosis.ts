/**
 * أنواع نظام التشخيص
 * Diagnosis System Types
 */

import { Disease, Symptom, SeverityLevel } from './disease';
import { LocalizedString } from '../i18n/types';

/**
 * حالة جلسة التشخيص
 * Diagnosis Session Status
 */
export type DiagnosisSessionStatus = 
  | 'active'      // نشطة
  | 'completed'   // مكتملة
  | 'cancelled';  // ملغاة

/**
 * نوع الأعراض المدخلة
 * Input Symptom Type
 */
export interface InputSymptom {
  id: string;
  name: LocalizedString;
  severity: SeverityLevel;
  notes?: string;
}

/**
 * صورة مرفقة للتشخيص
 * Diagnosis Image
 */
export interface DiagnosisImage {
  id: string;
  uri: string;
  timestamp: Date;
  notes?: string;
  analysisResult?: ImageAnalysisResult;
}

/**
 * نتيجة تحليل الصورة
 * Image Analysis Result
 */
export interface ImageAnalysisResult {
  quality: number; // 0-1
  detectedSymptoms: string[];
  confidence: number; // 0-1
  suggestions: LocalizedString[];
}

/**
 * مرض محتمل مع احتمالية
 * Possible Disease with Probability
 */
export interface PossibleDisease {
  disease: Disease;
  probability: number; // 0-1 (نسبة التطابق)
  confidence: number; // 0-1 (مستوى الثقة)
  matchedSymptoms: Symptom[];
  missingSymptoms: Symptom[];
  reasoning: LocalizedString;
}

/**
 * توصية علاجية
 * Treatment Recommendation
 */
export interface TreatmentRecommendation {
  treatmentId: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: LocalizedString;
}

/**
 * نتيجة التشخيص
 * Diagnosis Result
 */
export interface DiagnosisResult {
  id: string;
  sessionId: string;
  timestamp: Date;
  possibleDiseases: PossibleDisease[];
  overallSeverity: SeverityLevel;
  recommendations: TreatmentRecommendation[];
  nextSteps: LocalizedString[];
  confidence: number; // 0-1 (الثقة الإجمالية)
}

/**
 * جلسة التشخيص
 * Diagnosis Session
 */
export interface DiagnosisSession {
  id: string;
  hiveId?: string;
  status: DiagnosisSessionStatus;
  startedAt: Date;
  completedAt?: Date;
  inputSymptoms: InputSymptom[];
  images: DiagnosisImage[];
  result?: DiagnosisResult;
  notes?: string;
}

/**
 * خيارات إنشاء جلسة تشخيص
 * Diagnosis Session Options
 */
export interface DiagnosisSessionOptions {
  hiveId?: string;
  initialSymptoms?: InputSymptom[];
  initialImages?: DiagnosisImage[];
  notes?: string;
}

/**
 * خيارات التحليل
 * Analysis Options
 */
export interface AnalysisOptions {
  includeImageAnalysis?: boolean;
  minProbability?: number; // الحد الأدنى للاحتمالية (افتراضي: 0.3)
  maxResults?: number; // الحد الأقصى للنتائج (افتراضي: 5)
  considerSeasonality?: boolean; // مراعاة الموسمية
  considerGeography?: boolean; // مراعاة الموقع الجغرافي
}

/**
 * إحصائيات التشخيص
 * Diagnosis Statistics
 */
export interface DiagnosisStatistics {
  totalSessions: number;
  completedSessions: number;
  averageConfidence: number;
  mostCommonDiseases: {
    diseaseId: string;
    count: number;
  }[];
  averageSessionDuration: number; // بالدقائق
}
