import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import { add, getAll, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';
import { Crown, Plus, Calendar } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  grafting: 'نقل شاهدات', split: 'تقسيم سلسلة', queen_cell: 'خلية ملكة جاهزة', emergency: 'ملك طوارئ',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار', capped: 'مغطاة', hatched: 'فُرخت', mated: 'تلقيحت', failed: 'فاشلة',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', capped: 'bg-blue-100 text-blue-700',
  hatched: 'bg-green-100 text-green-700', mated: 'bg-purple-100 text-purple-700', failed: 'bg-red-100 text-red-700',
};

export default function QueenPage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiaryId = (location.state as any)?.apiaryId;
  const isOnline = useOnlineStatus();
  const [batches, setBatches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('grafting');
  const [cellsCount, setCellsCount] = useState('10');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBatches(); }, [hiveId]);

  const loadBatches = async () => {
    if (apiaryId) {
      try {
        const { data } = await apiClient.get(`/apiaries/${apiaryId}/queens`);
        const items = data.data || data || [];
        setBatches(items.filter((b: any) => String(b.hiveId) === String(hiveId)).reverse());
      } catch {
        const all = await getAll<any>('queen_batches');
        setBatches(all.filter(b => String(b.hiveId) === String(hiveId)).reverse());
      }
    } else {
      const all = await getAll<any>('queen_batches');
      setBatches(all.filter(b => String(b.hiveId) === String(hiveId)).reverse());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { type, status: 'pending', startDate: new Date().toISOString(), cellsCount: Number(cellsCount), notes: notes || undefined };
      if (isOnline && apiaryId) {
        try {
          await apiClient.post(`/apiaries/${apiaryId}/queens`, { ...data, hiveId });
          toast.success('تم إنشاء دفعة الملكات'); setShowForm(false); setCellsCount('10'); setNotes(''); loadBatches();
          return;
        } catch { /* fall through */ }
      }
      await add('queen_batches', { ...data, hiveId: Number(hiveId) });
      await addToSyncQueue('queen_batches', 'create', data);
      toast.success('تم الحفظ محلياً'); setShowForm(false); loadBatches();
    } catch { toast.error('حدث خطأ'); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="إدارة الملكات" />
      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base">دفعات التفريخ ({batches.length})</h2>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> {showForm ? 'إلغاء' : 'دفعة جديدة'}
          </Button>
        </div>

        {showForm && (
          <Card className="border-honey/30">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Select label="طريقة التفريخ" value={type} onChange={(e) => setType(e.target.value)}
                options={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
              <Input label="عدد الخلايا" type="number" value={cellsCount} onChange={(e) => setCellsCount(e.target.value)} />
              <Textarea label="ملاحظات" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button type="submit" fullWidth disabled={loading}>{loading ? 'جاري...' : 'إنشاء الدفعة'}</Button>
            </form>
          </Card>
        )}

        {batches.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <Crown size={48} className="mx-auto mb-3 opacity-50" />
            <p>لا توجد دفعات مسجلة</p>
          </div>
        ) : batches.map((batch: any, i: number) => (
          <Card key={batch.id || i}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Crown size={16} className="text-honey" />
                  <span className="font-bold text-sm">{TYPE_LABELS[batch.type] || batch.type}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[batch.status] || 'bg-gray-100'}`}>
                    {STATUS_LABELS[batch.status] || batch.status}
                  </span>
                  <span className="text-xs text-bee-muted">{batch.cellsCount} خلية</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-bee-muted">
                  <Calendar size={12} />
                  {new Date(batch.startDate).toLocaleDateString('ar-SA')}
                </div>
                {batch.notes && <p className="text-xs text-bee-muted mt-1">{batch.notes}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
