import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { beeCounter } from '@/lib/services/bee-counter.service';
import { add, addToSyncQueue, getAll } from '@/lib/db';
import { toast } from 'sonner';
import { Camera, Upload, Loader2, RotateCcw, History, Trash2 } from 'lucide-react';
import type { BeeCountResult } from '@/lib/services/bee-counter.service';
import type { BeeCount } from '@/types';

export default function BeeCounterPage() {
  const [result, setResult] = useState<BeeCountResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [history, setHistory] = useState<BeeCount[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
    const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
    if (!apiKey) setApiKeyMissing(true);
  }, []);

  const loadHistory = async () => {
    try {
      const records = await getAll<BeeCount>('bee_counts');
      setHistory(records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20));
    } catch {
      // ignore
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const base64 = (reader.result as string).split(',')[1];
      const countResult = await beeCounter.countBeesFromImage(base64);
      setResult(countResult);
      toast.success(`تم اكتشاف ${countResult.count} نحلة`);
    } catch (err: any) {
      toast.error(err.message || 'خطأ في العد');
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async () => {
    if (!result) return;
    try {
      const record: BeeCount = {
        count: result.count,
        confidence: result.confidence,
        timestamp: result.timestamp,
      };
      await add('bee_counts', record);
      await addToSyncQueue('bee_counts', 'create', record);
      toast.success('تم حفظ النتائج');
      loadHistory();
    } catch {
      toast.error('خطأ في الحفظ');
    }
  };

  const reset = () => {
    setResult(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="عد النحل" subtitle="باستخدام الذكاء الاصطناعي" />

      <div className="flex-1 px-4 py-4 space-y-4">
        {apiKeyMissing && (
          <Card className="bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-700">
              <strong>تنبيه:</strong> يجب إعداد مفتاح Roboflow API في ملف .env
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              أضف VITE_ROBOFLOW_API_KEY=your_key في ملف .env
            </p>
          </Card>
        )}

        {!imagePreview ? (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-bee-border rounded-2xl">
            <Camera size={48} className="text-honey mb-4" />
            <p className="text-sm text-bee-muted mb-4">اختر صورة لعد النحل</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              اختر صورة
            </Button>
          </div>
        ) : (
          <>
            <Card className="overflow-hidden p-0">
              <img src={imagePreview} alt="bee" className="w-full h-48 object-cover" />
            </Card>

            {loading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="animate-spin text-honey mb-3" size={32} />
                <p className="text-sm text-bee-muted">جاري تحليل الصورة...</p>
              </div>
            ) : result ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-honey">{result.count}</p>
                      <p className="text-xs text-bee-muted mt-1">عدد النحل</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-500">{(result.confidence * 100).toFixed(1)}%</p>
                      <p className="text-xs text-bee-muted mt-1">متوسط الثقة</p>
                    </div>
                  </Card>
                </div>

                {result.detections && result.detections.length > 0 && (
                  <Card>
                    <h4 className="font-bold text-sm mb-2">الاكتشافات ({result.detections.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {result.detections.slice(0, 10).map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-bee-muted">نحلة #{i + 1}</span>
                          <span className="font-medium">{(d.confidence * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="bg-green-50 border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>الوقت:</strong> {new Date(result.timestamp).toLocaleTimeString('ar-SA')}
                  </p>
                </Card>
              </>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" fullWidth onClick={reset}>
                <RotateCcw size={16} /> صورة جديدة
              </Button>
              <Button fullWidth disabled={!result} onClick={saveResult}>
                حفظ النتائج
              </Button>
            </div>
          </>
        )}

        <div className="pt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium text-bee-muted hover:text-bee-text transition-colors"
          >
            <History size={16} />
            سجل العد ({history.length})
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {history.length === 0 ? (
                <p className="text-xs text-bee-muted py-4 text-center">لا توجد سجلات سابقة</p>
              ) : (
                history.map((record, i) => (
                  <Card key={record.id || i}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-honey">{record.count} نحلة</p>
                        <p className="text-xs text-bee-muted">ثقة: {(record.confidence * 100).toFixed(1)}%</p>
                      </div>
                      <span className="text-xs text-bee-muted">
                        {new Date(record.timestamp).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronUp({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m18 15-6-6-6 6"/>
    </svg>
  );
}

function ChevronDown({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
