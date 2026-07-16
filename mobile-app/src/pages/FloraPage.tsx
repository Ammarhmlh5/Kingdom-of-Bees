import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { getSeasonalAdvice } from '@/lib/logic/advisor';

const months = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const flora = [
  { name: 'البرتقال', bloom: [2, 3, 4], color: 'bg-orange-100 text-orange-700' },
  { name: 'الليمون', bloom: [3, 4, 5], color: 'bg-yellow-100 text-yellow-700' },
  { name: 'السدر (النبق)', bloom: [4, 5, 6], color: 'bg-green-100 text-green-700' },
  { name: 'الكروم (العسلية)', bloom: [5, 6, 7], color: 'bg-purple-100 text-purple-700' },
  { name: 'الزيتون', bloom: [5, 6, 7], color: 'bg-gray-100 text-gray-700' },
  { name: 'الطلح (السمسم)', bloom: [7, 8, 9], color: 'bg-amber-100 text-amber-700' },
  { name: 'الحرمل', bloom: [9, 10, 11], color: 'bg-pink-100 text-pink-700' },
  { name: 'الحور', bloom: [3, 4, 5, 9, 10], color: 'bg-teal-100 text-teal-700' },
];

export default function FloraPage() {
  const currentMonth = new Date().getMonth() + 1;
  const advice = getSeasonalAdvice(currentMonth);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="الأزهار والنباتات" subtitle={months[currentMonth - 1]} />

      <div className="flex-1 px-4 py-4 space-y-4">
        <Card className="bg-honey/5 border-honey/20">
          <h3 className="font-bold text-sm mb-2">نصائح الشهر</h3>
          {advice.map((tip, i) => (
            <p key={i} className="text-sm text-bee-text">{tip}</p>
          ))}
        </Card>

        <h3 className="font-bold text-base">تقويم الإزهار</h3>
        <div className="space-y-2">
          {flora.map(plant => (
            <Card key={plant.name}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{plant.name}</span>
                <div className="flex gap-1">
                  {plant.bloom.map(m => (
                    <span
                      key={m}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        m === currentMonth ? 'bg-honey text-white font-bold' : plant.color
                      }`}
                    >
                      {months[m - 1].slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
