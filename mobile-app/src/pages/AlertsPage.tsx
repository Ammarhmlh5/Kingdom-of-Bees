import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Bell,
  Filter,
} from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface Alert {
  id: string;
  alertType: string;
  title: string;
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  createdAt: string;
}

const priorityConfig: Record<string, { bg: string; label: string }> = {
  HIGH: { bg: 'bg-red-100 text-red-700', label: 'عالي' },
  MEDIUM: { bg: 'bg-yellow-100 text-yellow-700', label: 'متوسط' },
  LOW: { bg: 'bg-blue-100 text-blue-700', label: 'منخفض' },
};

const typeIcon: Record<string, React.JSX.Element> = {
  DISEASE: <AlertTriangle size={20} className="text-red-500" />,
  WEATHER: <AlertCircle size={20} className="text-yellow-500" />,
  FEEDING: <Info size={20} className="text-blue-500" />,
  INSPECTION: <CheckCircle2 size={20} className="text-green-500" />,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/alerts');
      const alertsData = response.data?.data !== undefined ? response.data.data : response.data;
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = alerts.filter(a => filter === 'all' || a.priority === filter);
  const unreadCount = alerts.filter(a => a.status !== 'DISMISSED' && a.status !== 'RESOLVED').length;

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/alerts/${id}/acknowledge`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
    } catch {
      // Optimistic update
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="التنبيهات" subtitle="جاري التحميل..." />
        <div className="flex-1 px-4 py-4 space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-bee-border/50 rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header
        title="التنبيهات"
        subtitle={`${unreadCount} غير مقروء`}
      />

      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterOpen ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'
            }`}
          >
            <Filter size={14} />
            تصفية
          </button>
          {unreadCount > 0 && (
            <button
              onClick={async () => {
                await apiClient.post('/alerts/dismiss-all');
                setAlerts(prev => prev.map(a => ({ ...a, status: 'DISMISSED' })));
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-bee-border text-bee-muted"
            >
              <CheckCircle2 size={14} />
              قراءة الكل
            </button>
          )}
        </div>

        {filterOpen && (
          <div className="flex gap-2">
            {(['all', 'HIGH', 'MEDIUM', 'LOW'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'
                }`}
              >
                {f === 'all' ? 'الكل' : priorityConfig[f].label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <Bell size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">لا توجد تنبيهات</p>
            <p className="text-sm">كل شيء يبدو جيداً</p>
          </div>
        ) : (
          filtered.map(alert => (
            <Card key={alert.id} className={`${alert.status === 'ACTIVE' ? 'border-honey/50 bg-honey/5' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{typeIcon[alert.alertType] || <Info size={20} className="text-gray-500" />}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm">{alert.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityConfig[alert.priority]?.bg || 'bg-gray-100 text-gray-700'}`}>
                      {priorityConfig[alert.priority]?.label || alert.priority}
                    </span>
                  </div>
                  <p className="text-xs text-bee-muted leading-relaxed">{alert.message}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-bee-muted">
                      {new Date(alert.createdAt).toLocaleString('ar-SA')}
                    </span>
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-xs text-honey font-medium"
                      >
                        تم القراءة
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
