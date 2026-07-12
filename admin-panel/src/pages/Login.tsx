import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/config';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetchWithAuth('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل تسجيل الدخول');
            }

            // Check if user is admin
            if (data.user.userType !== 'ADMIN' && data.user.userType !== 'OWNER') {
                throw new Error('ليس لديك صلاحية الوصول لهذه اللوحة');
            }

            login(data.accessToken, data.user);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-admin-900 to-slate-900 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8 text-center bg-admin-50 border-b border-admin-100">
                    <div className="w-16 h-16 bg-admin-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-admin-600/30 mx-auto mb-4 transform -rotate-6">
                        <ShieldCheck size={36} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">لوحة الإدارة</h1>
                    <p className="text-gray-500 mt-2 text-sm">مملكة النحل - التحكم المركزي</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">البريد الإلكتروني</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-admin-500 focus:ring-4 focus:ring-admin-500/10 outline-none transition-all font-sans"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">كلمة المرور</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-admin-500 focus:ring-4 focus:ring-admin-500/10 outline-none transition-all font-sans"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-admin-600 hover:bg-admin-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-admin-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                جاري الدخول...
                            </>
                        ) : (
                            'دخول آمن'
                        )}
                    </button>
                </form>

                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
                    جميع الحقوق محفوظة © 2025 مملكة النحل
                </div>
            </div>
        </div>
    );
}
