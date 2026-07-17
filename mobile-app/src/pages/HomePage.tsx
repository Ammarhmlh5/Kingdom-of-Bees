import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Droplets, Stethoscope, Bug, Grid2X2, ChevronDown } from 'lucide-react';
import { Header } from '@/components/Header';
import { ApiaryCard } from '@/components/ApiaryCard';
import { ApiaryContextSelector } from '@/components/ApiaryContextSelector';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { SyncService } from '@/lib/services/sync.service';
import apiClient from '@/lib/apiClient';
import type { Apiary } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ hiveCount: 0, inspectionCount: 0, honeyHarvest: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const loadApiaries = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/apiaries/my');
      const list = Array.isArray(data) ? data : (data.data || []);
      setApiaries(list);
    } catch {
      try {
        const { getAll } = await import('@/lib/db');
        const data = await getAll<Apiary>('apiaries');
        setApiaries(data);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (user) loadApiaries();
  }, [loadApiaries, user]);

  const loadStats = useCallback(async (apiaryId: string) => {
    try {
      const { data } = await apiClient.get(`/apiaries/${apiaryId}`);
      setStats({
        hiveCount: data._count?.hives || data.hiveCount || 0,
        inspectionCount: data._count?.inspections || data.inspectionCount || 0,
        honeyHarvest: data.honeyHarvest || 0,
      });
    } catch {
      setStats({ hiveCount: 0, inspectionCount: 0, honeyHarvest: 0 });
    }
  }, []);

  useEffect(() => {
    if (selectedApiaryId) loadStats(selectedApiaryId);
  }, [selectedApiaryId, loadStats]);

  const handleSync = async () => {
    setSyncing(true);
    await SyncService.sync();
    await loadApiaries();
    setSyncing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bee-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-honey border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-bee-muted">جاري التحميل...</p>
        </div>
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
          <button
            onClick={handleLogout}
            className="text-xs text-danger px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
          >
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
            <div className="flex flex-col items-center justify-center py-16 text-bee-muted">
              <div className="text-5xl mb-4">🍯</div>
              <p className="text-lg font-medium mb-2">لا توجد مناحل مسجلة</p>
              <p className="text-sm mb-4">ابدأ بإضافة منحل جديد</p>
              <button
                onClick={() => navigate('/apiary/add')}
                className="px-6 py-2.5 bg-honey text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                + إضافة منحل
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {apiaries.map(apiary => (
                <ApiaryCard
                  key={apiary.id}
                  apiary={apiary}
                  onClick={() => setSelectedApiaryId(apiary.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">إجراءات سريعة</h2>
            <button
              onClick={() => setSelectedApiaryId(null)}
              className="flex items-center gap-1 text-sm text-honey font-medium"
            >
              تغيير المنحل
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card onClick={() => navigate(`/apiary/${selectedApiaryId}/hives`)}>
              <div className="flex flex-col items-center gap-2 py-3">
                <Grid2X2 size={28} className="text-honey" />
                <span className="text-sm font-medium">الخلايا</span>
                <span className="text-2xl font-bold text-honey">{stats.hiveCount}</span>
              </div>
            </Card>
            <Card onClick={() => navigate(`/apiary/${selectedApiaryId}/hives`)}>
              <div className="flex flex-col items-center gap-2 py-3">
                <Stethoscope size={28} className="text-blue-500" />
                <span className="text-sm font-medium">الفحوصات</span>
                <span className="text-2xl font-bold text-blue-500">{stats.inspectionCount}</span>
              </div>
            </Card>
            <Card onClick={() => navigate(`/apiary/${selectedApiaryId}/health`)}>
              <div className="flex flex-col items-center gap-2 py-3">
                <Droplets size={28} className="text-green-500" />
                <span className="text-sm font-medium">التغذية</span>
              </div>
            </Card>
            <Card onClick={() => navigate(`/apiary/${selectedApiaryId}/health`)}>
              <div className="flex flex-col items-center gap-2 py-3">
                <Bug size={28} className="text-danger" />
                <span className="text-sm font-medium">الصحة</span>
              </div>
            </Card>
          </div>

          <Card className="bg-honey/5 border-honey/20">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-bee-text">العسل المحصود</p>
                <p className="text-xs text-bee-muted mt-0.5">هذا الموسم</p>
              </div>
              <span className="text-xl font-bold text-honey">{stats.honeyHarvest} كجم</span>
            </div>
          </Card>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/apiary/${selectedApiaryId}/team`)}
              className="flex-1 py-3 bg-white border border-bee-border rounded-xl text-sm font-medium text-bee-text hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              👥 الفريق
            </button>
            <button
              onClick={() => navigate('/bee-counter')}
              className="flex-1 py-3 bg-honey text-white rounded-xl text-sm font-medium hover:bg-honey-dark active:scale-[0.98] transition-all"
            >
              🐝 عد النحل
            </button>
          </div>
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
