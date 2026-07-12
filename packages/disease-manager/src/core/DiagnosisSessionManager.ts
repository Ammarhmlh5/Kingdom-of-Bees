/**
 * مدير جلسات التشخيص
 * Diagnosis Session Manager
 * 
 * يدير جلسات التشخيص وحالتها
 */

import {
  DiagnosisSession,
  DiagnosisSessionOptions,
  InputSymptom,
  DiagnosisImage,
  DiagnosisResult,
} from '../types/diagnosis';

/**
 * مدير جلسات التشخيص
 */
export class DiagnosisSessionManager {
  private sessions: Map<string, DiagnosisSession> = new Map();
  private activeSessionId: string | null = null;

  /**
   * إنشاء جلسة تشخيص جديدة
   * Create a new diagnosis session
   */
  startSession(options: DiagnosisSessionOptions = {}): DiagnosisSession {
    const sessionId = this.generateSessionId();

    const session: DiagnosisSession = {
      id: sessionId,
      hiveId: options.hiveId,
      status: 'active',
      startedAt: new Date(),
      inputSymptoms: options.initialSymptoms || [],
      images: options.initialImages || [],
      notes: options.notes,
    };

    this.sessions.set(sessionId, session);
    this.activeSessionId = sessionId;

    return session;
  }

  /**
   * الحصول على الجلسة النشطة
   * Get active session
   */
  getActiveSession(): DiagnosisSession | null {
    if (!this.activeSessionId) {
      return null;
    }
    return this.sessions.get(this.activeSessionId) || null;
  }

  /**
   * الحصول على جلسة بواسطة المعرف
   * Get session by ID
   */
  getSession(sessionId: string): DiagnosisSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * الحصول على جميع الجلسات
   * Get all sessions
   */
  getAllSessions(): DiagnosisSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * الحصول على جلسات خلية معينة
   * Get sessions for a specific hive
   */
  getHiveSessions(hiveId: string): DiagnosisSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.hiveId === hiveId
    );
  }

  /**
   * إضافة عرض للجلسة
   * Add symptom to session
   */
  addSymptom(sessionId: string, symptom: InputSymptom): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    // تحقق من عدم وجود العرض مسبقاً
    const exists = session.inputSymptoms.some((s) => s.id === symptom.id);
    if (exists) {
      return false;
    }

    session.inputSymptoms.push(symptom);
    return true;
  }

  /**
   * إزالة عرض من الجلسة
   * Remove symptom from session
   */
  removeSymptom(sessionId: string, symptomId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    const index = session.inputSymptoms.findIndex((s) => s.id === symptomId);
    if (index === -1) {
      return false;
    }

    session.inputSymptoms.splice(index, 1);
    return true;
  }

  /**
   * تحديث عرض في الجلسة
   * Update symptom in session
   */
  updateSymptom(sessionId: string, symptom: InputSymptom): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    const index = session.inputSymptoms.findIndex((s) => s.id === symptom.id);
    if (index === -1) {
      return false;
    }

    session.inputSymptoms[index] = symptom;
    return true;
  }

  /**
   * إضافة صورة للجلسة
   * Add image to session
   */
  addImage(sessionId: string, image: DiagnosisImage): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    session.images.push(image);
    return true;
  }

  /**
   * إزالة صورة من الجلسة
   * Remove image from session
   */
  removeImage(sessionId: string, imageId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    const index = session.images.findIndex((img) => img.id === imageId);
    if (index === -1) {
      return false;
    }

    session.images.splice(index, 1);
    return true;
  }

  /**
   * تحديث ملاحظات الجلسة
   * Update session notes
   */
  updateNotes(sessionId: string, notes: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.notes = notes;
    return true;
  }

  /**
   * حفظ نتيجة التشخيص
   * Save diagnosis result
   */
  saveResult(sessionId: string, result: DiagnosisResult): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.result = result;
    return true;
  }

  /**
   * إكمال الجلسة
   * Complete session
   */
  completeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    session.status = 'completed';
    session.completedAt = new Date();

    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }

    return true;
  }

  /**
   * إلغاء الجلسة
   * Cancel session
   */
  cancelSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    session.status = 'cancelled';
    session.completedAt = new Date();

    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }

    return true;
  }

  /**
   * حذف جلسة
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }

    return this.sessions.delete(sessionId);
  }

  /**
   * مسح جميع الجلسات
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.sessions.clear();
    this.activeSessionId = null;
  }

  /**
   * الحصول على إحصائيات الجلسات
   * Get session statistics
   */
  getStatistics() {
    const allSessions = Array.from(this.sessions.values());
    const completedSessions = allSessions.filter((s) => s.status === 'completed');

    const totalDuration = completedSessions.reduce((sum, session) => {
      if (session.completedAt) {
        const duration = session.completedAt.getTime() - session.startedAt.getTime();
        return sum + duration;
      }
      return sum;
    }, 0);

    const averageDuration = completedSessions.length > 0
      ? totalDuration / completedSessions.length / 60000 // تحويل إلى دقائق
      : 0;

    return {
      totalSessions: allSessions.length,
      activeSessions: allSessions.filter((s) => s.status === 'active').length,
      completedSessions: completedSessions.length,
      cancelledSessions: allSessions.filter((s) => s.status === 'cancelled').length,
      averageDuration: Math.round(averageDuration * 10) / 10,
    };
  }

  /**
   * توليد معرف جلسة فريد
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// تصدير نسخة singleton
export const diagnosisSessionManager = new DiagnosisSessionManager();
