import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { ChevronDown, ChevronUp, Wrench, Scissors, Pill, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: { name: string; desc: string; tip?: string }[];
}

const sections: ToolSection[] = [
  {
    id: 'essential',
    title: 'المعدات الأساسية',
    icon: <Wrench size={20} className="text-blue-500" />,
    items: [
      { name: 'صندوق لانجستروث', desc: 'الصندوق الأكثر شيوعاً عالمياً. يحتوي على 10 أطر علوية و 10 سفلية. سهل الصيانة والحصاد.', tip: 'اختر خشباً معالجاً بالدهان الأبيض لمنع الحرارة' },
      { name: 'غاز الدخان', desc: 'أداة أساسية لتهدئة النحل قبل فتح الصندوق. يُولّد دخاناً كثيفاً يُخفي فرمونات الإنذار.', tip: 'استخدم قشور التفاح أو القطن المبلل' },
      { name: 'فرشاة النحل', desc: 'لإزالة النحل من الأطر برفق أثناء الفحص أو الحصاد. فرشاة ناعمة ذات أطراف مطوية.', tip: 'لا تستخدم فرشاة قاسية قد تُصيب النحل' },
      { name: 'نظارة وقفازات', desc: 'حماية شخصية أساسية. النظارة تحمي الوجه، والقفازات تحمل الأيدي مع الحفاظ على الحساسية.', tip: 'قفازات القماش أخف من المطاط' },
      { name: 'مكشطة النحل', desc: 'أداة متعددة الاستخدام: فتح غطاء العسل، رفع الأطر، وإزالة البروبوليس. لا غنى عنها.', tip: 'اختر مكشطة من الستانلس ستيل المتين' },
    ],
  },
  {
    id: 'harvest',
    title: 'معدات الحصاد',
    icon: <Scissors size={20} className="text-honey" />,
    items: [
      { name: 'جيّاز العسل', desc: 'أداة لإزالة غطاء الشمع من الأطر قبل العصر. يدوي أو كهربائي. ضروري لحصاد العسل.', tip: 'اليدوي مناسب للبداية، الكهربائي للإنتاج الكبير' },
      { name: 'مصفاة العسل', desc: 'تصفية العسل من الشوائب والشمع بعد العصر. مصفاة سلكية أو مصفاة بالطرد المركزي.', tip: 'ابدأ بمصفاة سلكية بسيطة' },
      { name: 'أوعية التخزين', desc: 'حاويات بلاستيكية أو زجاجية محكمة الإغلاق. تُخزّن في مكان بارد وجاف بعيداً عن الشمس المباشرة.', tip: 'تجنب الأواني المعدنية التي قد تتفاعل مع العسل' },
      { name: 'حقيبة النحال', desc: 'حقيبة مخصصة لحمل الأدوات أثناء التفقد. تحتوي جيوباً متعددة لأدوات صغيرة.', tip: 'اختر حقيبة مقاومة للماء' },
    ],
  },
  {
    id: 'feeding',
    title: 'التغذية والعلاج',
    icon: <Pill size={20} className="text-green-500" />,
    items: [
      { name: 'محلول السكر', desc: 'سكر أبيض + ماء. 1:1 للربيع (تحفيز التفريخ)، 2:1 للخريف (تخزين الشتاء).', tip: 'استخدم سكراً نقياً بدون إضافات' },
      { name: 'الفوندانت', desc: 'بديل ممتاز للشراب في الطقس البارد. عجينة سكر كثيفة توضع فوق الإطار.', tip: 'مثالي للتغذية الطارئة في الشتاء' },
      { name: 'كرتونة البولين', desc: 'تغذية بروتينية في بداية الربيع لتحفيز التفريخ. متوفرة جاهزة أو بالصنع المنزلي.', tip: 'أضفها في فبراير-مارس قبل بدء التفريخ' },
      { name: 'شريط فاروا (Apivar)', desc: 'علاج كيميائي لطفيلي فاروا. يُوضع بين الإطارين لمدة 6-8 أسابيع.', tip: 'عالج في الخريف بعد الحصاد مباشرة' },
    ],
  },
  {
    id: 'tips',
    title: 'نصائح الشراء',
    icon: <ShoppingBag size={20} className="text-purple-500" />,
    items: [
      { name: 'ابدأ بسيطاً', desc: 'لا تحتج معدات كثيرة للبداية. صندوق + غاز دخان + فرشاة + نظارة كافية للسنة الأولى.', tip: 'الخبرة أهم من المعدات' },
      { name: 'جودة الخشب', desc: 'اختر صناديق من خشب السرو أو الصنوبر المعالج. تجنب الخشب غير المعالج الذي يتلف بسرعة.', tip: 'الدهان الأبيض يمنع امتصاص الحرارة' },
      { name: 'مقارنة الأسعار', desc: 'قارن بين الموردين المحليين والمتاجر الإلكترونية. بعض الموردين يقدمون عروض للمبتدئين.', tip: 'مجموعات النحالين غالباً توفر خصومات على الكميات' },
      { name: 'اشترِ تدريجياً', desc: 'لا تشتري كل شيء دفعة واحدة. ابدأ بالأساسيات وأضف المعدات حسب الحاجة مع تقدم الخبرة.', tip: 'النحل يحتاج أولاً خلية جيدة ومملكة سليمة' },
    ],
  },
];

export default function ShopPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="أدوات النحال" subtitle="دليل شامل لمعدات النحل" />

      <div className="flex-1 px-4 py-4 space-y-3">
        <Card className="bg-honey/5 border-honey/20">
          <p className="text-sm text-bee-text">
            دليل شامل لأدوات النحل الأساسية والمتقدمة. اختر القسم لعرض التفاصيل والنصائح.
          </p>
        </Card>

        {sections.map(section => (
          <Card key={section.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
              className="w-full flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <span className="font-bold text-sm text-right">{section.title}</span>
                <span className="text-xs text-bee-muted bg-bee-border px-2 py-0.5 rounded-full">
                  {section.items.length}
                </span>
              </div>
              {expandedId === section.id ? (
                <ChevronUp size={18} className="text-bee-muted" />
              ) : (
                <ChevronDown size={18} className="text-bee-muted" />
              )}
            </button>

            <div className={cn(
              'overflow-hidden transition-all duration-300',
              expandedId === section.id ? 'max-h-[800px] opacity-100 mt-3' : 'max-h-0 opacity-0'
            )}>
              <div className="space-y-3 border-t border-bee-border pt-3">
                {section.items.map((item, i) => (
                  <div key={i} className="bg-bee-bg rounded-lg p-3">
                    <h4 className="font-bold text-sm text-bee-text mb-1">{item.name}</h4>
                    <p className="text-xs text-bee-muted leading-relaxed">{item.desc}</p>
                    {item.tip && (
                      <p className="text-xs text-honey mt-2 flex items-start gap-1">
                        <span className="flex-shrink-0">💡</span>
                        <span>{item.tip}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
