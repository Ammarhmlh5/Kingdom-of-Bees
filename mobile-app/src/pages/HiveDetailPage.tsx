import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stethoscope, Bug, Droplets, Merge, Crown, Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { getById } from '@/lib/db';
import type { Hive } from '@/types';

export default function HiveDetailPage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const [hive, setHive] = useState<Hive | null>(null);

  useEffect(() => {
    if (hiveId) {
      getById<Hive>('hives', hiveId).then(h => setHive(h ?? null));
    }
  }, [hiveId]);

  const actions = [
    { icon: Stethoscope, label: 'فحص', color: 'text-blue-500', path: `/hive/${hiveId}/inspect` },
    { icon: Bug, label: 'تسجيل مرض', color: 'text-danger', path: `/hive/${hiveId}/disease` },
    { icon: Droplets, label: 'تغذية', color: 'text-green-500', path: `/hive/${hiveId}/feed` },
    { icon: Crown, label: 'الملكة', color: 'text-purple-500', path: `/hive/${hiveId}/queen` },
    { icon: Merge, label: 'دمج', color: 'text-orange-500', path: `/hive/${hiveId}/merge` },
    { icon: Plus, label: 'إضافة إطار', color: 'text-honey', path: `/hive/${hiveId}/frames` },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={hive?.name || 'الخلية'} subtitle={hive?.type || ''} />

      <div className="flex-1 px-4 py-4">
        {hive && (
          <Card className="mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-bee-muted">الحالة:</span>
                <span className="mr-2 font-medium">
                  {hive.status === 'active' ? 'نشط' : hive.status === 'weak' ? 'ضعيف' : hive.status}
                </span>
              </div>
              <div>
                <span className="text-bee-muted">الملكة:</span>
                <span className="mr-2 font-medium">{hive.queenYear || '-'}</span>
              </div>
              <div>
                <span className="text-bee-muted">الأطر:</span>
                <span className="mr-2 font-medium">{hive.framesCount || 10}</span>
              </div>
              <div>
                <span className="text-bee-muted">المصدر:</span>
                <span className="mr-2 font-medium">{hive.queenSource || '-'}</span>
              </div>
            </div>
          </Card>
        )}

        <h2 className="text-lg font-bold mb-3">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 gap-3">
          {actions.map(({ icon: Icon, label, color, path }) => (
            <Card key={path} onClick={() => navigate(path)}>
              <div className="flex flex-col items-center gap-2 py-3">
                <Icon size={28} className={color} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
