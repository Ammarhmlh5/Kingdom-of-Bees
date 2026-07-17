import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { beeCounter } from '@/lib/services/bee-counter.service';
import { toast } from 'sonner';
import { Camera, Upload, Loader2, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import type { BeeCountResult } from '@/lib/services/bee-counter.service';

export default function BeeCounterPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<BeeCountResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const reset = () => {
    setResult(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="عد النحل" subtitle="باستخدام الذكاء الاصطناعي" />

      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setMode('online')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === 'online' ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'}`}>
            <Wifi size={16} /> عبر الإنترنت
          </button>
          <button onClick={() => setMode('offline')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === 'offline' ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'}`}>
            <WifiOff size={16} /> أوفلاين
          </button>
        </div>

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
              <img src={imagePreview} alt=" bee" className="w-full h-48 object-cover" />
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
              <Button fullWidth disabled={!result} onClick={() => toast.success('تم حفظ النتائج')}>
                حفظ النتائج
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
