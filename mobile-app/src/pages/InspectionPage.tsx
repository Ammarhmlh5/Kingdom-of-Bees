import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AIService } from '@/lib/services/ai.service';
import { add, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
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
  const isOnline = useOnlineStatus();
  const [frames, setFrames] = useState<FrameInput[]>([
    { position: 1, type: 'brood', broodPercent: 0, honeyPercent: 0, pollenPercent: 0 },
  ]);
  const [temperament, setTemperament] = useState('calm');
  const [queenSeen, setQueenSeen] = useState(false);
  const [notes, setNotes] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const result = await AIService.analyzeInspection(frames);
      setAnalysis(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const inspectionData = {
        hiveId: Number(hiveId),
        date: new Date().toISOString(),
        temperament,
        queenSeen,
        notes,
        frames,
      };

      const id = await add('inspections', inspectionData);

      if (isOnline) {
        try {
          const { apiClient } = await import('@/lib/apiClient');
          await apiClient.post('/api/inspections', { ...inspectionData, id });
        } catch {
          await addToSyncQueue('inspections', 'create', { ...inspectionData, id });
        }
      } else {
        await addToSyncQueue('inspections', 'create', { ...inspectionData, id });
      }

      toast.success('تم حفظ الفحص بنجاح');
      navigate(-1);
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

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
              <option value="calm">هادئ</option>
              <option value="gentle">لطيف</option>
              <option value="aggressive">عدواني</option>
              <option value="nervous">عصبي</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-bee-text block mb-1.5">الملكة مرئية</label>
            <button
              onClick={() => setQueenSeen(!queenSeen)}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                queenSeen ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-bee-border text-bee-muted'
              }`}
            >
              {queenSeen ? 'نعم مرئية' : 'لم تُرَ'}
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
                <input
                  type="range" min="0" max="100"
                  value={frame.broodPercent}
                  onChange={(e) => updateFrame(index, 'broodPercent', Number(e.target.value))}
                  className="w-full accent-honey"
                />
              </div>
              <div>
                <label className="text-xs text-bee-muted">العسل: {frame.honeyPercent}%</label>
                <input
                  type="range" min="0" max="100"
                  value={frame.honeyPercent}
                  onChange={(e) => updateFrame(index, 'honeyPercent', Number(e.target.value))}
                  className="w-full accent-honey"
                />
              </div>
              <div>
                <label className="text-xs text-bee-muted">حبوب اللقاح: {frame.pollenPercent}%</label>
                <input
                  type="range" min="0" max="100"
                  value={frame.pollenPercent}
                  onChange={(e) => updateFrame(index, 'pollenPercent', Number(e.target.value))}
                  className="w-full accent-honey"
                />
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

        <Button variant="secondary" fullWidth onClick={analyze} disabled={analyzing}>
          {analyzing ? 'جاري التحليل...' : ' تحليل ذكي (AI)'}
        </Button>

        {analysis && (
          <Card className="bg-blue-50 border-blue-200">
            <h4 className="font-bold text-sm mb-2">تحليل AI:</h4>
            <p className="text-sm text-bee-text whitespace-pre-line">{analysis}</p>
          </Card>
        )}

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
