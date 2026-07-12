import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function JoinApiaryPage() {
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ inviteCode })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل الانضمام إلى المنحل');
            }

            // Success - redirect to the apiary
            navigate(`/apiary/${data.apiaryId}`);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الانضمام');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4" dir="rtl">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='%23f59e0b' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Animated Icon */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                        <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                            <Hexagon className="w-16 h-16 text-amber-600" />
                        </div>
                        <div className="absolute inset-0 w-32 h-32 bg-amber-200 rounded-full animate-ping opacity-20"></div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border-2 border-amber-100 mt-16">
                    <div className="text-center space-y-6">
                        {/* Header */}
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                                🐝 الانضمام إلى منحل
                            </h1>
                            <p className="text-lg text-gray-600">
                                أدخل رمز الدعوة للانضمام كعامل
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleJoin} className="space-y-4">
                            <div className="text-right">
                                <label htmlFor="inviteCode" className="block text-sm font-bold text-gray-700 mb-2">
                                    رمز الدعوة
                                </label>
                                <input
                                    type="text"
                                    id="inviteCode"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="أدخل رمز الدعوة (مثال: ABC123)"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-center text-lg font-mono tracking-wider"
                                    required
                                    disabled={isLoading}
                                    maxLength={10}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="bg-amber-50 rounded-xl p-4 text-right">
                                <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                    <span className="text-xl">ℹ️</span>
                                    كيف تحصل على رمز الدعوة؟
                                </h3>
                                <ul className="space-y-1 text-sm text-amber-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-500 mt-1">•</span>
                                        <span>اطلب من مالك المنحل إرسال رمز الدعوة لك</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-500 mt-1">•</span>
                                        <span>الرمز صالح لمدة 7 أيام من تاريخ الإنشاء</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-500 mt-1">•</span>
                                        <span>يمكن استخدام الرمز مرة واحدة فقط</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !inviteCode}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        جاري الانضمام...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="w-5 h-5" />
                                        الانضمام إلى المنحل
                                    </>
                                )}
                            </button>

                            {/* Back Button */}
                            <button
                                type="button"
                                onClick={() => navigate('/apiaries')}
                                className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
                            >
                                العودة إلى المناحل
                            </button>
                        </form>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 text-6xl opacity-30 animate-bounce">🐝</div>
                <div className="absolute -bottom-6 -left-6 text-6xl opacity-30 animate-bounce delay-300">🍯</div>
            </div>
        </div>
    );
}
