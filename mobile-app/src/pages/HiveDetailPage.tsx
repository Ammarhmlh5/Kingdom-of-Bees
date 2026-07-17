import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, Bug, Droplets, Merge, Crown, Grid2X2, ArrowRight, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import type { Hive } from '@/types';

export default function HiveDetailPage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiaryId = (location.state as any)?.apiaryId;
  const [hive, setHive] = useState<Hive | null>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hiveId) loadHive();
  }, [hiveId]);

  const loadHive = async () => {
    setLoading(true);
    try {
      if (apiaryId) {
        const { data } = await apiClient.get(`/apiaries/${apiaryId}/hives/${hiveId}`);
        setHive(data.data || data);
        try {
          const inspRes = await apiClient.get(`/apiaries/${apiaryId}/inspections`);
          setInspections((inspRes.data.data || inspRes.data || []).filter((i: any) => String(i.hiveId) === String(hiveId)).slice(0, 3));
        } catch {
          // ignore
        }
      } else {
        const { getById } = await import('@/lib/db');
        const h = await getById<Hive>('hives', hiveId!);
        if (h) setHive(h);
      }
    } catch {
      try {
        const { getById } = await import('@/lib/db');
        const h = await getById<Hive>('hives', hiveId!);
        if (h) setHive(h);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
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

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={hive?.name || 'الخلية'} subtitle={hive?.type || ''} />

      <div className="flex-1 px-4 py-4 space-y-4">
        {hive && (
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
        )}

        <h2 className="text-lg font-bold">إجراءات سريعة</h2>
        <div className="grid grid-cols-3 gap-3">
          {actions.map(({ icon: Icon, label, color, path }) => (
            <Card key={path} onClick={() => navigate(path, { state: { apiaryId } })}>
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
              {inspections.map((insp: any, i: number) => (
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
                      {new Date(insp.date).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
