import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Droplets, Stethoscope, Bug, Grid2X2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { ApiaryCard } from '@/components/ApiaryCard';
import { ApiaryContextSelector } from '@/components/ApiaryContextSelector';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { SyncService } from '@/lib/services/sync.service';
import { getAll } from '@/lib/db';
import type { Apiary } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ hiveCount: 0, inspectionCount: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const loadApiaries = useCallback(async () => {
    try {
      const data = await getAll<Apiary>('apiaries');
      setApiaries(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (user) loadApiaries();
  }, [loadApiaries, user]);

  const handleSync = async () => {
    setSyncing(true);
    await SyncService.sync();
    await loadApiaries();
    setSyncing(false);
  };

  const handleLogout = async () => {
    const { AuthService } = await import('@/lib/services/auth.service');
    await AuthService.logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-honey border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedApiary = apiaries.find(a => a.id === selectedApiaryId);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header
        title={selectedApiary ? selectedApiary.name : 'مملكة النحل'}
        subtitle={selectedApiary ? 'لوحة التحكم' : `مرحباً، ${user?.name || 'نحال'}`}
        onSync={handleSync}
        syncing={syncing}
        rightAction={
          <button onClick={handleLogout} className="p-2 text-danger hover:bg-red-50 rounded-full transition-colors">
            خروج
          </button>
        }
      />

      <ApiaryContextSelector
        apiaries={apiaries}
        selectedApiaryId={selectedApiaryId}
        onSelect={setSelectedApiaryId}
      />

      {!selectedApiaryId ? (
        <div className="flex-1 px-4 py-4">
          <h2 className="text-lg font-bold mb-3">المناحل</h2>
          {apiaries.length === 0 ? (
            <div className="text-center py-12 text-bee-muted">
              <p className="text-lg mb-2">لا توجد مناحل مسجلة</p>
              <p className="text-sm">اضغط على + لإضافة منحل جديد</p>
            </div>
          ) : (
            apiaries.map(apiary => (
              <ApiaryCard
                key={apiary.id}
                apiary={apiary}
                onClick={() => setSelectedApiaryId(apiary.id)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">إجراءات سريعة</h2>
            <button
              onClick={() => setSelectedApiaryId(null)}
              className="text-sm text-honey font-medium"
            >
              تغيير المنحل
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card onClick={() => navigate(`/apiary/${selectedApiaryId}/hives`)}>
              <div className="flex flex-col items-center gap-2 py-2">
                <Grid2X2 size={28} className="text-honey" />
                <span className="text-sm font-medium">الخلايا</span>
                <span className="text-xs text-bee-muted">{stats.hiveCount}</span>
              </div>
            </Card>
            <Card onClick={() => navigate(`/apiary/${selectedApiaryId}/hives`)}>
              <div className="flex flex-col items-center gap-2 py-2">
                <Stethoscope size={28} className="text-blue-500" />
                <span className="text-sm font-medium">فحص</span>
                <span className="text-xs text-bee-muted">{stats.inspectionCount}</span>
              </div>
            </Card>
            <Card onClick={() => navigate(`/apiary/${selectedApiaryId}/hives`)}>
              <div className="flex flex-col items-center gap-2 py-2">
                <Droplets size={28} className="text-green-500" />
                <span className="text-sm font-medium">تغذية</span>
              </div>
            </Card>
            <Card onClick={() => navigate(`/apiary/${selectedApiaryId}/hives`)}>
              <div className="flex flex-col items-center gap-2 py-2">
                <Bug size={28} className="text-danger" />
                <span className="text-sm font-medium">علاج</span>
              </div>
            </Card>
          </div>

          <Card className="bg-honey/5 border-honey/20">
            <div className="text-center py-2">
              <p className="text-sm text-bee-muted">آخر مزامنة</p>
              <p className="text-xs text-bee-muted mt-1">{new Date().toLocaleTimeString('ar-SA')}</p>
            </div>
          </Card>
        </div>
      )}

      {!selectedApiaryId && (
        <button
          onClick={() => navigate('/apiary/add')}
          className="fixed bottom-24 left-4 w-14 h-14 bg-honey text-white rounded-full shadow-lg flex items-center justify-center hover:bg-honey-dark active:scale-95 transition-all z-40"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  );
}
