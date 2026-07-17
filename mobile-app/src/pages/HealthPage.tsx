import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Plus, Bug, AlertTriangle, CheckCircle2, Clock, BookOpen, ChevronLeft, Filter } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface DiseaseRecord {
  id: string;
  diseaseName: string;
  status: 'ACTIVE' | 'TREATED' | 'SUSPECTED';
  hiveId: string;
  hive?: { hiveNumber: string };
  dateReported: string;
  symptoms?: string;
}

const statusConfig: Record<string, { bg: string; label: string; icon: React.JSX.Element }> = {
  ACTIVE: { bg: 'bg-red-100 text-red-700', label: 'نشط', icon: <AlertTriangle size={12} /> },
  TREATED: { bg: 'bg-green-100 text-green-700', label: 'تم العلاج', icon: <CheckCircle2 size={12} /> },
  SUSPECTED: { bg: 'bg-yellow-100 text-yellow-700', label: 'مُشتبه', icon: <Clock size={12} /> },
};

export default function HealthPage() {
  const { id: apiaryId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [records, setRecords] = useState<DiseaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'TREATED' | 'SUSPECTED'>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => { loadRecords(); }, [apiaryId]);

  const loadRecords = async () => {
    if (!apiaryId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/apiaries/${apiaryId}/diseases`);
      setRecords(response.data.data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter(r => filter === 'all' || r.status === filter);
  const activeCount = records.filter(r => r.status === 'ACTIVE').length;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="الصحة والأمراض" subtitle="جاري التحميل..." />
        <div className="flex-1 px-4 py-4 space-y-4">
          {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><div className="h-16 bg-bee-border/50 rounded-lg" /></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="الصحة والأمراض" subtitle={`${activeCount} حالة نشطة`} />

      <div className="flex-1 px-4 py-4 space-y-4">
        <Card className="bg-blue-50 border-blue-200" onClick={() => {}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">مكتبة الأمراض</span>
            </div>
            <ChevronLeft size={16} className="text-blue-400" />
          </div>
        </Card>

        <button onClick={() => setFilterOpen(!filterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterOpen ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'}`}>
          <Filter size={14} /> تصفية
        </button>

        {filterOpen && (
          <div className="flex gap-2">
            {(['all', 'ACTIVE', 'TREATED', 'SUSPECTED'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'}`}>
                {f === 'all' ? 'الكل' : statusConfig[f]?.label || f}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <Bug size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">لا توجد سجلات أمراض</p>
            <p className="text-sm">الخلايا بخير</p>
          </div>
        ) : (
          filtered.map(record => (
            <Card key={record.id}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bug size={14} className="text-honey" />
                    <h3 className="font-bold text-sm">{record.diseaseName}</h3>
                  </div>
                  {record.hive && <p className="text-xs text-bee-muted">خلية رقم {record.hive.hiveNumber}</p>}
                  <div className="flex items-center gap-2 text-xs text-bee-muted">
                    <Clock size={12} />
                    {new Date(record.dateReported).toLocaleDateString('ar-SA')}
                  </div>
                  {record.symptoms && <p className="text-xs text-bee-muted mt-1">{record.symptoms}</p>}
                </div>
                <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${statusConfig[record.status]?.bg || 'bg-gray-100 text-gray-700'}`}>
                  {statusConfig[record.status]?.icon || <Clock size={12} />}
                  {statusConfig[record.status]?.label || record.status}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      <button onClick={() => navigate(-1)}
        className="fixed bottom-24 left-4 w-14 h-14 bg-honey text-white rounded-full shadow-lg flex items-center justify-center hover:bg-honey-dark active:scale-95 transition-all z-40">
        <Plus size={28} />
      </button>
    </div>
  );
}
