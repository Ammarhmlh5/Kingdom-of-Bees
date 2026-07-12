import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, RefreshCw, Home, AlertCircle } from 'lucide-react';

export default function ServerErrorPage() {
    const navigate = useNavigate();
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        setIsRetrying(true);
        // Wait a bit before reloading to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4" dir="rtl">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='%23a855f7' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            <div className="relative w-full max-w-2xl">
                {/* Animated Icon */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                        <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center animate-pulse">
                            <Wrench className="w-16 h-16 text-purple-600" />
                        </div>
                        <div className="absolute inset-0 w-32 h-32 bg-purple-200 rounded-full animate-ping opacity-20"></div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border-2 border-purple-100 mt-16">
                    <div className="text-center space-y-6">
                        {/* Header */}
                        <div className="space-y-2">
                            <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                                500
                            </h1>
                            <h2 className="text-3xl font-bold text-gray-800">
                                🔧 خطأ في الخادم
                            </h2>
                            <p className="text-lg text-gray-600">
                                نواجه مشكلة تقنية مؤقتة. فريقنا يعمل على حلها.
                            </p>
                        </div>

                        {/* Error Details */}
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                                <div className="text-right">
                                    <h3 className="font-bold text-purple-900 mb-2">ماذا حدث؟</h3>
                                    <p className="text-sm text-purple-700 leading-relaxed">
                                        حدث خطأ غير متوقع في الخادم أثناء معالجة طلبك.
                                        هذا الخطأ تم تسجيله تلقائياً وسيتم حله في أقرب وقت ممكن.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="bg-gray-50 rounded-2xl p-6 text-right">
                            <h3 className="font-bold text-gray-900 mb-3">ماذا يمكنك فعله؟</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 mt-1">•</span>
                                    <span>انتظر بضع دقائق ثم حاول مرة أخرى</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 mt-1">•</span>
                                    <span>تحقق من اتصالك بالإنترنت</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 mt-1">•</span>
                                    <span>إذا استمرت المشكلة، تواصل مع الدعم الفني</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleRetry}
                                disabled={isRetrying}
                                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                                {isRetrying ? 'جاري إعادة المحاولة...' : 'إعادة المحاولة'}
                            </button>
                            <button
                                onClick={() => navigate('/apiaries')}
                                className="flex-1 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                العودة إلى الرئيسية
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 text-6xl opacity-30 animate-bounce">🔧</div>
                <div className="absolute -bottom-6 -left-6 text-6xl opacity-30 animate-bounce delay-300">⚙️</div>
            </div>
        </div>
    );
}
