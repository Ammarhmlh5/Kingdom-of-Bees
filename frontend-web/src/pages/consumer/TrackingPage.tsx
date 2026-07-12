import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { trackProductPublic } from "@/services/traceability";
import { Loader2, MapPin, Calendar, CheckCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TrackingPage() {
    const { code } = useParams();
    const [info, setInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (code) {
            trackProductPublic(code)
                .then(setInfo)
                .catch(() => setError(true))
                .finally(() => setLoading(false));
        }
    }, [code]);

    if (loading) return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
        </div>
    );

    if (error || !info) return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 mb-2">المنتج غير موجود</h1>
                <p className="text-gray-500">لم يتم العثور على بيانات لهذا الكود. يرجى التأكد من الرمز والمحاولة مرة أخرى.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white p-6 pt-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="relative z-10 text-center">
                    <h1 className="text-3xl font-black mb-1">{info.productName}</h1>
                    <p className="text-amber-100 font-mono text-sm tracking-wide">{info.batchCode}</p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-8 space-y-6">
                {/* Trust Badge */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">منتج أصلي وموثق</h3>
                            <p className="text-xs text-gray-500">تم التحقق من مصدر هذا المنتج وجودته عبر منصة Kingdom of Bees.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Journey */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 px-2">رحلة المنتج</h2>

                    <div className="relative pl-4 border-l-2 border-amber-200 ml-4 space-y-8 py-2">
                        {/* Origin */}
                        <div className="relative">
                            <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-[#FDFBF7]"></div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-50">
                                <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
                                    <MapPin className="w-4 h-4" /> المنشأ
                                </div>
                                <p className="font-semibold text-gray-800">{info.origin.apiaryName || "مزرعة محلية"}</p>
                                {info.origin.location?.lat && (
                                    <a
                                        href={`https://www.google.com/maps?q=${info.origin.location.lat},${info.origin.location.lng}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-500 underline mt-1 block"
                                    >
                                        عرض الموقع على الخريطة
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Harvest */}
                        <div className="relative">
                            <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-[#FDFBF7]"></div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-50">
                                <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
                                    <Calendar className="w-4 h-4" /> الحصاد
                                </div>
                                <p className="font-semibold text-gray-800">{new Date(info.harvestDate).toLocaleDateString('ar-SA', { dateStyle: 'long' })}</p>
                                <p className="text-xs text-gray-400 mt-1">تم الجني وفرز العسل في هذا التاريخ</p>
                            </div>
                        </div>

                        {/* Lab Results (if any) */}
                        {info.qualityTests && info.qualityTests.length > 0 && (
                            <div className="relative">
                                <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-[#FDFBF7]"></div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-50">
                                    <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
                                        <ShieldCheck className="w-4 h-4" /> فحوصات الجودة
                                    </div>
                                    <div className="space-y-2">
                                        {info.qualityTests.map((t: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center text-sm p-2 bg-green-50 rounded text-green-800">
                                                <span>{t.test}</span>
                                                <BadgeCheckIcon />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center pt-8">
                    <p className="text-xs text-gray-400 font-mono">Powered by Kingdom of Bees</p>
                </div>
            </div>
        </div >
    );
}

function BadgeCheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );
}
