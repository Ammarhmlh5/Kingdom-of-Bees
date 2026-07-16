import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Bell,
  Globe,
  Moon,
  Info,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="الإعدادات" subtitle="تخصيص التطبيق" />

      <div className="flex-1 px-4 py-4 space-y-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-honey/20 flex items-center justify-center">
              <User size={24} className="text-honey" />
            </div>
            <div>
              <p className="font-bold text-base">{user?.name || 'المستخدم'}</p>
              <p className="text-sm text-bee-muted">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </Card>

        <h3 className="font-bold text-sm text-bee-muted px-1">التفضيلات</h3>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-honey" />
              <span className="text-sm font-medium">الإشعارات</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
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
              <Globe size={20} className="text-honey" />
              <span className="text-sm font-medium">اللغة</span>
            </div>
            <div className="flex gap-1 bg-bee-border rounded-lg p-1">
              <button
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  language === 'ar' ? 'bg-honey text-white' : 'text-bee-muted'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  language === 'en' ? 'bg-honey text-white' : 'text-bee-muted'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-honey" />
              <span className="text-sm font-medium">الوضع الليلي</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
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

        <h3 className="font-bold text-sm text-bee-muted px-1">عام</h3>

        <Card onClick={() => {}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info size={20} className="text-honey" />
              <span className="text-sm font-medium">حول التطبيق</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-bee-muted">v1.0.0</span>
              <ChevronLeft size={16} className="text-bee-muted" />
            </div>
          </div>
        </Card>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-medium text-sm border border-red-200 active:scale-[0.98] transition-transform"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
