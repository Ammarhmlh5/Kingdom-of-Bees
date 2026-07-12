import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyEmail, sendVerificationEmail } from '@/services/auth';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        if (token) {
            handleVerification();
        } else {
            setStatus('error');
            setError('رابط التحقق غير صالح');
        }
    }, [token]);

    const handleVerification = async () => {
        if (!token) return;

        try {
            await verifyEmail(token);
            setStatus('success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setStatus('error');
            setError(err.message || 'فشل التحقق من البريد الإلكتروني');
        }
    };

    const handleResendEmail = async () => {
        setIsResending(true);
        setResendSuccess(false);

        try {
            // Note: This requires the user's email, which we don't have here
            // In a real app, you'd need to handle this differently
            await sendVerificationEmail();
            setResendSuccess(true);
        } catch (err: any) {
            setError(err.message || 'فشل إعادة إرسال البريد');
        } finally {
            setIsResending(false);
        }
    };

    if (status === 'verifying') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 p-4" dir="rtl">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='%23f59e0b' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-7xl animate-spin">
                        ⏳
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-amber-200">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-4">
                                جاري التحقق...
                            </h1>
                            <p className="text-gray-600">
                                يرجى الانتظار بينما نتحقق من بريدك الإلكتروني
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'success') {
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
                                تم التحقق بنجاح!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                تم التحقق من بريدك الإلكتروني بنجاح
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

    // Error state
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 p-4" dir="rtl">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='%23f59e0b' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-7xl animate-pulse">
                    ❌
                </div>

                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-amber-200">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-red-600 mb-4">
                            فشل التحقق
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {error}
                        </p>

                        {resendSuccess && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                <p className="text-green-700 text-sm">
                                    ✅ تم إرسال بريد التحقق مرة أخرى
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={handleResendEmail}
                                disabled={isResending}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isResending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin">⏳</span>
                                        جاري الإرسال...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        📨 إعادة إرسال بريد التحقق
                                    </span>
                                )}
                            </button>

                            <Link
                                to="/login"
                                className="block w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all duration-300"
                            >
                                العودة لتسجيل الدخول
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-4 -right-4 text-4xl opacity-50 animate-pulse">🍯</div>
                <div className="absolute -bottom-4 -left-4 text-4xl opacity-50 animate-pulse delay-500">🌻</div>
            </div>
        </div>
    );
}
