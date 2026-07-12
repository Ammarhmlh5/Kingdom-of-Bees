/**
 * محرك التشخيص
 * Diagnosis Engine
 * 
 * المحرك الرئيسي لتحليل الأعراض وتوليد التشخيص
 */

import {
  DiagnosisSession,
  DiagnosisResult,
  PossibleDisease,
  TreatmentRecommendation,
  AnalysisOptions,
} from '../types/diagnosis';
import { SeverityLevel } from '../types/disease';
import { SymptomMatcher, MatchingOptions } from './SymptomMatcher';
import { TreatmentService } from '../services/TreatmentService';
import { LocalizedString } from '../i18n/types';

/**
 * محرك التشخيص
 */
export class DiagnosisEngine {
  /**
   * تحليل جلسة تشخيص
   * Analyze diagnosis session
   */
  static analyze(
    session: DiagnosisSession,
    options: AnalysisOptions = {}
  ): DiagnosisResult {
    const {
      minProbability = 0.3,
      maxResults = 5,
      considerSeasonality = false,
      // considerGeography = false,
    } = options;

    // مطابقة الأعراض مع الأمراض
    const matchingOptions: MatchingOptions = {
      minMatchPercentage: minProbability,
      considerSeverity: true,
      severityWeight: 0.3,
      considerSeasonality,
    };

    let possibleDiseases = SymptomMatcher.matchSymptoms(
      session.inputSymptoms,
      matchingOptions
    );

    // تحديد عدد النتائج
    possibleDiseases = possibleDiseases.slice(0, maxResults);

    // تقييم مستوى الخطورة الإجمالي
    const overallSeverity = this.calculateOverallSeverity(possibleDiseases);

    // توليد التوصيات العلاجية
    const recommendations = this.generateTreatmentRecommendations(
      possibleDiseases
    );

    // توليد الخطوات التالية
    const nextSteps = this.generateNextSteps(possibleDiseases, overallSeverity);

    // حساب الثقة الإجمالية
    const confidence = this.calculateOverallConfidence(possibleDiseases);

    // إنشاء نتيجة التشخيص
    const result: DiagnosisResult = {
      id: this.generateResultId(),
      sessionId: session.id,
      timestamp: new Date(),
      possibleDiseases,
      overallSeverity,
      recommendations,
      nextSteps,
      confidence,
    };

    return result;
  }

  /**
   * حساب مستوى الخطورة الإجمالي
   * Calculate overall severity
   */
  private static calculateOverallSeverity(
    possibleDiseases: PossibleDisease[]
  ): SeverityLevel {
    if (possibleDiseases.length === 0) {
      return 'low';
    }

    // أخذ أعلى مستوى خطورة من الأمراض المحتملة
    // مع مراعاة احتمالية كل مرض
    let weightedSeverity = 0;
    let totalWeight = 0;

    for (const pd of possibleDiseases) {
      const weight = pd.probability * pd.confidence;
      weightedSeverity += this.severityToNumber(pd.disease.severity) * weight;
      totalWeight += weight;
    }

    const averageSeverity =
      totalWeight > 0 ? weightedSeverity / totalWeight : 1;

    // تقريب إلى أقرب مستوى خطورة
    return this.numberToSeverity(Math.round(averageSeverity));
  }

  /**
   * توليد التوصيات العلاجية
   * Generate treatment recommendations
   */
  private static generateTreatmentRecommendations(
    possibleDiseases: PossibleDisease[]
  ): TreatmentRecommendation[] {
    const recommendations: TreatmentRecommendation[] = [];

    // لكل مرض محتمل، نوصي بالعلاجات المناسبة
    for (const pd of possibleDiseases) {
      const diseaseId = pd.disease.id;

      // الحصول على العلاجات الموصى بها لهذا المرض
      const treatments = TreatmentService.getRecommendedTreatmentsForDisease(
        diseaseId
      );

      // إضافة أفضل 2 علاجات
      for (const treatment of treatments.slice(0, 2)) {
        // تحديد الأولوية بناءً على احتمالية المرض وخطورته
        const priority = this.determinePriority(pd);

        recommendations.push({
          treatmentId: treatment.id,
          priority,
          reasoning: {
            ar: `علاج موصى به لـ ${pd.disease.name.ar} (احتمالية: ${Math.round(
              pd.probability * 100
            )}%)`,
            en: `Recommended treatment for ${pd.disease.name.en
              } (probability: ${Math.round(pd.probability * 100)}%)`,
            fr: `Traitement recommandé pour ${pd.disease.name.fr
              } (probabilité: ${Math.round(pd.probability * 100)}%)`,
          },
        });
      }
    }

    // إزالة التكرارات وترتيب حسب الأولوية
    const uniqueRecommendations = this.deduplicateRecommendations(
      recommendations
    );

    return uniqueRecommendations.slice(0, 5); // أفضل 5 توصيات
  }

  /**
   * تحديد أولوية التوصية
   * Determine recommendation priority
   */
  private static determinePriority(
    pd: PossibleDisease
  ): 'high' | 'medium' | 'low' {
    const score = pd.probability * pd.confidence * (this.severityToNumber(pd.disease.severity) / 5);

    if (score >= 0.6) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  }

  /**
   * إزالة التوصيات المكررة
   * Deduplicate recommendations
   */
  private static deduplicateRecommendations(
    recommendations: TreatmentRecommendation[]
  ): TreatmentRecommendation[] {
    const seen = new Set<string>();
    const unique: TreatmentRecommendation[] = [];

    for (const rec of recommendations) {
      if (!seen.has(rec.treatmentId)) {
        seen.add(rec.treatmentId);
        unique.push(rec);
      }
    }

    // ترتيب حسب الأولوية
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    unique.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return unique;
  }

  /**
   * توليد الخطوات التالية
   * Generate next steps
   */
  private static generateNextSteps(
    possibleDiseases: PossibleDisease[],
    overallSeverity: SeverityLevel
  ): LocalizedString[] {
    const steps: LocalizedString[] = [];

    if (possibleDiseases.length === 0) {
      steps.push({
        ar: 'لم يتم العثور على أمراض محتملة. يُنصح بمراقبة الخلية والتحقق من الأعراض مرة أخرى.',
        en: 'No possible diseases found. It is recommended to monitor the hive and check symptoms again.',
        fr: "Aucune maladie possible trouvée. Il est recommandé de surveiller la ruche et de vérifier à nouveau les symptômes.",
      });
      return steps;
    }

    // خطوات بناءً على مستوى الخطورة
    const severityNum = this.severityToNumber(overallSeverity);
    if (severityNum >= 4) {
      steps.push({
        ar: '⚠️ حالة طارئة: اتصل بطبيب بيطري متخصص فوراً',
        en: '⚠️ Emergency: Contact a specialized veterinarian immediately',
        fr: '⚠️ Urgence: Contactez immédiatement un vétérinaire spécialisé',
      });
    } else if (severityNum >= 3) {
      steps.push({
        ar: 'يُنصح بالتشاور مع خبير نحل أو طبيب بيطري',
        en: 'It is recommended to consult with a bee expert or veterinarian',
        fr: 'Il est recommandé de consulter un expert en apiculture ou un vétérinaire',
      });
    }

    // خطوات عامة
    steps.push({
      ar: 'عزل الخلية المصابة عن الخلايا الأخرى لمنع انتشار المرض',
      en: 'Isolate the infected hive from other hives to prevent disease spread',
      fr: 'Isoler la ruche infectée des autres ruches pour empêcher la propagation de la maladie',
    });

    if (possibleDiseases.length > 0) {
      steps.push({
        ar: 'ابدأ العلاج الموصى به في أقرب وقت ممكن',
        en: 'Start the recommended treatment as soon as possible',
        fr: 'Commencer le traitement recommandé dès que possible',
      });
    }

    steps.push({
      ar: 'راقب الخلية يومياً وسجل أي تغييرات في الأعراض',
      en: 'Monitor the hive daily and record any changes in symptoms',
      fr: 'Surveiller la ruche quotidiennement et enregistrer tout changement de symptômes',
    });

    steps.push({
      ar: 'حافظ على نظافة المعدات والأدوات لمنع العدوى المتقاطعة',
      en: 'Maintain cleanliness of equipment and tools to prevent cross-contamination',
      fr: "Maintenir la propreté de l'équipement et des outils pour éviter la contamination croisée",
    });

    return steps;
  }

  /**
   * حساب الثقة الإجمالية
   * Calculate overall confidence
   */
  private static calculateOverallConfidence(
    possibleDiseases: PossibleDisease[]
  ): number {
    if (possibleDiseases.length === 0) {
      return 0;
    }

    // متوسط الثقة للأمراض المحتملة (مرجح بالاحتمالية)
    let weightedConfidence = 0;
    let totalWeight = 0;

    for (const pd of possibleDiseases) {
      weightedConfidence += pd.confidence * pd.probability;
      totalWeight += pd.probability;
    }

    return totalWeight > 0 ? weightedConfidence / totalWeight : 0;
  }

  /**
   * توليد معرف نتيجة فريد
   * Generate unique result ID
   */
  private static generateResultId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * تحويل مستوى الخطورة من string إلى number
   */
  private static severityToNumber(severity: SeverityLevel): number {
    const map: Record<SeverityLevel, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };
    return map[severity];
  }

  /**
   * تحويل مستوى الخطورة من number إلى string
   */
  private static numberToSeverity(num: number): SeverityLevel {
    if (num <= 1) return 'low';
    if (num === 2) return 'medium';
    if (num === 3) return 'high';
    return 'critical';
  }
}
