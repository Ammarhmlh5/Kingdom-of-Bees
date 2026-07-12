import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '@/services/auth';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        if (password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        if (!token) {
            setError('رابط غير صالح');
            return;
        }

        setIsLoading(true);

        try {
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'فشل إعادة تعيين كلمة المرور');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 p-4" dir="rtl">
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-red-200 max-w-md">
                    <div className="text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-red-600 mb-4">رابط غير صالح</h1>
                        <p className="text-gray-600 mb-6">الرابط المستخدم غير صالح أو منتهي الصلاحية</p>
                        <Link
                            to="/forgot-password"
                            className="inline-block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            طلب رابط جديد
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 p-4" dir="rtl">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='%23f59e0b' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-7xl animate-bounce">
                        ✅
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-amber-200">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-4">
                                تم التغيير بنجاح!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                تم تغيير كلمة المرور بنجاح
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                <p className="text-green-700 text-sm">
                                    🎉 سيتم تحويلك لصفحة تسجيل الدخول خلال لحظات...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 p-4" dir="rtl">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='%23f59e0b' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-7xl animate-bounce">
                    🔐
                </div>

                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-amber-200">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                            إعادة تعيين كلمة المرور
                        </h1>
                        <p className="text-gray-500 mt-2">أدخل كلمة المرور الجديدة</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                كلمة المرور الجديدة
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-white/70"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    minLength={6}
                                />
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    🔒
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                تأكيد كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-white/70"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    minLength={6}
                                />
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    🔒
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    جاري التغيير...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    ✨ تغيير كلمة المرور
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>تذكرت كلمة المرور؟ <Link to="/login" className="text-amber-600 hover:underline font-medium">سجل دخولك</Link></p>
                    </div>
                </div>

                <div className="absolute -bottom-4 -right-4 text-4xl opacity-50 animate-pulse">🍯</div>
                <div className="absolute -bottom-4 -left-4 text-4xl opacity-50 animate-pulse delay-500">🌻</div>
            </div>
        </div>
    );
}
