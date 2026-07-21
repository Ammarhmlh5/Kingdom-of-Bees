import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { Merge, AlertTriangle, X, Loader2 } from 'lucide-react';
import type { Hive } from '@/types';

export default function MergePage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [resolvedApiaryId, setResolvedApiaryId] = useState<string | null>((location.state as any)?.apiaryId || null);
  const [candidates, setCandidates] = useState<Hive[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetName, setTargetName] = useState('');

  useEffect(() => {
    loadCandidates();
  }, [hiveId]);

  const loadCandidates = async () => {
    setLoading(true);
    let apiaryId = resolvedApiaryId;

    if (!apiaryId) {
      try {
        const { getById } = await import('@/lib/db');
        const hive = await getById<any>('hives', hiveId!);
        if (hive?.apiaryId) {
          apiaryId = String(hive.apiaryId);
          setResolvedApiaryId(apiaryId);
        }
      } catch { /* ignore */ }
    }

    if (apiaryId) {
      try {
        const { data } = await apiClient.get(`/apiaries/${apiaryId}/hives/merge-candidates`);
        const list = data?.data !== undefined ? data.data : data;
        setCandidates((Array.isArray(list) ? list : []).filter((h: any) => String(h.id) !== String(hiveId)));
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }

    try {
      const { getAll } = await import('@/lib/db');
      const all = await getAll<Hive>('hives');
      const source = all.find(h => String(h.id) === String(hiveId));
      if (source) {
        setCandidates(all.filter(h => String(h.apiaryId) === String(source.apiaryId) && String(h.id) !== String(hiveId)));
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleMergeClick = () => {
    if (!selectedTarget) {
      toast.error('يرجى اختيار الخلية المستهدفة');
      return;
    }
    const target = candidates.find(h => String(h.id) === selectedTarget);
    if (target) {
      setTargetName(target.name);
      setShowConfirm(true);
    }
  };

  const handleMerge = async () => {
    setShowConfirm(false);
    setMerging(true);
    try {
      if (resolvedApiaryId) {
        await apiClient.post(`/apiaries/${resolvedApiaryId}/hives/${hiveId}/merge`, { targetId: selectedTarget });
      } else {
        const { getById, remove, put } = await import('@/lib/db');
        const source = await getById<any>('hives', hiveId!);
        const target = await getById<any>('hives', selectedTarget!);
        if (source && target) {
          await put('hives', { ...target, framesCount: (target.framesCount || 10) + (source.framesCount || 10) });
          await remove('hives', hiveId!);
        }
      }
      toast.success('تم دمج الخلية بنجاح');
      navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء الدمج');
    } finally {
      setMerging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="دمج خلايا" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-honey" size={32} />
        </div>
      </div>
    );
  }

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
                الدمج سيحذف الخلية المصدر وتنقل أطرها إلى الخلية المستهدفة. تأكد من اختيار الخلية الصحيحة.
              </p>
            </div>
          </div>
        </Card>

        <h3 className="font-bold text-sm">اختر الخلية المستهدفة:</h3>

        {candidates.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <Merge size={48} className="mx-auto mb-3 opacity-50" />
            <p>لا توجد خلايا أخرى للدمج</p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map(hive => (
              <Card
                key={hive.id}
                onClick={() => setSelectedTarget(String(hive.id))}
                className={selectedTarget === String(hive.id) ? 'border-honey ring-2 ring-honey/20' : ''}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{hive.name}</h4>
                    <p className="text-xs text-bee-muted">{hive.framesCount || 10} إطار · {hive.type}</p>
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
          <Button fullWidth onClick={handleMergeClick} disabled={!selectedTarget || merging}>
            {merging ? 'جاري الدمج...' : (
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
