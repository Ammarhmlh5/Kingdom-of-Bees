import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { getMyHealthRecords } from "@/services/health";
import { getAlerts, Alert } from "@/services/alerts";
import { useQuery } from '@tanstack/react-query';
import {
    Activity, ShieldAlert, Heart, MapPin, Bell, Plus, X,
    Check, Stethoscope, AlertTriangle, MessageSquare, Info
} from "lucide-react";
import { toast } from 'sonner';
import {
    useActiveDiseases,
    useDiseaseLibrary,
    useHives,
    useCreateDiseaseRecord,
    useResolveDisease
} from '@/hooks/api';

export default function HealthPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const isApiaryContext = !!apiaryId;

    // States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [resolveOutcome, setResolveOutcome] = useState("");
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [alertsLoading, setAlertsLoading] = useState(true);

    // Queries
    // 1. Get records based on context (Apiary specific vs Global)
    const {
        data: apiaryRecords = [],
        isLoading: apiaryRecordsLoading,
    } = useActiveDiseases(apiaryId || '');

    const {
        data: globalRecords = [],
        isLoading: globalRecordsLoading,
    } = useQuery({
        queryKey: ['diseases', 'global'],
        queryFn: getMyHealthRecords,
        enabled: !isApiaryContext
    });

    const loading = isApiaryContext ? apiaryRecordsLoading : (globalRecordsLoading || alertsLoading);
    const records = isApiaryContext ? apiaryRecords : globalRecords;

    // Load alerts only in global page
    useEffect(() => {
        if (!isApiaryContext) {
            async function loadAlerts() {
                try {
                    const nearby = await getAlerts(24.7136, 46.6753, 50);
                    setAlerts(nearby);
                } catch (e) {
                    console.error("Failed to load alerts", e);
                } finally {
                    setAlertsLoading(false);
                }
            }
            loadAlerts();
        } else {
            setAlertsLoading(false);
        }
    }, [isApiaryContext]);

    const activeOutbreaks = records.filter((r: any) => r.status === 'ACTIVE').length;

    // Mutations
    const resolveMutation = useResolveDisease();

    const handleResolveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord || !resolveOutcome.trim()) {
            toast.error("يرجى إدخال نتيجة العلاج");
            return;
        }
        try {
            await resolveMutation.mutateAsync({
                apiaryId: apiaryId!,
                recordId: selectedRecord.id,
                outcome: resolveOutcome
            });
            toast.success("تم تسجيل شفاء الحالة بنجاح");
            setIsResolveModalOpen(false);
            setSelectedRecord(null);
            setResolveOutcome("");
        } catch (err) {
            toast.error("فشل في تسجيل الشفاء");
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                    <Activity className="w-10 h-10 text-red-600 fill-red-600/10" />
                    {isApiaryContext ? "صحة وحماية المنحل" : "إدارة الصحة العامة"}
                </h1>
                
                {isApiaryContext && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-red-600/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        الإبلاغ عن إصابة / علاج جديد
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-8 rounded-3xl border shadow-xl flex items-center justify-between transition-all ${activeOutbreaks > 0 ? 'bg-red-50/50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <div>
                                <span className="text-sm font-bold opacity-60 uppercase text-gray-500">
                                    {isApiaryContext ? "الإصابات النشطة في هذا المنحل" : "إجمالي الإصابات النشطة"}
                                </span>
                                <h2 className={`text-3xl font-black mt-1 ${activeOutbreaks > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                    {activeOutbreaks === 0 ? 'لا توجد إصابات نشطة ✅' : `${activeOutbreaks} إصابات نشطة ⚠️`}
                                </h2>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeOutbreaks > 0 ? 'bg-red-600 text-white shadow-lg shadow-red-600/35' : 'bg-green-600 text-white shadow-lg shadow-green-600/35'}`}>
                                {activeOutbreaks > 0 ? <ShieldAlert className="w-7 h-7" /> : <Heart className="w-7 h-7" />}
                            </div>
                        </div>

                        {!isApiaryContext ? (
                            <div className="p-8 rounded-3xl border border-orange-200 bg-orange-50/50 shadow-xl flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-bold opacity-60 uppercase text-orange-800">تنبيهات الجوار (50 كم)</span>
                                    <h2 className="text-3xl font-black mt-1 text-orange-700">
                                        {alerts.length === 0 ? 'المنطقة آمنة 🛡️' : `${alerts.length} تنبيهات قريبة 🔔`}
                                    </h2>
                                </div>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-500 text-white shadow-lg shadow-orange-500/35">
                                    <MapPin className="w-7 h-7" />
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 rounded-3xl border border-gray-200 bg-gray-50 shadow-xl flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-bold opacity-60 uppercase text-gray-500">إجمالي السجلات المسجلة</span>
                                    <h2 className="text-3xl font-black mt-1 text-gray-800">
                                        {records.length} سجلات صحية
                                    </h2>
                                </div>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-600 text-white">
                                    <Stethoscope className="w-7 h-7" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Nearby Alerts Section (only globally) */}
                    {!isApiaryContext && alerts.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                <Bell className="w-5 h-5 text-orange-500" />
                                تنبيهات الجوار النشطة
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {alerts.map(alert => (
                                    <div key={alert.id} className="bg-white border-r-4 border-r-orange-500 p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{alert.title}</h4>
                                            <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                <MapPin className="w-3 h-3" />
                                                <span>{alert.apiary?.name || 'منحل مجاور'}</span>
                                                <span>•</span>
                                                <span>{new Date(alert.createdAt).toLocaleDateString('ar-SA')}</span>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                            {alert.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Outbreaks log table */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm mt-8">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg">سجل الحالات المرضية والعلاجات</h3>
                        </div>
                        <table className="w-full text-right">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50">
                                    <th className="px-8 py-5">المنحل</th>
                                    <th className="px-8 py-5">المرض</th>
                                    <th className="px-8 py-5">الخلايا المتأثرة</th>
                                    <th className="px-8 py-5">التاريخ</th>
                                    <th className="px-8 py-5">الحالة</th>
                                    {isApiaryContext && <th className="px-8 py-5">الإجراءات</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={isApiaryContext ? 6 : 5} className="px-8 py-10 text-center text-gray-400">
                                            لا توجد سجلات إصابات سابقة
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-red-50/10 border-b border-gray-50 transition-colors">
                                            <td className="px-8 py-5 font-bold text-gray-800">{r.apiary?.name || 'المنحل الحالي'}</td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <div>
                                                        <span className="text-red-600 font-black">{r.disease?.nameAr}</span>
                                                        <span className="text-xs text-gray-400 block">{r.disease?.scientificName}</span>
                                                    </div>
                                                    {r.treatmentPlans && r.treatmentPlans.length > 0 && (
                                                        <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200/60 rounded-lg p-2 max-w-xs">
                                                            <div className="font-bold text-amber-800">
                                                                الخطة العلاجية: {r.treatmentPlans[0].treatment?.nameAr || r.treatmentPlans[0].treatment?.nameEn}
                                                            </div>
                                                            {r.treatmentPlans[0].expectedEndDate && (
                                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                                    انتهاء متوقع: {new Date(r.treatmentPlans[0].expectedEndDate).toLocaleDateString('ar-SA')}
                                                                </div>
                                                            )}
                                                            <div className="text-[10px] text-slate-400">
                                                                فترة التحريم: {r.treatmentPlans[0].treatment?.withdrawalPeriod || 0} أيام
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {r.hives && r.hives.length > 0 ? (
                                                    <span className="inline-flex gap-1 flex-wrap">
                                                        {r.hives.map((h: any) => (
                                                            <span key={h.hiveNumber} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 font-bold">
                                                                خلية {h.hiveNumber}
                                                            </span>
                                                        ))}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 font-bold">كل المنحل ({r.totalAffectedHives} خلايا)</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-gray-500">
                                                {new Date(r.firstDetectedDate || r.reportedAt).toLocaleDateString('ar-SA')}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black ${r.status === 'ACTIVE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {r.status === 'ACTIVE' ? 'تحت العلاج' : 'شُفي'}
                                                    </span>
                                                    {r.status === 'RESOLVED' && r.outcome && (
                                                        <span className="text-[10px] text-gray-400 block max-w-xs truncate" title={r.outcome}>
                                                            النتيجة: {r.outcome}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {isApiaryContext && (
                                                <td className="px-8 py-5">
                                                    {r.status === 'ACTIVE' ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRecord(r);
                                                                setIsResolveModalOpen(true);
                                                            }}
                                                            className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            تسجيل الشفاء
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">مغلق</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Add Disease / Outbreak Modal */}
            {isAddModalOpen && apiaryId && (
                <AddDiseaseModal
                    apiaryId={apiaryId}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}

            {/* Resolve Outbreak Modal */}
            {isResolveModalOpen && selectedRecord && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Check className="w-6 h-6 text-green-600" />
                                تسجيل الشفاء من الإصابة
                            </h2>
                            <button onClick={() => {
                                setIsResolveModalOpen(false);
                                setSelectedRecord(null);
                            }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">
                                    أنت تسجل الشفاء من مرض <strong className="text-red-600">{selectedRecord.disease?.nameAr}</strong> الذي بدأ بتاريخ {new Date(selectedRecord.firstDetectedDate).toLocaleDateString('ar-SA')}.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">النتيجة والإجراءات العلاجية المتخذة *</label>
                                <textarea
                                    value={resolveOutcome}
                                    onChange={e => setResolveOutcome(e.target.value)}
                                    placeholder="اكتب تفاصيل الشفاء والإجراءات النهائية المتخذة (مثال: تم التطهير التام وخلو العينات من الطفيل)"
                                    className="w-full border rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-green-500 outline-none resize-none text-sm"
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsResolveModalOpen(false);
                                        setSelectedRecord(null);
                                    }}
                                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={resolveMutation.isPending}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-green-600/20"
                                >
                                    {resolveMutation.isPending ? "جاري الحفظ..." : "تسجيل الشفاء وتحديث"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Inline Sub-Component: AddDiseaseModal
interface AddDiseaseModalProps {
    apiaryId: string;
    onClose: () => void;
}

function AddDiseaseModal({ apiaryId, onClose }: AddDiseaseModalProps) {
    const { data: diseaseLibrary = [], isLoading: libLoading } = useDiseaseLibrary(apiaryId);
    const { data: hives = [], isLoading: hivesLoading } = useHives(apiaryId);
    const createOutbreak = useCreateDiseaseRecord();

    const [diseaseSearch, setDiseaseSearch] = useState("");
    const [selectedDiseaseId, setSelectedDiseaseId] = useState("");
    const [selectedTreatmentId, setSelectedTreatmentId] = useState("");
    const [selectedHiveId, setSelectedHiveId] = useState("");
    const [outbreakDate, setOutbreakDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState("");

    // Reset treatment selection when disease changes
    React.useEffect(() => {
        setSelectedTreatmentId("");
    }, [selectedDiseaseId]);

    const filteredDiseases = diseaseLibrary.filter((d: any) =>
        d.nameAr.includes(diseaseSearch) || d.nameEn.toLowerCase().includes(diseaseSearch.toLowerCase())
    );

    const selectedDisease = diseaseLibrary.find((d: any) => d.id === selectedDiseaseId);
    const availableTreatments = selectedDisease?.treatments || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDiseaseId) {
            toast.error("يرجى اختيار المرض");
            return;
        }

        try {
            await createOutbreak.mutateAsync({
                apiaryId,
                diseaseId: selectedDiseaseId,
                affectedHives: selectedHiveId ? [selectedHiveId] : [], // Empty array means apiary-wide
                date: new Date(outbreakDate).toISOString(),
                notes: notes || undefined,
                treatmentId: selectedTreatmentId || undefined
            });
            toast.success("تم تسجيل الإصابة والخطة العلاجية بنجاح");
            onClose();
        } catch (err) {
            toast.error("فشل تسجيل الإصابة");
            console.error(err);
        }
    };

    const loading = libLoading || hivesLoading;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                        الإبلاغ وتوثيق الإصابة والعلاج
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* 1. Disease Select with Search */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">اختر المرض أو الآفة *</label>
                            <input
                                type="text"
                                placeholder="ابحث باسم المرض (مثال: الفاروا، تعفن الحضنة)..."
                                value={diseaseSearch}
                                onChange={e => setDiseaseSearch(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 mb-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <div className="h-32 overflow-y-auto border border-gray-100 rounded-lg p-2 space-y-1 bg-gray-50/50">
                                {filteredDiseases.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-4">لا توجد نتائج مطابقة</p>
                                ) : (
                                    filteredDiseases.map((d: any) => (
                                        <div
                                            key={d.id}
                                            onClick={() => setSelectedDiseaseId(d.id)}
                                            className={`p-2 rounded-lg text-xs cursor-pointer flex justify-between items-center transition-all ${
                                                selectedDiseaseId === d.id
                                                    ? 'bg-red-500 text-white font-bold shadow-md'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            <div>
                                                <span>{d.nameAr}</span>
                                                <span className={`block text-[10px] ${selectedDiseaseId === d.id ? 'text-white/80' : 'text-gray-400'}`}>
                                                    {d.scientificName || d.nameEn}
                                                </span>
                                            </div>
                                            {selectedDiseaseId === d.id && <Check className="w-4 h-4" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 2. Target Hive Selector */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">الخلية المستهدفة</label>
                                <select
                                    value={selectedHiveId}
                                    onChange={e => setSelectedHiveId(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-xs"
                                >
                                    <option value="">كل المنحل (إصابة عامة)</option>
                                    {(hives as any[]).map((h: any) => (
                                        <option key={h.id} value={h.id}>
                                            خلية {h.hiveNumber} {h.name ? `(${h.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 3. Date Picker */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ الاكتشاف / العلاج *</label>
                                <input
                                    type="date"
                                    value={outbreakDate}
                                    onChange={e => setOutbreakDate(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-xs"
                                    required
                                />
                            </div>
                        </div>

                        {/* 3. Treatment Plan Selector */}
                        {selectedDiseaseId && availableTreatments.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">البروتوكول العلاجي المقترح من النظام</label>
                                <select
                                    value={selectedTreatmentId}
                                    onChange={e => setSelectedTreatmentId(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-xs bg-amber-50/20 border-amber-200"
                                >
                                    <option value="">-- اختر بروتوكول علاج معتمد (اختياري) --</option>
                                    {availableTreatments.map((t: any) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nameAr} ({t.durationDays ? `${t.durationDays} أيام` : 'غير محدد المدة'} - فترة تحريم {t.withdrawalPeriod || 0} أيام)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 4. Notes Textarea */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">ملاحظات الإصابة وطريقة العلاج المقترحة</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="اكتب تفاصيل الإصابة، الأعراض المرصودة، أو العلاج والأدوية المستخدمة حالياً..."
                                className="w-full border rounded-lg px-3 py-2 h-20 focus:ring-2 focus:ring-red-500 outline-none resize-none text-xs"
                            />
                        </div>

                        {/* Submit Actions */}
                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={createOutbreak.isPending || !selectedDiseaseId}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-red-600/20"
                            >
                                {createOutbreak.isPending ? "جاري الحفظ..." : "تسجيل الإصابة وتنبيه النظام"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
