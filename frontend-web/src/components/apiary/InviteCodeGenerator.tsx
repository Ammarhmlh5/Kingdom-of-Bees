import { useState } from 'react';
import { Copy, Check, RefreshCw, X } from 'lucide-react';

interface InviteCodeGeneratorProps {
    apiaryId: string;
    apiaryName: string;
    onClose: () => void;
}

export function InviteCodeGenerator({ apiaryId, apiaryName, onClose }: InviteCodeGeneratorProps) {
    const [inviteCode, setInviteCode] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState('');

    const generateCode = async () => {
        setIsGenerating(true);
        setError('');

        try {
            const response = await fetch('/api/auth/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    apiaryId,
                    role: 'WORKER',
                    expiresInDays: 7
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل إنشاء رمز الدعوة');
            }

            setInviteCode(data.inviteCode);
            setExpiresAt(data.expiresAt);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إنشاء الرمز');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatExpiryDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir="rtl">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-2">
                        🔑 دعوة عامل جديد
                    </h2>
                    <p className="text-gray-600">
                        منحل: <span className="font-bold">{apiaryName}</span>
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {!inviteCode ? (
                        <>
                            {/* Info Box */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <h3 className="font-bold text-blue-900 mb-2">ℹ️ معلومات الدعوة</h3>
                                <ul className="space-y-1 text-sm text-blue-700">
                                    <li>• الرمز صالح لمدة 7 أيام</li>
                                    <li>• يمكن استخدامه مرة واحدة فقط</li>
                                    <li>• العامل سيحصل على صلاحيات محدودة</li>
                                </ul>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            {/* Generate Button */}
                            <button
                                onClick={generateCode}
                                disabled={isGenerating}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        جاري الإنشاء...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5" />
                                        إنشاء رمز دعوة
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Generated Code */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                                <p className="text-sm text-gray-600 mb-2 text-center">رمز الدعوة</p>
                                <div className="bg-white rounded-lg p-4 mb-4">
                                    <p className="text-3xl font-mono font-bold text-center text-amber-600 tracking-wider">
                                        {inviteCode}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    صالح حتى: {formatExpiryDate(expiresAt)}
                                </p>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={copyToClipboard}
                                className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="w-5 h-5 text-green-600" />
                                        تم النسخ!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        نسخ الرمز
                                    </>
                                )}
                            </button>

                            {/* Instructions */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-bold text-gray-900 mb-2">📤 كيفية مشاركة الرمز</h3>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    <li>• أرسل الرمز للعامل عبر WhatsApp أو SMS</li>
                                    <li>• اطلب منه فتح التطبيق واختيار "الانضمام إلى منحل"</li>
                                    <li>• سيدخل الرمز وينضم تلقائياً</li>
                                </ul>
                            </div>

                            {/* Generate New */}
                            <button
                                onClick={() => {
                                    setInviteCode('');
                                    setExpiresAt('');
                                }}
                                className="w-full py-3 text-amber-600 hover:text-amber-700 font-bold transition-colors"
                            >
                                إنشاء رمز جديد
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
