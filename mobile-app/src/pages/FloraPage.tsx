import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import { getSeasonalAdvice } from '@/lib/logic/advisor';
import { Loader2, Search, AlertTriangle } from 'lucide-react';

const months = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const defaultFlora = [
  { name: 'البرتقال', bloom: [2, 3, 4], color: 'bg-orange-100 text-orange-700' },
  { name: 'الليمون', bloom: [3, 4, 5], color: 'bg-yellow-100 text-yellow-700' },
  { name: 'السدر (النبق)', bloom: [4, 5, 6], color: 'bg-green-100 text-green-700' },
  { name: 'الكروم (العسلية)', bloom: [5, 6, 7], color: 'bg-purple-100 text-purple-700' },
  { name: 'الزيتون', bloom: [5, 6, 7], color: 'bg-gray-100 text-gray-700' },
  { name: 'الطلح (السمسم)', bloom: [7, 8, 9], color: 'bg-amber-100 text-amber-700' },
  { name: 'الحرمل', bloom: [9, 10, 11], color: 'bg-pink-100 text-pink-700' },
  { name: 'الحور', bloom: [3, 4, 5, 9, 10], color: 'bg-teal-100 text-teal-700' },
];

interface Plant {
  name: string;
  bloomMonths?: number[];
  bloom?: number[];
  color?: string;
  type?: string;
  nectarValue?: string;
  pollenValue?: string;
}

export default function FloraPage() {
  const currentMonth = new Date().getMonth() + 1;
  const advice = getSeasonalAdvice(currentMonth);
  const [plants, setPlants] = useState<Plant[]>(defaultFlora);
  const [loading, setLoading] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/plants/search', { params: { month: currentMonth } });
      const list = data?.data !== undefined ? data.data : data;
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((p: any) => ({
          name: p.commonName || p.name || p.nameAr,
          bloomMonths: p.bloomMonths || p.bloom_months || [],
          bloom: p.bloomMonths || p.bloom_months || [],
          color: 'bg-honey/10 text-honey',
          type: p.type,
          nectarValue: p.nectarValue,
          pollenValue: p.pollenValue,
        }));
        setPlants(mapped);
        setApiFailed(false);
      }
    } catch {
      setApiFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = plants.filter(p =>
    !search || p.name.includes(search) || p.type?.includes(search)
  );

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

        {apiFailed && (
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-yellow-600" />
              <p className="text-xs text-yellow-700">تعذّر الاتصال بالخادم — عرض بيانات افتراضية</p>
            </div>
          </Card>
        )}

        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-bee-muted" />
          <input type="text" placeholder="بحث عن نبات..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-bee-border text-sm bg-white" />
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">تقويم الإزهار</h3>
          {loading && <Loader2 className="animate-spin text-honey" size={16} />}
        </div>

        <div className="space-y-2">
          {filteredPlants.map(plant => {
            const bloomMonths = plant.bloom || plant.bloomMonths || [];
            return (
              <Card key={plant.name}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium text-sm">{plant.name}</span>
                    {plant.type && <span className="text-xs text-bee-muted mr-2">({plant.type})</span>}
                    <div className="flex items-center gap-2 mt-1">
                      {plant.nectarValue && (
                        <span className="text-[10px] text-honey">رحيق: {plant.nectarValue}</span>
                      )}
                      {plant.pollenValue && (
                        <span className="text-[10px] text-amber-600">لقاح: {plant.pollenValue}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {bloomMonths.map((m: number) => (
                      <span
                        key={m}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          m === currentMonth ? 'bg-honey text-white font-bold' : (plant.color || 'bg-gray-100 text-gray-700')
                        }`}
                      >
                        {months[m - 1]?.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
