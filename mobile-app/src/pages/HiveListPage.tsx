import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import type { Hive } from '@/types';

export default function HiveListPage() {
  const { id: apiaryId } = useParams();
  const navigate = useNavigate();
  const [hives, setHives] = useState<Hive[]>([]);
  const [apiaryName, setApiaryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHives();
  }, [apiaryId]);

  const loadHives = async () => {
    setLoading(true);
    try {
      const [hivesRes, apiaryRes] = await Promise.all([
        apiClient.get(`/apiaries/${apiaryId}/hives`),
        apiClient.get(`/apiaries/${apiaryId}`),
      ]);
      setHives(hivesRes.data.data || hivesRes.data || []);
      setApiaryName(apiaryRes.data.name || '');
    } catch {
      try {
        const { getAll } = await import('@/lib/db');
        const allHives = await getAll<Hive>('hives');
        setHives(allHives.filter(h => String(h.apiaryId) === String(apiaryId)));
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    active: 'bg-green-100 text-green-700',
    WEAK: 'bg-yellow-100 text-yellow-700',
    weak: 'bg-yellow-100 text-yellow-700',
    DEAD: 'bg-red-100 text-red-700',
    dead: 'bg-red-100 text-red-700',
    INACTIVE: 'bg-gray-100 text-gray-600',
    inactive: 'bg-gray-100 text-gray-600',
  };

  const statusLabel: Record<string, string> = {
    ACTIVE: 'نشط', active: 'نشط',
    WEAK: 'ضعيف', weak: 'ضعيف',
    DEAD: 'متوفى', dead: 'متوفى',
    INACTIVE: 'غير نشط', inactive: 'غير نشط',
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="الخلايا" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-honey" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={apiaryName || 'الخلايا'} subtitle={`${hives.length} خلية`} />

      <div className="flex-1 px-4 py-4">
        {hives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-bee-muted">
            <div className="text-5xl mb-4">🐝</div>
            <p className="text-lg font-medium mb-2">لا توجد خلايا</p>
            <p className="text-sm mb-4">أضف خلية للبدء</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hives.map(hive => (
              <Card key={hive.id} onClick={() => navigate(`/hive/${hive.id}`, { state: { apiaryId } })}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-base">{hive.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[hive.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel[hive.status] || hive.status}
                      </span>
                      <span className="text-xs text-bee-muted">{hive.type}</span>
                      {hive.queenYear && (
                        <span className="text-xs text-bee-muted">ملكة {hive.queenYear}</span>
                      )}
                    </div>
                    {(hive as any)._count && (
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-bee-muted">
                        <span>فحص: {(hive as any)._count?.inspections || 0}</span>
                        <span>أطر: {hive.framesCount || 10}</span>
                      </div>
                    )}
                  </div>
                  <ArrowRight size={20} className="text-bee-muted flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
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
