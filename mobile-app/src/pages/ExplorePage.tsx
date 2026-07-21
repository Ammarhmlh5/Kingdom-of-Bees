import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Sprout, MessageCircle, Cloud, BookOpen, Lightbulb } from 'lucide-react';
import { getSeasonalAdvice } from '@/lib/logic/advisor';

const months = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const seasonalTips: Record<number, { title: string; tips: string[] }> = {
  1: { title: 'يناير — الراحة الشتوية', tips: ['لا تفتح الخلايا إلا عند الضرورة', 'تأكد من التخزين الكافٍ', 'راجع معداتك للربيع'] },
  2: { title: 'فبراير — الاستعداد', tips: ['ابدأ بالتغذية التحفيزية', 'اكمل علاج فاروا', 'جهز أطر التفريخ الجديدة'] },
  3: { title: 'مارس — بداية الموسم', tips: ['ابدأ الفحص الدوري', 'أضف أطر علوية عند الحاجة', 'راقب بداية التفريخ'] },
  4: { title: 'أبريل — موسم النمو', tips: ['تابع النمو بانتظام', 'أضف عسلات عند الحاجة', 'راقب علامات التطريد'] },
  5: { title: 'مايو — ذروة الموسم', tips: ['راقب التطريد باستمرار', 'أضف عسلات للإنتاج', 'تابع ملكات جديدة'] },
  6: { title: 'يونيو — الحصاد', tips: ['ابدأ حصاد العسل', 'تأكد من نضج العسل', 'اترك تخزيناً كافياً'] },
  7: { title: 'يوليو — الحصاد المستمر', tips: ['استمر في الحصاد', 'تابع التغذية الصيفية', 'راقب حرارة الخلايا'] },
  8: { title: 'أغسطس — ما بعد الحصاد', tips: ['اكمل حصاد العسل', 'جهز الخلايا للشتاء', 'ابدأ بعلاج فاروا الخريف'] },
  9: { title: 'سبتمبر — التحضير للشتاء', tips: ['قلل عدد الأطر', 'تأكد من التخزين الكافٍ', 'اكمل علاج فاروا'] },
  10: { title: 'أكتوبر — الإغلاق', tips: ['اغلق الخلايا للشتاء', 'أضف الفوندانت', 'تأكد من العوازل'] },
  11: { title: 'نوفمبر — الراحة', tips: ['لا تفتح الخلايا', 'تابع التخزين', 'راجع نتائج الموسم'] },
  12: { title: 'ديسمبر — نهاية السنة', tips: ['خطط للموسم القادم', 'راجع معداتك', 'تعلم من تجارب هذا الموسم'] },
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth() + 1;
  const monthTips = seasonalTips[currentMonth];

  const features = [
    { icon: Sprout, label: 'الأزهار والنباتات', desc: 'تقويم إزهار النباتات', path: '/flora', color: 'text-green-500' },
    { icon: MessageCircle, label: 'المستشار الذكي', desc: 'اسأل خبير النحل AI', path: '/advisor', color: 'text-blue-500' },
    { icon: Cloud, label: 'حالة الطقس', desc: 'تنبؤات الطقس للمنحل', path: '/weather', color: 'text-cyan-500' },
    { icon: BookOpen, label: 'دليل النحال', desc: 'مقالات ونصائح', path: '/guide', color: 'text-purple-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="استكشف" subtitle={months[currentMonth - 1]} />

      <div className="flex-1 px-4 py-4 space-y-4">
        {monthTips && (
          <Card className="bg-honey/5 border-honey/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-honey" />
              <h3 className="font-bold text-sm text-honey">{monthTips.title}</h3>
            </div>
            <div className="space-y-1">
              {monthTips.tips.map((tip, i) => (
                <p key={i} className="text-xs text-bee-text">• {tip}</p>
              ))}
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {features.map(({ icon: Icon, label, desc, path, color }) => (
            <Card key={path} onClick={() => navigate(path)}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{label}</h3>
                  <p className="text-xs text-bee-muted">{desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
