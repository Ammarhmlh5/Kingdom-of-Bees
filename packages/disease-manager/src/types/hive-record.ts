/**
 * Hive Record System Types
 * 
 * نماذج البيانات لنظام سجلات الخلايا
 * يتضمن سجلات الأمراض، العلاجات، الفحوصات، الصور، والملاحظات
 */

import { Disease } from './disease';
import { Treatment } from './treatment';
import { DiagnosisResult } from './diagnosis';
import { TreatmentSchedule } from './schedule';

/**
 * Hive Record - سجل الخلية الكامل
 */
export interface HiveRecord {
  id: string;
  hiveId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Disease History
  diseaseHistory: DiseaseRecord[];
  
  // Treatment History
  treatmentHistory: TreatmentRecord[];
  
  // Inspection History
  inspectionHistory: InspectionRecord[];
  
  // Image Gallery
  images: ImageRecord[];
  
  // Notes
  notes: NoteRecord[];
  
  // Statistics
  statistics: HiveStatistics;
}

/**
 * Disease Record - سجل مرض
 */
export interface DiseaseRecord {
  id: string;
  hiveRecordId: string;
  diseaseId: string;
  disease?: Disease; // Optional populated disease
  
  // Diagnosis Information
  diagnosisId?: string;
  diagnosisResult?: DiagnosisResult;
  diagnosedAt: Date;
  diagnosedBy: string; // User ID
  
  // Severity and Status
  severity: 1 | 2 | 3 | 4 | 5;
  status: DiseaseStatus;
  
  // Symptoms
  symptoms: string[];
  
  // Images
  imageIds: string[];
  
  // Notes
  notes?: string;
  
  // Treatment Applied
  treatmentIds: string[];
  
  // Outcome
  outcome?: DiseaseOutcome;
  resolvedAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Disease Status - حالة المرض
 */
export type DiseaseStatus = 
  | 'active'      // نشط
  | 'treating'    // قيد العلاج
  | 'resolved'    // تم الحل
  | 'chronic';    // مزمن

/**
 * Disease Outcome - نتيجة المرض
 */
export interface DiseaseOutcome {
  status: 'recovered' | 'improved' | 'unchanged' | 'worsened' | 'fatal';
  notes?: string;
  recoveryTime?: number; // Days
  effectiveness?: number; // 0-100%
}

/**
 * Treatment Record - سجل علاج
 */
export interface TreatmentRecord {
  id: string;
  hiveRecordId: string;
  treatmentId: string;
  treatment?: Treatment; // Optional populated treatment
  
  // Schedule Information
  scheduleId?: string;
  schedule?: TreatmentSchedule;
  
  // Application Details
  appliedAt: Date;
  appliedBy: string; // User ID
  dosage: string;
  method: string;
  
  // Target Disease
  targetDiseaseIds: string[];
  
  // Cost
  cost?: {
    amount: number;
    currency: string;
  };
  
  // Effectiveness
  effectiveness?: {
    rating: 1 | 2 | 3 | 4 | 5;
    notes?: string;
    assessedAt?: Date;
  };
  
  // Side Effects
  sideEffects?: string[];
  
  // Images
  imageIds: string[];
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Inspection Record - سجل فحص
 */
export interface InspectionRecord {
  id: string;
  hiveRecordId: string;
  
  // Inspection Details
  inspectedAt: Date;
  inspectedBy: string; // User ID
  duration?: number; // Minutes
  
  // Hive Condition
  condition: HiveCondition;
  
  // Population
  population?: {
    bees: 'low' | 'medium' | 'high';
    brood: 'low' | 'medium' | 'high';
    queen: 'present' | 'absent' | 'unknown';
    queenQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  
  // Resources
  resources?: {
    honey: 'low' | 'medium' | 'high';
    pollen: 'low' | 'medium' | 'high';
    space: 'cramped' | 'adequate' | 'spacious';
  };
  
  // Health Indicators
  health?: {
    diseasesSuspected: string[]; // Disease IDs
    parasitesFound: string[];
    abnormalities: string[];
  };
  
  // Weather Conditions
  weather?: {
    temperature?: number;
    humidity?: number;
    conditions?: string;
  };
  
  // Actions Taken
  actionsTaken?: string[];
  
  // Images
  imageIds: string[];
  
  // Notes
  notes?: string;
  
  // Next Inspection
  nextInspectionDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hive Condition - حالة الخلية
 */
export type HiveCondition = 
  | 'excellent'  // ممتازة
  | 'good'       // جيدة
  | 'fair'       // مقبولة
  | 'poor'       // سيئة
  | 'critical';  // حرجة

/**
 * Image Record - سجل صورة
 */
export interface ImageRecord {
  id: string;
  hiveRecordId: string;
  
  // Image Details
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimeType: string;
  size: number; // Bytes
  
  // Dimensions
  width?: number;
  height?: number;
  
  // Metadata
  capturedAt: Date;
  capturedBy: string; // User ID
  
  // Context
  context: ImageContext;
  relatedRecordId?: string; // Disease, Treatment, or Inspection ID
  
  // Tags
  tags: string[];
  
  // Description
  description?: {
    ar?: string;
    en?: string;
    fr?: string;
  };
  
  // Analysis Results (if analyzed)
  analysis?: {
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    detectedSymptoms?: string[];
    confidence?: number;
    analyzedAt?: Date;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Image Context - سياق الصورة
 */
export type ImageContext = 
  | 'disease'      // مرض
  | 'treatment'    // علاج
  | 'inspection'   // فحص
  | 'general';     // عام

/**
 * Note Record - سجل ملاحظة
 */
export interface NoteRecord {
  id: string;
  hiveRecordId: string;
  
  // Note Content
  content: string;
  
  // Context
  context?: NoteContext;
  relatedRecordId?: string; // Disease, Treatment, or Inspection ID
  
  // Author
  authorId: string;
  authorName?: string;
  
  // Tags
  tags: string[];
  
  // Priority
  priority?: 'low' | 'medium' | 'high';
  
  // Reminder
  reminder?: {
    date: Date;
    sent: boolean;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Note Context - سياق الملاحظة
 */
export type NoteContext = 
  | 'disease'      // مرض
  | 'treatment'    // علاج
  | 'inspection'   // فحص
  | 'general';     // عام

/**
 * Hive Statistics - إحصائيات الخلية
 */
export interface HiveStatistics {
  // Disease Statistics
  totalDiseases: number;
  activeDiseases: number;
  resolvedDiseases: number;
  mostCommonDisease?: string; // Disease ID
  
  // Treatment Statistics
  totalTreatments: number;
  activeTreatments: number;
  completedTreatments: number;
  totalCost: number;
  averageTreatmentEffectiveness?: number;
  
  // Inspection Statistics
  totalInspections: number;
  lastInspectionDate?: Date;
  averageCondition?: number; // 1-5
  inspectionFrequency?: number; // Days
  
  // Image Statistics
  totalImages: number;
  
  // Note Statistics
  totalNotes: number;
  
  // Health Score
  healthScore?: number; // 0-100
  healthTrend?: 'improving' | 'stable' | 'declining';
  
  // Last Updated
  lastUpdated: Date;
}

/**
 * Report Type - نوع التقرير
 */
export type ReportType = 
  | 'daily'      // يومي
  | 'weekly'     // أسبوعي
  | 'monthly'    // شهري
  | 'quarterly'  // ربع سنوي
  | 'yearly'     // سنوي
  | 'custom';    // مخصص

/**
 * Report Format - صيغة التقرير
 */
export type ReportFormat = 
  | 'json'   // JSON
  | 'csv'    // CSV
  | 'pdf';   // PDF

/**
 * Report Options - خيارات التقرير
 */
export interface ReportOptions {
  type: ReportType;
  format: ReportFormat;
  startDate?: Date;
  endDate?: Date;
  
  // Sections to Include
  includeDiseases?: boolean;
  includeTreatments?: boolean;
  includeInspections?: boolean;
  includeImages?: boolean;
  includeNotes?: boolean;
  includeStatistics?: boolean;
  
  // Language
  language?: 'ar' | 'en' | 'fr';
  
  // Filters
  diseaseIds?: string[];
  treatmentIds?: string[];
}

/**
 * Report Data - بيانات التقرير
 */
export interface ReportData {
  hiveRecord: HiveRecord;
  options: ReportOptions;
  generatedAt: Date;
  generatedBy: string;
  
  // Summary
  summary: {
    period: string;
    totalDiseases: number;
    totalTreatments: number;
    totalInspections: number;
    healthScore?: number;
  };
  
  // Detailed Data
  diseases?: DiseaseRecord[];
  treatments?: TreatmentRecord[];
  inspections?: InspectionRecord[];
  images?: ImageRecord[];
  notes?: NoteRecord[];
  statistics?: HiveStatistics;
}

/**
 * Search Filters - فلاتر البحث
 */
export interface HiveRecordSearchFilters {
  // Date Range
  startDate?: Date;
  endDate?: Date;
  
  // Disease Filters
  diseaseIds?: string[];
  diseaseStatus?: DiseaseStatus[];
  diseaseSeverity?: (1 | 2 | 3 | 4 | 5)[];
  
  // Treatment Filters
  treatmentIds?: string[];
  
  // Inspection Filters
  condition?: HiveCondition[];
  
  // Context Filters
  hasImages?: boolean;
  hasNotes?: boolean;
  
  // Text Search
  searchText?: string;
  
  // Tags
  tags?: string[];
}
