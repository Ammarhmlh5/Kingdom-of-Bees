import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { getAll } from '@/lib/db';
import type { Hive } from '@/types';

export default function HiveListPage() {
  const { id: apiaryId } = useParams();
  const navigate = useNavigate();
  const [hives, setHives] = useState<Hive[]>([]);
  const [apiaryName, setApiaryName] = useState('');

  useEffect(() => {
    loadHives();
  }, [apiaryId]);

  const loadHives = async () => {
    const allHives = await getAll<Hive>('hives');
    const filtered = allHives.filter(h => String(h.apiaryId) === String(apiaryId));
    setHives(filtered);

    const apiaries = await getAll<any>('apiaries');
    const apiary = apiaries.find(a => String(a.id) === String(apiaryId));
    setApiaryName(apiary?.name || '');
  };

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    weak: 'bg-yellow-100 text-yellow-700',
    dead: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={apiaryName || 'الخلايا'} subtitle={`${hives.length} خلية`} />

      <div className="flex-1 px-4 py-4">
        {hives.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <p className="text-lg mb-2">لا توجد خلايا</p>
            <p className="text-sm">أضف خلية للبدء</p>
          </div>
        ) : (
          hives.map(hive => (
            <Card key={hive.id} className="mb-3" onClick={() => navigate(`/hive/${hive.id}`)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{hive.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[hive.status] || 'bg-gray-100'}`}>
                      {hive.status === 'active' ? 'نشط' : hive.status === 'weak' ? 'ضعيف' : hive.status === 'dead' ? 'متوفى' : 'غير نشط'}
                    </span>
                    {hive.queenYear && (
                      <span className="text-xs text-bee-muted">ملكة {hive.queenYear}</span>
                    )}
                  </div>
                </div>
                <ArrowRight size={20} className="text-bee-muted" />
              </div>
            </Card>
          ))
        )}
      </div>

      <button
        onClick={() => navigate(`/apiary/${apiaryId}/hives/add`)}
        className="fixed bottom-24 left-4 w-14 h-14 bg-honey text-white rounded-full shadow-lg flex items-center justify-center hover:bg-honey-dark active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
