import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar, Scale, FileText, Filter, X, Loader2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { getAll, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';

interface HarvestRecord {
  id: string;
  harvestDate: string;
  hiveId: string;
  hive?: { hiveNumber: string };
  totalQuantity: number;
  unit: string;
  harvestType: string;
  notes?: string;
}

export default function HarvestPage() {
  const isOnline = useOnlineStatus();
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    harvestType: 'عسل', harvestDate: new Date().toISOString().split('T')[0],
    totalQuantity: '', unit: 'كجم', hiveId: '', notes: '',
  });

  useEffect(() => { loadHarvests(); }, []);

  const loadHarvests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/harvest/my');
      setHarvests(response.data.data || []);
    } catch {
      const local = await getAll<HarvestRecord>('harvest_records');
      setHarvests(local);
    } finally {
      setLoading(false);
    }
  };

  const filteredHarvests = harvests.filter(h => {
    if (!dateFrom && !dateTo) return true;
    const d = new Date(h.harvestDate);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo)) return false;
    return true;
  });

  const totalYield = filteredHarvests.reduce((sum, h) => sum + Number(h.totalQuantity || 0), 0);

  const handleAdd = async () => {
    if (!form.totalQuantity) { toast.error('أدخل الكمية'); return; }
    setSaving(true);
    try {
      if (isOnline) {
        await apiClient.post('/harvest', {
          harvestType: form.harvestType,
          harvestDate: form.harvestDate,
          totalQuantity: parseFloat(form.totalQuantity),
          unit: form.unit,
          hiveId: form.hiveId || undefined,
          notes: form.notes || undefined,
        });
        toast.success('تم إضافة سجل الحصاد');
      } else {
        const record: HarvestRecord = {
          id: Date.now().toString(), ...form,
          totalQuantity: parseFloat(form.totalQuantity),
        };
        setHarvests(prev => [record, ...prev]);
        await addToSyncQueue('harvest_records', 'create', record);
        toast.success('تم الحفظ محلياً');
      }
      setAddOpen(false);
      setForm({ harvestType: 'عسل', harvestDate: new Date().toISOString().split('T')[0], totalQuantity: '', unit: 'كجم', hiveId: '', notes: '' });
      if (isOnline) loadHarvests();
    } catch { toast.error('حدث خطأ'); } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="سجلات الحصاد" subtitle="جاري التحميل..." />
        <div className="flex-1 px-4 py-4 space-y-4">
          {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><div className="h-20 bg-bee-border/50 rounded-lg" /></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="سجلات الحصاد" subtitle={`${filteredHarvests.length} حصاد`} />

      <div className="flex-1 px-4 py-4 space-y-4">
        <Card className="bg-honey/5 border-honey/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">الإنتاج الإجمالي</span>
            <span className="text-lg font-bold text-honey">{totalYield.toFixed(1)} {filteredHarvests[0]?.unit || 'كجم'}</span>
          </div>
        </Card>

        <button onClick={() => setFilterOpen(!filterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterOpen ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'}`}>
          <Filter size={14} /> تصفية
        </button>

        {filterOpen && (
          <Card className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-bee-muted block mb-1">من تاريخ</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-bee-border text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-bee-muted block mb-1">إلى تاريخ</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-bee-border text-sm bg-white" />
              </div>
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-honey font-medium">مسح الفلتر</button>
            )}
          </Card>
        )}

        {filteredHarvests.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <Scale size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">لا توجد سجلات حصاد</p>
            <p className="text-sm">أضف سجل حصاد جديد</p>
          </div>
        ) : (
          filteredHarvests.map(harvest => (
            <Card key={harvest.id}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Scale size={14} className="text-honey" />
                    <span className="text-lg font-bold text-honey">{harvest.totalQuantity} {harvest.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-bee-muted">
                    <Calendar size={12} />
                    {new Date(harvest.harvestDate).toLocaleDateString('ar-SA')}
                  </div>
                  {harvest.hive && <p className="text-xs text-bee-muted">خلية رقم {harvest.hive.hiveNumber}</p>}
                  <p className="text-xs text-honey font-medium">{harvest.harvestType}</p>
                  {harvest.notes && (
                    <div className="flex items-center gap-1 text-xs text-bee-muted">
                      <FileText size={12} />{harvest.notes}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <button onClick={() => setAddOpen(true)}
        className="fixed bottom-24 left-4 w-14 h-14 bg-honey text-white rounded-full shadow-lg flex items-center justify-center hover:bg-honey-dark active:scale-95 transition-all z-40">
        <Plus size={28} />
      </button>

      {addOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">إضافة حصاد</h3>
              <button onClick={() => setAddOpen(false)} className="p-1 text-bee-muted hover:text-bee-text"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-bee-muted block mb-1">نوع الحصاد</label>
                <select value={form.harvestType} onChange={(e) => setForm({ ...form, harvestType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-bee-border text-sm bg-white">
                  <option>عسل</option><option>شمع</option><option>بولين</option><option>أخرى</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-bee-muted block mb-1">التاريخ</label>
                <input type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-bee-border text-sm bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-bee-muted block mb-1">الكمية</label>
                  <input type="number" placeholder="0" value={form.totalQuantity}
                    onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-bee-border text-sm bg-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-bee-muted block mb-1">الوحدة</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-bee-border text-sm bg-white">
                    <option>كجم</option><option>جرام</option><option>لتر</option><option>علبة</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-bee-muted block mb-1">ملاحظات</label>
                <textarea placeholder="اختياري" value={form.notes} rows={2}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-bee-border text-sm bg-white resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setAddOpen(false)}>إلغاء</Button>
              <Button fullWidth onClick={handleAdd} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                {saving ? 'جاري الحفظ...' : 'إضافة'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
