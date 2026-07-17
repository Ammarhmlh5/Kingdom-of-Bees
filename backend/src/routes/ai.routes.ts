import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/response';

const router = Router();
router.use(requireAuth);

const ADVICE: Record<string, string> = {
  'مرض': 'الأعراض الشائعة: فقدان الملكة، قشور بيضاء على الأطر، رائحة كريهة. يُنصح بفحص الإطار والتأكد من صحة الملكة. عالج فاروا بـ Apivar أو Bayvarol.',
  'تغذية': 'شراب سكر 1:1 يُستخدم في الربيع لتحفيز التفريخ. شراب 2:1 يُخزّن قبل الشتاء. الفوندانت بديل ممتاز في الطقس البارد.',
  'ملك': 'تبديل الملكة كل 2-3 سنوات لضمان الإنتاجية. لاحظ ظهور البيض واليرقات للتأكد من نجاح التلقيح. ملك الطوارئ يحدث عند فقدان الملكة فجأة.',
  'تفريخ': 'لقاح الملكة يحدث عادةً في الأسبوع الثاني من الربيع. راقب ظهور البيض واليرقات. إذا لم تُلَقَّح الملكة، يُنصح باستبدالها.',
  'حصاد': 'احصد عندما تكون الأطر مغطاة بطبقة شمع بنسبة 80% أو أكثر. تأكد من وجود تخزين كافٍ للنحل قبل الحصاد (20-30 إطار).',
  'طقس': 'تجنب فتح الخلايا أثناء الأمطار أو الحرارة الشديدة. الطقس المثالي للتفقد: بين 15-30 درجة مئوية، بدون رياح قوية.',
  'فاروا': 'الطفيلي الأخطر على النحل. علاج: Apivar (شريط)، Bayvarol (شريط)، أو علاج حراري. عالج في الخريف بعد الحصاد.',
  'نوزيما': 'عدوى فطرية تصيب الأمعاء. الأعراض: إسهال على أطر الخلايا. علاج: Fumagillin أو علاج طبيعي مع تحسين التهوية.',
  'تقسيم': 'التقسيم يُستخدم لمنع Swarm. انقل الشاهدات (يرقات عمرها 3 أيام) إلى صندوق جديد وأضف ملكة جديدة.',
  'دمج': 'الدمج يُستخدم لإعادة خلايا ضعيفة إلى خلايا قوية. ادمج خلايا بها ملكة قديمة مع خلايا بدون ملكة.',
  'شمع': 'الشمع الطبيعي يُستخدم في صناعة الشموع والمستحضرات. يُجمع من الأطر القديمة بعد حصاد العسل.',
  'بولين': 'كرتونة البولين تُستخدم كتغذية بروتينية في بداية الربيع لتحفيز التفريخ.',
  'ملكة': 'الملكة هي المسؤولة الوحيدة عن الإنجاب. تعيش 3-5 سنوات. يجب فحص وجود بضض ويرقات دورياً.',
  'علاج': 'تجنب استخدام المبيدات الكيميائية القوية. استخدم العلاجات العضوية آمنة أولاً. ارجع دائماً لنصائح النحال الخبير.',
};

function getAdvice(message: string): string {
  const lower = message.toLowerCase();
  for (const [keyword, advice] of Object.entries(ADVICE)) {
    if (lower.includes(keyword)) return advice;
  }
  return 'أنا مستشار النحل الذكي. اسألني عن: الأمراض، التغذية، الملكات، التفريخ، الحصاد، الطقس، فاروا، نوزيما، التقسيم، الدمج.';
}

router.post('/chat', (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    return ApiResponse.error(res, 'الرسالة مطلوبة', 400);
  }
  const response = getAdvice(message);
  ApiResponse.success(res, { response });
});

router.post('/analyze-inspection', (req: Request, res: Response) => {
  const { frames } = req.body;
  if (!frames || !Array.isArray(frames)) {
    return ApiResponse.error(res, 'الأطر مطلوبة', 400);
  }

  const issues: string[] = [];
  const recommendations: string[] = [];

  for (const frame of frames) {
    if ((frame.broodPercent || 0) < 20) {
      issues.push(`نسبة البيض منخفضة في الإطار ${frame.position}`);
      recommendations.push('تحقق من صحة الملكة');
    }
    if ((frame.honeyPercent || 0) < 10) {
      issues.push(`تخزين العسل غير كافٍ في الإطار ${frame.position}`);
      recommendations.push('أضف تغذية إضافية');
    }
    if ((frame.pollenPercent || 0) < 5 && (frame.broodPercent || 0) > 30) {
      issues.push(`قلة اللقاح مع وجود تفريخ في الإطار ${frame.position}`);
      recommendations.push('أضف كرتونة بولين');
    }
  }

  const analysis = issues.length === 0
    ? 'الخلايا تبدو بصحة جيدة. استمر في المراقبة الدورية.'
    : `المشاكل المكتشفة:\n${issues.map(i => '• ' + i).join('\n')}\n\nالتوصيات:\n${[...new Set(recommendations)].map(r => '• ' + r).join('\n')}`;

  ApiResponse.success(res, { analysis });
});

export default router;
