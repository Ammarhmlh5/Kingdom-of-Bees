import apiClient from '../apiClient';

export class AIService {
  static async chat(message: string, context?: string): Promise<string> {
    try {
      const { data } = await apiClient.post('/ai/chat', { message, context });
      return data.data?.response || data.response || 'لم أتمكن من الرد.';
    } catch {
      return this.fallbackAdvisor(message);
    }
  }

  static async analyzeInspection(frames: any[]): Promise<string> {
    try {
      const { data } = await apiClient.post('/ai/analyze-inspection', { frames });
      return data.data?.analysis || data.analysis || 'لا توجد توصيات حالياً.';
    } catch {
      return this.fallbackInspectionAnalysis(frames);
    }
  }

  private static fallbackAdvisor(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('مرض') || lower.includes('حشرات')) {
      return 'الأعراض تشمل: فقدان ملكة، قشور بيضاء، أو رائحة كريهة. يُنصح بفحص الإطار والتأكد من صحة الملكة.';
    }
    if (lower.includes('تغذية') || lower.includes('عسل')) {
      return 'للتغذية: أضف محلول سكر 1:1 في الربيع، أو 2:1 قبل الشتاء. تأكد من أن الخلايا تحتوي على تخزين كافٍ.';
    }
    if (lower.includes('تفريخ') || lower.includes('ملك')) {
      return 'لقاح الملكة يحدث عادةً في الأسبوع الثاني من الربيع. راقب ظهور البيض واليرقات للتأكد من نجاح التلقيح.';
    }
    return 'أنا مساعد ذكاء اصطناعي لرعاية النحل. اسألني عن الأمراض، التغذية، أو التفريخ!';
  }

  private static fallbackInspectionAnalysis(frames: any[]): string {
    const issues: string[] = [];
    const recommendations: string[] = [];

    for (const frame of frames) {
      if ((frame.broodPercent || 0) < 20) {
        issues.push('نسبة البيض منخفضة في الإطار ' + frame.position);
        recommendations.push('تحقق من صحة الملكة');
      }
      if ((frame.honeyPercent || 0) < 10) {
        issues.push('تخزين العسل غير كافٍ في الإطار ' + frame.position);
        recommendations.push('أضف تغذية إضافية');
      }
    }

    if (issues.length === 0) {
      return 'الخلايا تبدو بصحة جيدة. استمر في المراقبة الدورية.';
    }

    return `المشاكل المكتشفة:\n${issues.map(i => '• ' + i).join('\n')}\n\nالتوصيات:\n${recommendations.map(r => '• ' + r).join('\n')}`;
  }
}
