import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success('تم إنشاء الحساب بنجاح');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bee-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐝</div>
          <h1 className="text-2xl font-bold text-bee-text">حساب جديد</h1>
          <p className="text-sm text-bee-muted mt-1">انضم لمملكة النحل</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الاسم"
            placeholder="اسمك هنا"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />
          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
          />
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={18} />
                إنشاء حساب
              </>
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-bee-muted">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-honey font-medium">سجّل دخولك</Link>
        </p>
      </div>
    </div>
  );
}
