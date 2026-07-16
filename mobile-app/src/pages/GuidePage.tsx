import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Topic {
  id: string;
  title: string;
  icon: string;
  content: string[];
}

const topics: Topic[] = [
  {
    id: 'basics',
    title: 'أساسيات تربية النحل',
    icon: '🐝',
    content: [
      'يتكون سرب النحل من ملكة واحدة، مئات الذكور (الدrones)، وآلاف الإناث (العاملات).',
      'الملكة هي المسؤولة الوحيدة عن الإنجاب، وتعيش 3-5 سنوات.',
      'العاملات تتغير وظائفها مع عمرها: تنظيف → تغذية اليرقات → بناء الخلايا → حراسة → جمع الرحيق.',
      'النحل العامل يعيش 6-8 أسابيع في الصيف و 4-6 أشهر في الشتاء.',
    ],
  },
  {
    id: 'seasons',
    title: 'العمل الموسمي',
    icon: '📅',
    content: [
      'الشتاء: لا تفتح الخلايا، تأكد من التخزين الكافٍ، حماية من البرد والرطوبة.',
      'الربيع: فتحة التهوية، فحص الملكة، تقسيم الأسر، إضافة أطر.',
      'الصيف: جمع العسل، علاج الأمراض، مراقبة التخزين.',
      'الخريف: حصاد العسل، تغذية إضافية، علاج فاروا، تجهيز للشتاء.',
    ],
  },
  {
    id: 'diseases',
    title: 'الأمراض والطفائل',
    icon: '🔬',
    content: [
      'فاروا (Varroa destructor): الطفيلي الأخطر. علاج: Apivar, Bayvarol, أو علاج حراري.',
      'Nosema: عدوى فطرية تصيب الأمعاء. علاج: Fumagillin أو علاج طبيعي.',
      'السل الأمريكي (AFB): بكتيريا خطيرة تتطلب حرق الخلايا المصابة.',
      'السل الرمادي: فطر يحول اليرقات. علاج: تحسين التهوية.',
      'حشرة شمع العسل: تصيب الخلايا الضعيفة. علاج: تجميد الإطارات.',
    ],
  },
  {
    id: 'queen',
    title: 'إدارة الملكات',
    icon: '👑',
    content: [
      'الفحص الدوري: تأكد من وجود بضة ويرقات في الخلايا.',
      'تبديل الملكة كل 2-3 سنوات لضمان الإنتاجية.',
      'طرق التفريخ: نقل الشاهدات، التقسيم، خلايا الملكة الجاهزة.',
      'ملك الطوارئ: عندما تفقد الملكة فجأة، يبني النحل خلايا ملكة من يرقات عمرها 3 أيام.',
    ],
  },
  {
    id: 'harvest',
    title: 'حصاد العسل',
    icon: '🍯',
    content: [
      'احصد عندما تكون الأطر مغطاة بطبقة شمع بنسبة 80% أو أكثر.',
      'تأكد من أن هناك تخزين كافٍ للنحل قبل الحصاد (20-30 إطار).',
      'استخدم غاز الدخان لتهدئة النحل قبل الفتح.',
      'فرغ الأطر باستخدامжиّاز العسل، ثم خزّن في مكان بارد وجاف.',
    ],
  },
  {
    id: 'nutrition',
    title: 'تغذية النحل',
    icon: '🌸',
    content: [
      'شراب سكر 1:1 (سكر:ماء): يحفز التفريخ في الربيع.',
      'شراب سكر 2:1: يُخزّن قبل الشتاء لضمان التخزين الكافٍ.',
      'الفوندانت: بديل ممتاز للشراب في الطقس البارد.',
      'كرتونة البولين: تغذية بروتينية في بداية الربيع.',
      'السكر الجاف: طريقة بسيطة لتغذية الطوارئ في الشتاء.',
    ],
  },
  {
    id: 'equipment',
    title: 'المعدات الأساسية',
    icon: '🔧',
    content: [
      'صندوق لانجستروث: الأكثر شيوعاً، يحتوي على 10 أطر علوية و 10 سفلية.',
      '鸲ّة النحل: لتفريق النحل وجمع العسل.',
      'غاز الدخان: لتهدئة النحل قبل الفتح.',
      'فرشاة النحل: لإزالة النحل من الأطر.',
      'نظارة وقفازات: حماية شخصية أساسية.',
      'جيّاز العسل: لفراغ الأطر من العسل.',
    ],
  },
];

export default function GuidePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="دليل النحال" />

      <div className="flex-1 px-4 py-4 space-y-3">
        <div className="text-center py-4">
          <BookOpen size={40} className="mx-auto text-honey mb-2" />
          <p className="text-sm text-bee-muted">دليل شامل لتربية النحل وإدارة المنحل</p>
        </div>

        {topics.map(topic => (
          <Card key={topic.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === topic.id ? null : topic.id)}
              className="w-full flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{topic.icon}</span>
                <span className="font-bold text-sm text-right">{topic.title}</span>
              </div>
              {expandedId === topic.id ? (
                <ChevronUp size={18} className="text-bee-muted" />
              ) : (
                <ChevronDown size={18} className="text-bee-muted" />
              )}
            </button>

            <div className={cn(
              'overflow-hidden transition-all duration-300',
              expandedId === topic.id ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
            )}>
              <ul className="space-y-2 border-t border-bee-border pt-3">
                {topic.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-bee-text">
                    <span className="text-honey mt-1 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
