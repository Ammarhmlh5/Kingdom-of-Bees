import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import { add, getAll, put, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';
import { Crown, Plus, Calendar, ArrowRight, Check, X, Loader2 } from 'lucide-react';

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
const NEXT_STATUS: Record<string, string> = {
  pending: 'capped', capped: 'hatched', hatched: 'mated',
};
const NEXT_STATUS_LABELS: Record<string, string> = {
  pending: 'مغطاة', capped: 'فُرخت', hatched: 'تلقيحت',
};

const QUEEN_STATUS_OPTIONS = [
  { value: 'active', label: 'نشطة', color: 'bg-green-100 text-green-700' },
  { value: 'lost', label: 'ضائعة', color: 'bg-red-100 text-red-700' },
  { value: 'replaced', label: 'مستبدلة', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'unknown', label: 'غير معروفة', color: 'bg-gray-100 text-gray-700' },
];

interface QueenBatch {
  id: string | number;
  hiveId: string | number;
  type: string;
  status: string;
  startDate: string;
  cellsCount: number;
  notes?: string;
  queenStatus?: string;
  [key: string]: unknown;
}

export default function QueenPage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiaryId = (location.state as any)?.apiaryId;
  const isOnline = useOnlineStatus();
  const [batches, setBatches] = useState<QueenBatch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('grafting');
  const [cellsCount, setCellsCount] = useState('10');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [queenStatus, setQueenStatus] = useState<string>('unknown');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { loadBatches(); }, [hiveId]);

  const loadBatches = async () => {
    try {
    if (apiaryId) {
      try {
        const { data } = await apiClient.get(`/apiaries/${apiaryId}/queens`);
        const items = data?.data !== undefined ? data.data : data;
        const hiveBatches = (Array.isArray(items) ? items : []).filter((b: QueenBatch) => String(b.hiveId) === String(hiveId)).reverse();
        setBatches(hiveBatches);
        // Derive queen status from latest batch
        if (hiveBatches.length > 0) {
          const latest = hiveBatches[0];
          if (latest.queenStatus) setQueenStatus(String(latest.queenStatus));
          else if (latest.status === 'mated') setQueenStatus('active');
          else if (latest.status === 'failed') setQueenStatus('lost');
        }
      } catch {
        const all = await getAll<QueenBatch>('queen_batches');
        setBatches(all.filter(b => String(b.hiveId) === String(hiveId)).reverse());
      }
    } else {
      const all = await getAll<QueenBatch>('queen_batches');
      setBatches(all.filter(b => String(b.hiveId) === String(hiveId)).reverse());
    }
    } catch {
      // ignore
    } finally {
      setInitialLoading(false);
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

  const updateStatus = async (batch: QueenBatch, newStatus: string) => {
    const label = STATUS_LABELS[newStatus] || newStatus;
    if (isOnline && apiaryId) {
      try {
        await apiClient.put(`/apiaries/${apiaryId}/queens/${batch.id}`, { status: newStatus });
        toast.success(`تم التحديث إلى: ${label}`);
        loadBatches();
        return;
      } catch { /* fall through */ }
    }
    const updated = { ...batch, status: newStatus };
    await put('queen_batches', updated);
    await addToSyncQueue('queen_batches', 'update', { id: batch.id, status: newStatus });
    toast.success(`تم التحديث محلياً إلى: ${label}`);
    loadBatches();
  };

  const markFailed = async (batch: QueenBatch) => {
    await updateStatus(batch, 'failed');
  };

  const updateQueenStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      if (isOnline && apiaryId) {
        await apiClient.put(`/apiaries/${apiaryId}/hives/${hiveId}`, { queenStatus: newStatus });
      }
      setQueenStatus(newStatus);
      toast.success('تم تحديث حالة الملكة');
    } catch {
      toast.error('حدث خطأ أثناء التحديث');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const currentQueenStatus = QUEEN_STATUS_OPTIONS.find(s => s.value === queenStatus) || QUEEN_STATUS_OPTIONS[3];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="إدارة الملكات" />
      <div className="flex-1 px-4 py-4 space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">حالة الملكة الحالية</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${currentQueenStatus.color}`}>
              {currentQueenStatus.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUEEN_STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => updateQueenStatus(opt.value)}
                disabled={updatingStatus}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  queenStatus === opt.value
                    ? `${opt.color} border-current`
                    : 'bg-white border-bee-border text-bee-muted hover:bg-bee-border'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

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

        {initialLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-honey" size={32} />
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <Crown size={48} className="mx-auto mb-3 opacity-50" />
            <p>لا توجد دفعات مسجلة</p>
          </div>
        ) : batches.map((batch, i) => (
          <Card key={batch.id || i}>
            <div className="space-y-3">
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

              {batch.status !== 'failed' && batch.status !== 'mated' && (
                <div className="flex gap-2 pt-2 border-t border-bee-border">
                  {NEXT_STATUS[batch.status] && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(batch, NEXT_STATUS[batch.status])}
                      className="flex-1"
                    >
                      <ArrowRight size={14} />
                      {NEXT_STATUS_LABELS[batch.status]}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => markFailed(batch)}
                  >
                    فاشلة
                  </Button>
                </div>
              )}

              {batch.status === 'mated' && (
                <div className="pt-2 border-t border-bee-border flex items-center gap-1">
                  <Check size={14} className="text-green-600" />
                  <p className="text-xs text-green-600 font-medium">الدفعة مكتملة بنجاح</p>
                </div>
              )}

              {batch.status === 'failed' && (
                <div className="pt-2 border-t border-bee-border flex items-center gap-1">
                  <X size={14} className="text-red-600" />
                  <p className="text-xs text-red-600 font-medium">الدفعة فاشلة</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
