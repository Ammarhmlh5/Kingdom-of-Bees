import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('تسجيل الدخول بجوجل غير مُعدّ');
      return;
    }
    const redirectUri = `${window.location.origin}/login`;
    const scope = 'email profile openid';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token id_token&scope=${encodeURIComponent(scope)}&nonce=nonce_${Date.now()}&prompt=select_account`;
    window.location.href = url;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('access_token')) return;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
      setLoading(true);
      googleLogin(accessToken)
        .then(() => {
          toast.success('تم تسجيل الدخول بنجاح');
          navigate('/');
          window.history.replaceState(null, '', window.location.pathname);
        })
        .catch(() => {
          toast.error('خطأ في تسجيل الدخول بجوجل');
          window.history.replaceState(null, '', window.location.pathname);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bee-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐝</div>
          <h1 className="text-2xl font-bold text-bee-text">مملكة النحل</h1>
          <p className="text-sm text-bee-muted mt-1">سجّل دخولك لإدارة مناحلك</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />
          <div className="relative">
            <Input
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-9 text-bee-muted"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                تسجيل الدخول
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-bee-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-bee-bg px-3 text-bee-muted">أو</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-bee-border rounded-xl text-sm font-medium text-bee-text hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          تسجيل الدخول بجوجل
        </button>

        <p className="text-center mt-6 text-sm text-bee-muted">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-honey font-medium">سجّل الآن</Link>
        </p>
      </div>
    </div>
  );
}
