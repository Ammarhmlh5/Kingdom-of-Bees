import { AlertTriangle, Home, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

import { useState } from 'react';

interface ErrorFallbackProps {
    error: Error | null;
    errorInfo?: React.ErrorInfo | null;
    onReset?: () => void;
}

export function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {

    const [showDetails, setShowDetails] = useState(false);
    const isDev = process.env.NODE_ENV === 'development';

    const handleReload = () => {
        if (onReset) {
            onReset();
        }
        window.location.reload();
    };

    const handleGoHome = () => {
        if (onReset) {
            onReset();
        }
        window.location.href = '/apiaries';
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-4" dir="rtl">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='%23dc2626' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            <div className="relative w-full max-w-2xl">
                {/* Animated Icon */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                        <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
                            <AlertTriangle className="w-16 h-16 text-orange-600" />
                        </div>
                        <div className="absolute inset-0 w-32 h-32 bg-orange-200 rounded-full animate-ping opacity-20"></div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border-2 border-orange-100 mt-16">
                    <div className="text-center space-y-6">
                        {/* Header */}
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                                ⚠️ حدث خطأ غير متوقع
                            </h1>
                            <p className="text-xl font-bold text-gray-700">
                                نعتذر عن الإزعاج. حدث خطأ أثناء تحميل هذه الصفحة.
                            </p>
                        </div>

                        {/* Error Message */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                            <p className="text-sm text-red-700 font-medium">
                                {error?.message || 'خطأ غير معروف'}
                            </p>
                        </div>

                        {/* Explanation */}
                        <div className="bg-gray-50 rounded-2xl p-6 text-right">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-xl">ℹ️</span>
                                ماذا يمكنك فعله؟
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    <span>جرب إعادة تحميل الصفحة - قد يكون الخطأ مؤقتاً</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    <span>ارجع إلى لوحة التحكم وحاول مرة أخرى</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    <span>إذا استمرت المشكلة، يرجى الإبلاغ عن الخطأ</span>
                                </li>
                            </ul>
                        </div>

                        {/* Debug Info (Dev Mode Only) */}
                        {isDev && errorInfo && (
                            <div className="bg-gray-900 rounded-2xl p-4 text-right">
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="w-full flex items-center justify-between text-white font-bold mb-2"
                                >
                                    <span className="flex items-center gap-2">
                                        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </span>
                                    <span>تفاصيل الخطأ (للمطورين)</span>
                                </button>
                                {showDetails && (
                                    <div className="mt-4 text-right">
                                        <pre className="text-xs text-red-400 overflow-auto max-h-64 p-4 bg-gray-800 rounded-xl text-left">
                                            {error?.stack}
                                            {'\n\n'}
                                            {errorInfo.componentStack}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleReload}
                                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                إعادة تحميل الصفحة
                            </button>
                            <button
                                onClick={handleGoHome}
                                className="flex-1 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                العودة إلى لوحة التحكم
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 text-6xl opacity-30 animate-bounce">⚠️</div>
                <div className="absolute -bottom-6 -left-6 text-6xl opacity-30 animate-bounce delay-300">🔧</div>
            </div>
        </div>
    );
}
