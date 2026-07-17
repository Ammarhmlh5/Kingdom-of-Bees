import { useState } from 'react';
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
import { Trash2 } from 'lucide-react';

interface FrameInput {
  position: number;
  type: string;
  broodPercent: number;
  honeyPercent: number;
  pollenPercent: number;
}

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
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const addFrame = () => {
    setFrames([...frames, {
      position: frames.length + 1,
      type: 'brood',
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const inspectionData = {
        hiveId,
        date: new Date().toISOString(),
        temperament,
        queenSeen,
        eggsSeen,
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

  const temperamentLabel: Record<string, string> = {
    calm: 'هادئ', gentle: 'لطيف', aggressive: 'عدواني', nervous: 'عصبي',
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

          {aiAnalysis !== null && (
            <Card className="bg-blue-50 border-blue-200">
              <h4 className="font-bold text-sm text-blue-800 mb-2">🤖 تحليل الذكاء الاصطناعي</h4>
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
      <Header title="فحص الخلية" />

      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-bee-text block mb-1.5">مزاج النحل</label>
            <select
              value={temperament}
              onChange={(e) => setTemperament(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-bee-border bg-white text-sm"
            >
              {Object.entries(temperamentLabel).map(([value, label]) => (
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

        <div className="flex items-center justify-between">
          <h3 className="font-bold">الأطر ({frames.length})</h3>
          <Button variant="ghost" size="sm" onClick={addFrame}>+ إطار</Button>
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
            <div className="text-sm font-medium text-bee-muted mb-2">الإطار {frame.position}</div>
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
