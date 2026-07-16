import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getAll, put, remove, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';
import { Merge, AlertTriangle, X } from 'lucide-react';
import type { Hive } from '@/types';

export default function MergePage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [hives, setHives] = useState<Hive[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetName, setTargetName] = useState('');

  useEffect(() => {
    loadHives();
  }, [hiveId]);

  const loadHives = async () => {
    const all = await getAll<Hive>('hives');
    const source = all.find(h => String(h.id) === String(hiveId));
    if (source) {
      setHives(all.filter(h => String(h.apiaryId) === String(source.apiaryId) && String(h.id) !== String(hiveId)));
    }
  };

  const handleMergeClick = () => {
    if (!selectedTarget) {
      toast.error('يرجى اختيار الخلية المستهدفة');
      return;
    }
    const target = hives.find(h => String(h.id) === selectedTarget);
    if (target) {
      setTargetName(target.name);
      setShowConfirm(true);
    }
  };

  const handleMerge = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const allHives = await getAll<Hive>('hives');
      const target = allHives.find(h => String(h.id) === selectedTarget);
      const source = allHives.find(h => String(h.id) === String(hiveId));

      if (source && target) {
        const newFrames = (target.framesCount || 10) + (source.framesCount || 10);
        await put('hives', { ...target, framesCount: newFrames });
        await remove('hives', Number(hiveId));

        if (isOnline) {
          try {
            const { apiClient } = await import('@/lib/apiClient');
            await apiClient.post('/api/hives/merge', {
              sourceId: Number(hiveId),
              targetId: Number(selectedTarget),
            });
          } catch {
            await addToSyncQueue('hives', 'update', { ...target, framesCount: newFrames });
            await addToSyncQueue('hives', 'delete', { id: Number(hiveId) });
          }
        } else {
          await addToSyncQueue('hives', 'update', { ...target, framesCount: newFrames });
          await addToSyncQueue('hives', 'delete', { id: Number(hiveId) });
        }
      }

      toast.success('تم دمج الخلية بنجاح');
      navigate(-1);
    } catch {
      toast.error('حدث خطأ أثناء الدمج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="دمج خلايا" />

      <div className="flex-1 px-4 py-4 space-y-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-yellow-800">تحذير</p>
              <p className="text-xs text-yellow-700 mt-1">
                الدمج سيحذف الخلية المصدر وتنقل أطرها إلى الخلية المستهدفة. تأكد من أن الملكة في الخلية المصدر ليست الأفضل.
              </p>
            </div>
          </div>
        </Card>

        <h3 className="font-bold text-sm">اختر الخلية المستهدفة:</h3>

        {hives.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <Merge size={48} className="mx-auto mb-3 opacity-50" />
            <p>لا توجد خلايا أخرى في نفس المنحل للدمج</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hives.map(hive => (
              <Card
                key={hive.id}
                onClick={() => setSelectedTarget(String(hive.id))}
                className={selectedTarget === String(hive.id) ? 'border-honey ring-2 ring-honey/20' : ''}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{hive.name}</h4>
                    <p className="text-xs text-bee-muted">{hive.framesCount || 10} إطار</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedTarget === String(hive.id) ? 'border-honey bg-honey' : 'border-gray-300'
                  }`}>
                    {selectedTarget === String(hive.id) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" fullWidth onClick={() => navigate(-1)}>
            إلغاء
          </Button>
          <Button fullWidth onClick={handleMergeClick} disabled={!selectedTarget || loading}>
            {loading ? 'جاري الدمج...' : (
              <>
                <Merge size={16} />
                دمج الآن
              </>
            )}
          </Button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">تأكيد الدمج</h3>
              <button onClick={() => setShowConfirm(false)} className="p-1 text-bee-muted hover:text-bee-text">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-bee-text mb-1">
              هل أنت متأكد من دمج هذه الخلية مع <strong>"{targetName}"</strong>؟
            </p>
            <p className="text-xs text-danger mb-6">
              سيتم حذف الخلية المصدر نهائياً.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowConfirm(false)}>
                إلغاء
              </Button>
              <Button variant="danger" fullWidth onClick={handleMerge}>
                نعم، دمج
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
