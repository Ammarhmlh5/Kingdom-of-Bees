import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import { put, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';

const FRAME_TYPES: Record<string, string> = {
  brood: 'إطار تفريخ', honey: 'إطار عسل', foundation: 'إطار أساس',
  empty: 'فارغ', pollen: 'إطار بولين', drone: 'إطار ذكور',
};

interface Frame {
  position: number;
  type: string;
  broodPercent: number;
  honeyPercent: number;
  pollenPercent: number;
}

export default function FramesPage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiaryId = (location.state as any)?.apiaryId;
  const isOnline = useOnlineStatus();
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => { loadHive(); }, [hiveId]);

  const loadHive = async () => {
    try {
    const { getById } = await import('@/lib/db');
    const defaultFrames = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        position: i + 1, type: 'foundation', broodPercent: 0, honeyPercent: 0, pollenPercent: 0,
      }));

    if (apiaryId) {
      try {
        const { data } = await apiClient.get(`/apiaries/${apiaryId}/hives/${hiveId}`);
        const hive = data?.data !== undefined ? data.data : data;
        if (hive.frames && Array.isArray(hive.frames) && hive.frames.length > 0) {
          setFrames(hive.frames);
        } else {
          setFrames(defaultFrames(hive.framesCount || 10));
        }
        return;
      } catch { /* fall through */ }
    }

    const h = await getById<Record<string, unknown>>('hives', hiveId!);
    if (h) {
      if (h.frames && Array.isArray(h.frames) && (h.frames as unknown[]).length > 0) {
        setFrames(h.frames as unknown as Frame[]);
      } else {
        setFrames(defaultFrames((h.framesCount as number) || 10));
      }
    }
    } catch {
      // ignore
    } finally {
      setInitialLoading(false);
    }
  };

  const addFrame = () => setFrames([...frames, { position: frames.length + 1, type: 'foundation', broodPercent: 0, honeyPercent: 0, pollenPercent: 0 }]);
  const removeFrame = (index: number) => { if (frames.length <= 1) return; setFrames(frames.filter((_, i) => i !== index).map((f, i) => ({ ...f, position: i + 1 }))); };
  const updateFrame = (index: number, field: keyof Frame, value: string | number) => { const u = [...frames]; u[index] = { ...u[index], [field]: value }; setFrames(u); };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isOnline && apiaryId) {
        try {
          await apiClient.put(`/apiaries/${apiaryId}/hives/${hiveId}/frames`, { frames });
          toast.success('تم حفظ الأطر بنجاح'); navigate(-1); return;
        } catch { /* fall through */ }
      }
      const { getById } = await import('@/lib/db');
      const h = await getById<Record<string, unknown>>('hives', hiveId!);
      if (h) await put('hives', { ...h, framesCount: frames.length });
      await addToSyncQueue('hives', 'update', { framesCount: frames.length, frames });
      toast.success('تم الحفظ محلياً'); navigate(-1);
    } catch { toast.error('حدث خطأ'); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="إدارة الأطر" subtitle={`${frames.length} إطار`} />
      <div className="flex-1 px-4 py-4 space-y-4">
        {initialLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-honey" size={32} />
          </div>
        ) : <>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">أطر الخلية</h3>
          <Button variant="ghost" size="sm" onClick={addFrame}><Plus size={14} /> إطار</Button>
        </div>

        <div className="space-y-2">
          {frames.map((frame, index) => (
            <Card key={index} className="relative">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-1 text-bee-muted pt-1">
                  <GripVertical size={14} />
                  <span className="text-xs font-bold w-6 text-center">{frame.position}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <select value={frame.type} onChange={(e) => updateFrame(index, 'type', e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-bee-border text-xs bg-white">
                    {Object.entries(FRAME_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>

                  <div className="h-2 rounded-full overflow-hidden bg-gray-100 flex">
                    {frame.broodPercent > 0 && <div className="bg-honey" style={{ width: `${frame.broodPercent}%` }} />}
                    {frame.honeyPercent > 0 && <div className="bg-amber-400" style={{ width: `${frame.honeyPercent}%` }} />}
                    {frame.pollenPercent > 0 && <div className="bg-green-400" style={{ width: `${frame.pollenPercent}%` }} />}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <label className="text-bee-muted">بيض {frame.broodPercent}%</label>
                      <input type="range" min="0" max="100" step="5" value={frame.broodPercent}
                        onChange={(e) => updateFrame(index, 'broodPercent', Number(e.target.value))} className="w-full accent-honey" />
                    </div>
                    <div>
                      <label className="text-bee-muted">عسل {frame.honeyPercent}%</label>
                      <input type="range" min="0" max="100" step="5" value={frame.honeyPercent}
                        onChange={(e) => updateFrame(index, 'honeyPercent', Number(e.target.value))} className="w-full accent-honey" />
                    </div>
                    <div>
                      <label className="text-bee-muted">لقاح {frame.pollenPercent}%</label>
                      <input type="range" min="0" max="100" step="5" value={frame.pollenPercent}
                        onChange={(e) => updateFrame(index, 'pollenPercent', Number(e.target.value))} className="w-full accent-honey" />
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFrame(index)} className="p-1 text-red-400 hover:text-danger"><Trash2 size={14} /></button>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 pt-4 pb-6">
          <Button variant="secondary" fullWidth onClick={() => navigate(-1)}>رجوع</Button>
          <Button fullWidth onClick={handleSave} disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
        </div>
        </>}
      </div>
    </div>
  );
}
