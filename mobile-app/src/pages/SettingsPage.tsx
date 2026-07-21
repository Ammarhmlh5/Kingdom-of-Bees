import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  User,
  Bell,
  Globe,
  Moon,
  Info,
  LogOut,
  ChevronLeft,
  Shield,
  Smartphone,
  HelpCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('ko_notifications') !== 'off';
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('ko_darkMode') === 'on';
  });

  const toggleNotifications = async () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('ko_notifications', next ? 'on' : 'off');
    if (next && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setNotifications(false);
        localStorage.setItem('ko_notifications', 'off');
        toast.error('تم رفض إذن الإشعارات');
      }
    }
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('ko_darkMode', next ? 'on' : 'off');
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleClearCache = async () => {
    try {
      const { getDB } = await import('@/lib/db');
      const db = await getDB();
      for (const storeName of db.objectStoreNames) {
        const tx = db.transaction(storeName, 'readwrite');
        await tx.objectStore(storeName).clear();
        await tx.done;
      }
      toast.success('تم مسح الكاش بنجاح');
    } catch {
      localStorage.clear();
      toast.success('تم مسح الكاش');
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="الإعدادات" subtitle="تخصيص التطبيق" />

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Profile Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-honey/20 flex items-center justify-center">
              {user?.name ? (
                <span className="text-xl font-bold text-honey">
                  {user.name.charAt(0)}
                </span>
              ) : (
                <User size={28} className="text-honey" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-base">{user?.name || 'المستخدم'}</p>
              <p className="text-sm text-bee-muted">{user?.email || ''}</p>
              {user?.role && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-honey/10 text-honey text-xs rounded-full font-medium">
                  {user.role === 'ADMIN' ? 'مدير' : user.role === 'OWNER' ? 'مالك' : 'نحال'}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <h3 className="font-bold text-sm text-bee-muted px-1">التفضيلات</h3>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-honey" />
              <span className="text-sm font-medium">الإشعارات</span>
            </div>
            <button
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                notifications ? 'bg-honey' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifications ? 'right-0.5' : 'right-6'
                }`}
              />
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-honey" />
              <span className="text-sm font-medium">الوضع الليلي</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                darkMode ? 'bg-honey' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  darkMode ? 'right-0.5' : 'right-6'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* General */}
        <h3 className="font-bold text-sm text-bee-muted px-1">عام</h3>

        <Card onClick={handleClearCache}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone size={20} className="text-honey" />
              <span className="text-sm font-medium">مسح الكاش</span>
            </div>
            <ChevronLeft size={16} className="text-bee-muted" />
          </div>
        </Card>

        <Card onClick={() => toast.info('قريباً')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-honey" />
              <span className="text-sm font-medium">الخصوصية والأمان</span>
            </div>
            <ChevronLeft size={16} className="text-bee-muted" />
          </div>
        </Card>

        <Card onClick={() => toast.info('قريباً')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle size={20} className="text-honey" />
              <span className="text-sm font-medium">المساعدة والدعم</span>
            </div>
            <ChevronLeft size={16} className="text-bee-muted" />
          </div>
        </Card>

        <Card onClick={() => toast.info('مملكة النحل v2.0.0')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info size={20} className="text-honey" />
              <span className="text-sm font-medium">حول التطبيق</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-bee-muted">v2.0.0</span>
              <ChevronLeft size={16} className="text-bee-muted" />
            </div>
          </div>
        </Card>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm border border-red-200 active:scale-[0.98] transition-transform mt-4"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>

        <p className="text-center text-xs text-bee-muted pb-4">
          مملكة النحل v2.0.0
        </p>
      </div>
    </div>
  );
}
