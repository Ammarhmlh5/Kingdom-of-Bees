import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, Bug, Droplets, Merge, Crown, Grid2X2, ArrowRight, Loader2, Trash2, X, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/apiClient';
import type { Hive } from '@/types';
import { toast } from 'sonner';

interface InspectionRecord {
  id?: string;
  hiveId?: string;
  date?: string;
  temperament?: string;
  queenSeen?: boolean;
  frames?: unknown[];
  [key: string]: unknown;
}

function unwrap(data: any, fallback: any = null) {
  if (data === null || data === undefined) return fallback;
  if (data.data !== undefined && data.data !== null) return data.data;
  return data;
}

export default function HiveDetailPage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [resolvedApiaryId, setResolvedApiaryId] = useState<string | undefined>((location.state as any)?.apiaryId);
  const [hive, setHive] = useState<Hive | null>(null);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (hiveId) loadHive();
  }, [hiveId]);

  const loadHive = async () => {
    setLoading(true);
    try {
      if (resolvedApiaryId) {
        const { data } = await apiClient.get(`/apiaries/${resolvedApiaryId}/hives/${hiveId}`);
        const hiveData = unwrap(data);
        setHive(hiveData);
        if (hiveData?.apiaryId) setResolvedApiaryId(String(hiveData.apiaryId));
        try {
          const inspRes = await apiClient.get(`/apiaries/${resolvedApiaryId}/inspections`);
          const inspList = unwrap(inspRes.data, []);
          setInspections((Array.isArray(inspList) ? inspList : []).filter((i: InspectionRecord) => String(i.hiveId) === String(hiveId)).slice(0, 3));
        } catch {
          // ignore
        }
      } else {
        const { data } = await apiClient.get('/apiaries');
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        for (const apiary of list) {
          try {
            const { data: hiveData } = await apiClient.get(`/apiaries/${apiary.id}/hives/${hiveId}`);
            const h = unwrap(hiveData);
            if (h) {
              setHive(h);
              setResolvedApiaryId(String(h.apiaryId || apiary.id));
              try {
                const inspRes = await apiClient.get(`/apiaries/${apiary.id}/inspections`);
                const inspList = unwrap(inspRes.data, []);
                setInspections((Array.isArray(inspList) ? inspList : []).filter((i: InspectionRecord) => String(i.hiveId) === String(hiveId)).slice(0, 3));
              } catch { /* ignore */ }
              return;
            }
          } catch {
            // this apiary doesn't have the hive, try next
          }
        }
        toast.error('لم يتم العثور على الخلية في أي منحل');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Unknown error';
      console.error('[HiveDetail] Failed to load hive:', msg);
      toast.error(`فشل تحميل الخلية: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      if (resolvedApiaryId) {
        await apiClient.delete(`/apiaries/${resolvedApiaryId}/hives/${hiveId}`);
      }
      toast.success('تم حذف الخلية بنجاح');
      navigate(-1);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'حدث خطأ أثناء الحذف';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    active: 'bg-green-100 text-green-700',
    WEAK: 'bg-yellow-100 text-yellow-700',
    DEAD: 'bg-red-100 text-red-700',
  };

  const statusLabel: Record<string, string> = {
    ACTIVE: 'نشط', active: 'نشط',
    WEAK: 'ضعيف', weak: 'ضعيف',
    DEAD: 'متوفى', dead: 'متوفى',
  };

  const actions = [
    { icon: Stethoscope, label: 'فحص', color: 'text-blue-500', path: `/hive/${hiveId}/inspect` },
    { icon: Bug, label: 'مرض', color: 'text-danger', path: `/hive/${hiveId}/disease` },
    { icon: Droplets, label: 'تغذية', color: 'text-green-500', path: `/hive/${hiveId}/feed` },
    { icon: Crown, label: 'الملكة', color: 'text-purple-500', path: `/hive/${hiveId}/queen` },
    { icon: Merge, label: 'دمج', color: 'text-orange-500', path: `/hive/${hiveId}/merge` },
    { icon: Grid2X2, label: 'الأطر', color: 'text-honey', path: `/hive/${hiveId}/frames` },
  ];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="الخلية" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-honey" size={32} />
        </div>
      </div>
    );
  }

  if (!hive) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="الخلية" />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <AlertTriangle size={48} className="text-yellow-400 mb-4" />
          <p className="text-sm text-bee-muted text-center mb-4">لم يتم العثور على الخلية</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>رجوع</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={hive.name || 'الخلية'} subtitle={hive.type || ''} />

      <div className="flex-1 px-4 py-4 space-y-4">
        <Card>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-bee-muted text-xs">الحالة</span>
                <span className={`mr-2 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[hive.status] || 'bg-gray-100'}`}>
                  {statusLabel[hive.status] || hive.status}
                </span>
              </div>
              <div>
                <span className="text-bee-muted text-xs">الملكة</span>
                <span className="mr-2 font-medium">{hive.queenYear || '-'}</span>
              </div>
              <div>
                <span className="text-bee-muted text-xs">الأطر</span>
                <span className="mr-2 font-medium">{hive.framesCount || 10}</span>
              </div>
              <div>
                <span className="text-bee-muted text-xs">المصدر</span>
                <span className="mr-2 font-medium">{hive.queenSource || '-'}</span>
              </div>
            </div>
          </Card>

        <h2 className="text-lg font-bold">إجراءات سريعة</h2>
        <div className="grid grid-cols-3 gap-3">
          {actions.map(({ icon: Icon, label, color, path }) => (
            <Card key={path} onClick={() => navigate(path, { state: { apiaryId: resolvedApiaryId } })}>
              <div className="flex flex-col items-center gap-1.5 py-2">
                <Icon size={24} className={color} />
                <span className="text-xs font-medium">{label}</span>
              </div>
            </Card>
          ))}
        </div>

        {inspections.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">آخر الفحوصات</h2>
              <button className="text-xs text-honey font-medium">عرض الكل</button>
            </div>
            <div className="space-y-2">
              {inspections.map((insp, i) => (
                <Card key={insp.id || i}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {insp.temperament === 'calm' ? 'هادئ' : insp.temperament === 'aggressive' ? 'عدواني' : insp.temperament || '—'}
                      </p>
                      <p className="text-xs text-bee-muted">
                        {insp.queenSeen ? 'الملكة مرئية' : 'الملكة غير مرئية'} · {insp.frames?.length || 0} أطر
                      </p>
                    </div>
                    <span className="text-xs text-bee-muted">
                      {insp.date ? new Date(insp.date).toLocaleDateString('ar-SA') : '—'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="pt-4 border-t border-bee-border mt-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 text-danger text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            حذف الخلية
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">تأكيد الحذف</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="p-1 text-bee-muted hover:text-bee-text">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-bee-text mb-1">
              هل أنت متأكد من حذف الخلية <strong>"{hive?.name}"</strong>؟
            </p>
            <p className="text-xs text-danger mb-6">
              سيتم حذف جميع البيانات المرتبطة بهذه الخلية نهائياً.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(false)}>
                إلغاء
              </Button>
              <Button variant="danger" fullWidth onClick={handleDelete} disabled={deleting}>
                {deleting ? 'جاري الحذف...' : 'نعم، حذف'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
