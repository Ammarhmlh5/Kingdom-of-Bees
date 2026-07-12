/**
 * خدمة التشخيص
 * Diagnosis Service
 * 
 * خدمة شاملة لإدارة عمليات التشخيص
 */

import {
  DiagnosisSession,
  DiagnosisResult,
  DiagnosisSessionOptions,
  AnalysisOptions,
  DiagnosisStatistics,
} from '../types/diagnosis';
import { DiagnosisSessionManager } from '../core/DiagnosisSessionManager';
import { DiagnosisEngine } from '../core/DiagnosisEngine';
import { DatabaseAdapter } from '../database/types';

/**
 * خدمة التشخيص
 */
export class DiagnosisService {
  private sessionManager: DiagnosisSessionManager;
  private database?: DatabaseAdapter;

  constructor(database?: DatabaseAdapter) {
    this.sessionManager = new DiagnosisSessionManager();
    this.database = database;
  }

  /**
   * بدء جلسة تشخيص جديدة
   */
  async startSession(options: DiagnosisSessionOptions = {}): Promise<DiagnosisSession> {
    const session = this.sessionManager.startSession(options);

    // حفظ في قاعدة البيانات إذا كانت متاحة
    if (this.database) {
      try {
        await this.database.create('diagnosis_sessions', session);
      } catch (error) {
        console.error('Failed to save session to database:', error);
      }
    }

    return session;
  }

  /**
   * تحليل جلسة وحفظ النتيجة
   */
  async analyzeAndSave(
    sessionId: string,
    options: AnalysisOptions = {}
  ): Promise<DiagnosisResult | null> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      return null;
    }

    // تحليل الجلسة
    const result = DiagnosisEngine.analyze(session, options);

    // حفظ النتيجة في الجلسة
    this.sessionManager.saveResult(sessionId, result);

    // حفظ في قاعدة البيانات
    if (this.database) {
      try {
        await this.database.create('diagnosis_results', result);
        await this.database.update('diagnosis_sessions', sessionId, {
          result,
          status: 'completed',
          completedAt: new Date(),
        });
      } catch (error) {
        console.error('Failed to save result to database:', error);
      }
    }

    return result;
  }

  /**
   * إكمال جلسة
   */
  async completeSession(sessionId: string): Promise<boolean> {
    const success = this.sessionManager.completeSession(sessionId);

    if (success && this.database) {
      try {
        await this.database.update('diagnosis_sessions', sessionId, {
          status: 'completed',
          completedAt: new Date(),
        });
      } catch (error) {
        console.error('Failed to update session in database:', error);
      }
    }

    return success;
  }

  /**
   * الحصول على جلسة
   */
  async getSession(sessionId: string): Promise<DiagnosisSession | null> {
    // محاولة الحصول من الذاكرة أولاً
    let session = this.sessionManager.getSession(sessionId);

    // إذا لم توجد، حاول من قاعدة البيانات
    if (!session && this.database) {
      try {
        session = await this.database.read('diagnosis_sessions', sessionId);
      } catch (error) {
        console.error('Failed to read session from database:', error);
      }
    }

    return session;
  }

  /**
   * الحصول على جميع جلسات خلية
   */
  async getHiveSessions(hiveId: string): Promise<DiagnosisSession[]> {
    // من الذاكرة
    let sessions = this.sessionManager.getHiveSessions(hiveId);

    // من قاعدة البيانات
    if (this.database) {
      try {
        const dbSessions = await this.database.query<DiagnosisSession>(
          'diagnosis_sessions',
          {
            where: [{ field: 'hiveId', operator: 'eq', value: hiveId }],
            orderBy: [{ field: 'startedAt', direction: 'desc' }],
          }
        );

        // دمج النتائج وإزالة التكرار
        const allSessions = [...sessions, ...dbSessions];
        const uniqueSessions = Array.from(
          new Map(allSessions.map(s => [s.id, s])).values()
        );

        return uniqueSessions;
      } catch (error) {
        console.error('Failed to query sessions from database:', error);
      }
    }

    return sessions;
  }

  /**
   * الحصول على نتيجة تشخيص
   */
  async getResult(resultId: string): Promise<DiagnosisResult | null> {
    if (!this.database) {
      return null;
    }

    try {
      return await this.database.read('diagnosis_results', resultId);
    } catch (error) {
      console.error('Failed to read result from database:', error);
      return null;
    }
  }

  /**
   * حذف جلسة
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const success = this.sessionManager.deleteSession(sessionId);

    if (success && this.database) {
      try {
        await this.database.delete('diagnosis_sessions', sessionId);
      } catch (error) {
        console.error('Failed to delete session from database:', error);
      }
    }

    return success;
  }

  /**
   * الحصول على إحصائيات
   */
  async getStatistics(): Promise<DiagnosisStatistics> {
    const memoryStats = this.sessionManager.getStatistics();

    if (!this.database) {
      return {
        totalSessions: memoryStats.totalSessions,
        completedSessions: memoryStats.completedSessions,
        averageConfidence: 0,
        mostCommonDiseases: [],
        averageSessionDuration: memoryStats.averageDuration,
      };
    }

    try {
      // الحصول على جميع النتائج من قاعدة البيانات
      const results = await this.database.query<DiagnosisResult>(
        'diagnosis_results',
        {}
      );

      // حساب متوسط الثقة
      const avgConfidence = results.length > 0
        ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length
        : 0;

      // حساب الأمراض الأكثر شيوعاً
      const diseaseCount = new Map<string, number>();
      results.forEach(result => {
        result.possibleDiseases.forEach(pd => {
          const count = diseaseCount.get(pd.disease.id) || 0;
          diseaseCount.set(pd.disease.id, count + 1);
        });
      });

      const mostCommon = Array.from(diseaseCount.entries())
        .map(([diseaseId, count]) => ({ diseaseId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSessions: memoryStats.totalSessions,
        completedSessions: memoryStats.completedSessions,
        averageConfidence: avgConfidence,
        mostCommonDiseases: mostCommon,
        averageSessionDuration: memoryStats.averageDuration,
      };
    } catch (error) {
      console.error('Failed to calculate statistics:', error);
      return {
        totalSessions: memoryStats.totalSessions,
        completedSessions: memoryStats.completedSessions,
        averageConfidence: 0,
        mostCommonDiseases: [],
        averageSessionDuration: memoryStats.averageDuration,
      };
    }
  }
}
