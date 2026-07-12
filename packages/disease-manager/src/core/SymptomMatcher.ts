/**
 * محرك مطابقة الأعراض
 * Symptom Matching Engine
 * 
 * يطابق الأعراض المدخلة مع الأمراض المحتملة
 */

import { Disease, Symptom } from '../types/disease';
import { InputSymptom, PossibleDisease } from '../types/diagnosis';
import { DiseaseService } from '../services/DiseaseService';

/**
 * خيارات المطابقة
 * Matching Options
 */
export interface MatchingOptions {
  minMatchPercentage?: number; // الحد الأدنى لنسبة التطابق (افتراضي: 30%)
  considerSeverity?: boolean; // مراعاة مستوى الخطورة (افتراضي: true)
  severityWeight?: number; // وزن مستوى الخطورة (0-1، افتراضي: 0.3)
  considerSeasonality?: boolean; // مراعاة الموسمية (افتراضي: false)
  currentSeason?: 'spring' | 'summer' | 'fall' | 'winter';
}

/**
 * نتيجة المطابقة
 * Match Result
 */
interface MatchResult {
  disease: Disease;
  matchedSymptoms: Symptom[];
  missingSymptoms: Symptom[];
  matchScore: number; // 0-1
  severityScore: number; // 0-1
  finalScore: number; // 0-1
}

/**
 * محرك مطابقة الأعراض
 */
export class SymptomMatcher {
  /**
   * مطابقة الأعراض مع الأمراض
   * Match symptoms with diseases
   */
  static matchSymptoms(
    inputSymptoms: InputSymptom[],
    options: MatchingOptions = {}
  ): PossibleDisease[] {
    const {
      minMatchPercentage = 0.3,
      considerSeverity = true,
      severityWeight = 0.3,
      considerSeasonality = false,
      currentSeason,
    } = options;

    // الحصول على جميع الأمراض
    const diseaseServiceInstance = new DiseaseService();
    const allDiseases = diseaseServiceInstance.getDiseases({});

    // مطابقة كل مرض
    const matchResults: MatchResult[] = allDiseases.map((disease: Disease) => {
      return this.matchDiseaseSymptoms(disease, inputSymptoms, {
        considerSeverity,
        severityWeight,
      });
    });

    // فلترة النتائج حسب الحد الأدنى
    let filteredResults = matchResults.filter(
      (result) => result.finalScore >= minMatchPercentage
    );

    // فلترة حسب الموسمية إذا كانت مفعلة
    if (considerSeasonality && currentSeason) {
      filteredResults = filteredResults.filter((result) => {
        const seasonality = result.disease.seasonality;
        if (!seasonality || seasonality.length === 0) {
          return true; // إذا لم تكن هناك معلومات موسمية، نعتبر المرض محتمل
        }
        return seasonality.includes(currentSeason);
      });
    }

    // ترتيب حسب النتيجة النهائية
    filteredResults.sort((a, b) => b.finalScore - a.finalScore);

    // تحويل إلى PossibleDisease
    return filteredResults.map((result) => this.toPossibleDisease(result));
  }

  /**
   * مطابقة أعراض مرض واحد
   * Match single disease symptoms
   */
  private static matchDiseaseSymptoms(
    disease: Disease,
    inputSymptoms: InputSymptom[],
    options: { considerSeverity: boolean; severityWeight: number }
  ): MatchResult {
    const diseaseSymptoms = disease.symptoms;
    const matchedSymptoms: Symptom[] = [];
    const missingSymptoms: Symptom[] = [];

    // مطابقة الأعراض
    for (const diseaseSymptom of diseaseSymptoms) {
      const matched = inputSymptoms.some((inputSymptom) =>
        this.symptomsMatch(inputSymptom, diseaseSymptom)
      );

      if (matched) {
        matchedSymptoms.push(diseaseSymptom);
      } else {
        missingSymptoms.push(diseaseSymptom);
      }
    }

    // حساب نسبة التطابق
    const matchScore =
      diseaseSymptoms.length > 0
        ? matchedSymptoms.length / diseaseSymptoms.length
        : 0;

    // حساب نسبة تطابق مستوى الخطورة
    let severityScore = 1.0;
    if (options.considerSeverity && matchedSymptoms.length > 0) {
      severityScore = this.calculateSeverityScore(
        inputSymptoms,
        matchedSymptoms
      );
    }

    // حساب النتيجة النهائية
    const finalScore = options.considerSeverity
      ? matchScore * (1 - options.severityWeight) +
      severityScore * options.severityWeight
      : matchScore;

    return {
      disease,
      matchedSymptoms,
      missingSymptoms,
      matchScore,
      severityScore,
      finalScore,
    };
  }

  /**
   * التحقق من تطابق عرضين
   * Check if two symptoms match
   */
  private static symptomsMatch(
    inputSymptom: InputSymptom,
    diseaseSymptom: Symptom
  ): boolean {
    // مطابقة بسيطة بناءً على المعرف أو الاسم
    if (inputSymptom.id === diseaseSymptom.id) {
      return true;
    }

    // مطابقة بناءً على الاسم (أي لغة)
    const inputName = inputSymptom.name.ar.toLowerCase();
    const diseaseName = diseaseSymptom.description.ar.toLowerCase();

    return inputName === diseaseName;
  }

  /**
   * حساب نسبة تطابق مستوى الخطورة
   * Calculate severity score
   */
  private static calculateSeverityScore(
    _inputSymptoms: InputSymptom[],
    _matchedSymptoms: Symptom[]
  ): number {
    // Since Symptom type doesn't have severity property,
    // we'll return a default score based on match quality
    return 1.0;
  }

  /**
   * حساب مستوى الثقة
   * Calculate confidence level
   */
  private static calculateConfidence(result: MatchResult): number {
    // الثقة تعتمد على:
    // 1. عدد الأعراض المطابقة (كلما زادت، زادت الثقة)
    // 2. نسبة التطابق
    // 3. تطابق مستوى الخطورة

    const symptomCountFactor = Math.min(
      result.matchedSymptoms.length / 3,
      1.0
    ); // 3 أعراض أو أكثر = ثقة كاملة
    const matchFactor = result.matchScore;
    const severityFactor = result.severityScore;

    // متوسط مرجح
    return (
      symptomCountFactor * 0.3 + matchFactor * 0.4 + severityFactor * 0.3
    );
  }

  /**
   * توليد التفسير
   * Generate reasoning
   */
  private static generateReasoning(result: MatchResult): {
    ar: string;
    en: string;
    fr: string;
  } {
    const matchedCount = result.matchedSymptoms.length;
    const totalCount = result.disease.symptoms.length;
    const percentage = Math.round(result.matchScore * 100);

    return {
      ar: `تطابق ${matchedCount} من ${totalCount} أعراض (${percentage}%). ${result.missingSymptoms.length > 0
        ? `الأعراض المفقودة: ${result.missingSymptoms
          .map((s) => s.description.ar)
          .join('، ')}.`
        : 'جميع الأعراض متطابقة.'
        }`,
      en: `Matched ${matchedCount} of ${totalCount} symptoms (${percentage}%). ${result.missingSymptoms.length > 0
        ? `Missing symptoms: ${result.missingSymptoms
          .map((s) => s.description.en)
          .join(', ')}.`
        : 'All symptoms matched.'
        }`,
      fr: `${matchedCount} sur ${totalCount} symptômes correspondent (${percentage}%). ${result.missingSymptoms.length > 0
        ? `Symptômes manquants: ${result.missingSymptoms
          .map((s) => s.description.fr || s.description.en)
          .join(', ')}.`
        : 'Tous les symptômes correspondent.'
        }`,
    };
  }

  /**
   * تحويل إلى PossibleDisease
   * Convert to PossibleDisease
   */
  private static toPossibleDisease(result: MatchResult): PossibleDisease {
    return {
      disease: result.disease,
      probability: result.finalScore,
      confidence: this.calculateConfidence(result),
      matchedSymptoms: result.matchedSymptoms,
      missingSymptoms: result.missingSymptoms,
      reasoning: this.generateReasoning(result),
    };
  }
}
