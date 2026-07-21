import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import { add, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { AIService } from '@/lib/services/ai.service';
import { toast } from 'sonner';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';

interface FrameInput {
  position: number;
  type: string;
  broodPercent: number;
  honeyPercent: number;
  pollenPercent: number;
}

const FRAME_TYPES: Record<string, string> = {
  brood: 'تفريخ',
  honey: 'عسل',
  foundation: 'أساس',
  empty: 'فارغ',
  pollen: 'بولين',
  drone: 'ذكور',
};

const TEMPERAMENT_OPTIONS = [
  { value: 'calm', label: 'هادئ' },
  { value: 'gentle', label: 'لطيف' },
  { value: 'aggressive', label: 'عدواني' },
  { value: 'nervous', label: 'عصبي' },
];

export default function InspectionPage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiaryId = (location.state as any)?.apiaryId;
  const isOnline = useOnlineStatus();
  const [frames, setFrames] = useState<FrameInput[]>([
    { position: 1, type: 'brood', broodPercent: 0, honeyPercent: 0, pollenPercent: 0 },
  ]);
  const [temperament, setTemperament] = useState('calm');
  const [queenSeen, setQueenSeen] = useState(false);
  const [eggsSeen, setEggsSeen] = useState(false);
  const [storesAdequate, setStoresAdequate] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [hiveName, setHiveName] = useState('');

  useEffect(() => {
    if (hiveId && apiaryId) {
      apiClient.get(`/apiaries/${apiaryId}/hives/${hiveId}`)
        .then(({ data }) => {
          const h = data?.data !== undefined ? data.data : data;
          setHiveName(h.name || '');
          const count = h.framesCount || 10;
          setFrames(Array.from({ length: count }, (_, i) => ({
            position: i + 1, type: 'foundation', broodPercent: 0, honeyPercent: 0, pollenPercent: 0,
          })));
        })
        .catch(() => {});
    }
  }, [hiveId, apiaryId]);

  const addFrame = () => {
    setFrames([...frames, {
      position: frames.length + 1,
      type: 'foundation',
      broodPercent: 0,
      honeyPercent: 0,
      pollenPercent: 0,
    }]);
  };

  const removeFrame = (index: number) => {
    if (frames.length === 1) return;
    setFrames(frames.filter((_, i) => i !== index).map((f, i) => ({ ...f, position: i + 1 })));
  };

  const updateFrame = (index: number, field: keyof FrameInput, value: any) => {
    const updated = [...frames];
    updated[index] = { ...updated[index], [field]: value };
    setFrames(updated);
  };

  const calculateStrength = (): number => {
    if (frames.length === 0) return 0;
    const broodFrames = frames.filter(f => f.type === 'brood' || f.broodPercent > 0);
    const totalBrood = frames.reduce((sum, f) => sum + f.broodPercent, 0);
    const avgBrood = totalBrood / frames.length;
    const strength = Math.min(100, Math.round(
      (broodFrames.length / frames.length) * 40 +
      avgBrood * 0.3 +
      (queenSeen ? 15 : 0) +
      (eggsSeen ? 15 : 0)
    ));
    return strength;
  };

  const getStrengthLabel = (s: number) => {
    if (s >= 80) return { label: 'ممتازة', color: 'text-green-700 bg-green-100' };
    if (s >= 60) return { label: 'جيدة', color: 'text-blue-700 bg-blue-100' };
    if (s >= 40) return { label: 'متوسطة', color: 'text-yellow-700 bg-yellow-100' };
    if (s >= 20) return { label: 'ضعيفة', color: 'text-orange-700 bg-orange-100' };
    return { label: 'حرجة', color: 'text-red-700 bg-red-100' };
  };

  const strength = calculateStrength();
  const strengthInfo = getStrengthLabel(strength);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const inspectionData = {
        inspectionDate: new Date().toISOString(),
        hiveStrength: String(strength),
        temperament,
        queenSeen,
        eggsSeen,
        honeyStores: storesAdequate ? 'adequate' : 'low',
        notes,
        frames,
      };

      if (isOnline && apiaryId) {
        try {
          await apiClient.post(`/apiaries/${apiaryId}/hives/${hiveId}/inspect`, inspectionData);
          toast.success('تم حفظ الفحص بنجاح');
          setSaved(true);
          runAiAnalysis();
          return;
        } catch {
          // fall through to offline
        }
      }

      await add('inspections', inspectionData);
      await addToSyncQueue('inspections', 'create', inspectionData);
      toast.success('تم الحفظ محلياً وسيتم المزامنة لاحقاً');
      setSaved(true);
      runAiAnalysis();
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const runAiAnalysis = async () => {
    try {
      const analysis = await AIService.analyzeInspection(frames);
      setAiAnalysis(analysis);
    } catch {
      setAiAnalysis('تعذر تحليل البيانات');
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="فحص الخلية" />
        <div className="flex-1 px-4 py-4 space-y-4">
          <Card className="bg-green-50 border-green-200">
            <div className="text-center py-4">
              <p className="text-lg font-bold text-green-700">تم حفظ الفحص بنجاح</p>
              <p className="text-sm text-green-600 mt-1">التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">قوة الخلية</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${strengthInfo.color}`}>
                {strength}% — {strengthInfo.label}
              </span>
            </div>
          </Card>

          {aiAnalysis !== null && (
            <Card className="bg-blue-50 border-blue-200">
              <h4 className="font-bold text-sm text-blue-800 mb-2">تحليل الذكاء الاصطناعي</h4>
              <p className="text-sm text-blue-700 whitespace-pre-line">{aiAnalysis}</p>
            </Card>
          )}

          {aiAnalysis === null && (
            <Card className="bg-gray-50 border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-honey border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-bee-muted">جاري تحليل بيانات الفحص...</p>
              </div>
            </Card>
          )}

          <Button fullWidth onClick={() => navigate(-1)}>
            العودة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={`فحص: ${hiveName || 'الخلية'}`} subtitle={`${frames.length} إطار`} />

      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-bee-text block mb-1.5">مزاج النحل</label>
            <select
              value={temperament}
              onChange={(e) => setTemperament(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-bee-border bg-white text-sm"
            >
              {TEMPERAMENT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <button
              onClick={() => setQueenSeen(!queenSeen)}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                queenSeen ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-bee-border text-bee-muted'
              }`}
            >
              {queenSeen ? '✓ الملكة مرئية' : 'الملكة مرئية'}
            </button>
            <button
              onClick={() => setEggsSeen(!eggsSeen)}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                eggsSeen ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-bee-border text-bee-muted'
              }`}
            >
              {eggsSeen ? '✓ بيض مرئي' : 'بيض مرئي'}
            </button>
          </div>
        </div>

        <button
          onClick={() => setStoresAdequate(!storesAdequate)}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-right ${
            storesAdequate ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-bee-border text-bee-muted'
          }`}
        >
          {storesAdequate ? '✓ التخزين كافٍ' : 'التخزين غير كافٍ'}
        </button>

        <Card className="bg-honey/5 border-honey/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">قوة الخلية التقديرية</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${strengthInfo.color}`}>
              {strength}% — {strengthInfo.label}
            </span>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="font-bold">الأطر ({frames.length})</h3>
          <Button variant="ghost" size="sm" onClick={addFrame}><Plus size={14} /> إطار</Button>
        </div>

        {frames.map((frame, index) => (
          <Card key={index} className="relative">
            {frames.length > 1 && (
              <button
                onClick={() => removeFrame(index)}
                className="absolute top-2 left-2 p-1 text-red-400 hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            )}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-bee-muted w-6 text-center">{frame.position}</span>
              <select
                value={frame.type}
                onChange={(e) => updateFrame(index, 'type', e.target.value)}
                className="flex-1 px-2 py-1.5 rounded border border-bee-border text-xs bg-white"
              >
                {Object.entries(FRAME_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-bee-muted">البيض: {frame.broodPercent}%</label>
                <input type="range" min="0" max="100" value={frame.broodPercent}
                  onChange={(e) => updateFrame(index, 'broodPercent', Number(e.target.value))}
                  className="w-full accent-honey" />
              </div>
              <div>
                <label className="text-xs text-bee-muted">العسل: {frame.honeyPercent}%</label>
                <input type="range" min="0" max="100" value={frame.honeyPercent}
                  onChange={(e) => updateFrame(index, 'honeyPercent', Number(e.target.value))}
                  className="w-full accent-honey" />
              </div>
              <div>
                <label className="text-xs text-bee-muted">حبوب اللقاح: {frame.pollenPercent}%</label>
                <input type="range" min="0" max="100" value={frame.pollenPercent}
                  onChange={(e) => updateFrame(index, 'pollenPercent', Number(e.target.value))}
                  className="w-full accent-honey" />
              </div>
            </div>
          </Card>
        ))}

        <Textarea
          label="ملاحظات"
          placeholder="أي ملاحظات إضافية..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex gap-3 pt-2 pb-4">
          <Button variant="secondary" fullWidth onClick={() => navigate(-1)}>إلغاء</Button>
          <Button fullWidth onClick={handleSubmit} disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ الفحص'}
          </Button>
        </div>
      </div>
    </div>
  );
}
