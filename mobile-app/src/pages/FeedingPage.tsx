import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import { add, addToSyncQueue, getAll } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';
import { Droplets, History } from 'lucide-react';

const FEEDING_TYPES: Record<string, string> = {
  sugar_syrup_1_1: 'شراب سكر 1:1 (ربيع)',
  sugar_syrup_2_1: 'شراب سكر 2:1 (خريف)',
  fondant: 'فوندانت',
  pollen_patty: 'كرتونة بولين',
  dry_sugar: 'سكر جاف',
  protein_mix: 'خليط بروتين',
};

export default function FeedingPage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiaryId = (location.state as any)?.apiaryId;
  const isOnline = useOnlineStatus();
  const [type, setType] = useState('sugar_syrup_1_1');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => { loadHistory(); }, [hiveId]);

  const loadHistory = async () => {
    if (apiaryId) {
      try {
        const { data } = await apiClient.get(`/apiaries/${apiaryId}/feeding`);
        const feedingData = data?.data !== undefined ? data.data : data;
        const items = Array.isArray(feedingData) ? feedingData : [];
        setHistory(items.filter((r: any) => String(r.hiveId) === String(hiveId)).slice(0, 20));
      } catch {
        const records = await getAll<any>('feeding_records');
        setHistory(records.filter(r => String(r.hiveId) === String(hiveId)).reverse());
      }
    } else {
      const records = await getAll<any>('feeding_records');
      setHistory(records.filter(r => String(r.hiveId) === String(hiveId)).reverse());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      toast.error('يرجى إدخال الكمية');
      return;
    }

    setLoading(true);
    try {
      const data = { hiveId, type, amount, date: new Date().toISOString(), notes: notes || undefined, nextFeedingDate: nextDate || undefined };

      if (isOnline && apiaryId) {
        try {
          await apiClient.post(`/apiaries/${apiaryId}/feeding`, data);
          toast.success('تم تسجيل التغذية بنجاح');
          setAmount(''); setNotes(''); setNextDate(''); setShowForm(false); loadHistory();
          return;
        } catch {
          // fall through
        }
      }

      await add('feeding_records', data);
      await addToSyncQueue('feeding_records', 'create', data);
      toast.success('تم الحفظ محلياً');
      setAmount(''); setNotes(''); setShowForm(false); loadHistory();
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="تغذية الخلية" />

      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${showForm ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'}`}>
            <Droplets size={16} /> تغذية جديدة
          </button>
          <button onClick={() => setShowForm(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${!showForm ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'}`}>
            <History size={16} /> السجل ({history.length})
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select label="نوع التغذية" value={type} onChange={(e) => setType(e.target.value)}
              options={Object.entries(FEEDING_TYPES).map(([value, label]) => ({ value, label }))} />
            <Input label="الكمية" placeholder="مثال: 500 مل" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input label="التغذية التالية (اختياري)" type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
            <Textarea label="ملاحظات (اختياري)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

            <Card className="bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>نصيحة:</strong> {type.includes('1_1') ? 'شراب 1:1 يحفز التفريخ في الربيع' : type.includes('2_1') ? 'شراب 2:1 يُخزّن قبل الشتاء' : 'تأكد من أن التغذية مناسبة لحالة الخلية'}
              </p>
            </Card>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" fullWidth onClick={() => navigate(-1)}>رجوع</Button>
              <Button type="submit" fullWidth disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ'}</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 text-bee-muted">
                <Droplets size={48} className="mx-auto mb-3 opacity-50" />
                <p>لا توجد سجلات تغذية</p>
              </div>
            ) : history.map((record: any, i: number) => (
              <Card key={record.id || i}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-bold text-honey">{FEEDING_TYPES[record.type] || record.type}</span>
                    <p className="text-sm mt-1">الكمية: {record.amount}</p>
                    {record.notes && <p className="text-xs text-bee-muted mt-1">{record.notes}</p>}
                    {record.nextFeedingDate && (
                      <p className="text-xs text-honey mt-1">التغذية التالية: {new Date(record.nextFeedingDate).toLocaleDateString('ar-SA')}</p>
                    )}
                  </div>
                  <span className="text-xs text-bee-muted">{new Date(record.date).toLocaleDateString('ar-SA')}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
