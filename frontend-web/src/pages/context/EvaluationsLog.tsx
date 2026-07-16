import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Bird, Flower2, CloudSun, History, X, AlertCircle, Filter, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useEvaluationsLog, useDeleteAssessment } from '@/hooks/api/useEvaluationsLog';
import { Skeleton } from '@/components/ui/skeleton';
import { AssessmentType, AssessmentOperation } from '@/services/evaluationsLog';

const ASSESSMENT_CONFIG: Record<AssessmentType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    FLIGHT_ASSESSMENT: { label: 'تقييم السروح', icon: Bird, color: 'text-sky-700', bg: 'bg-sky-100' },
    POLLEN_ASSESSMENT: { label: 'تقييم حبوب اللقاح', icon: Flower2, color: 'text-green-700', bg: 'bg-green-100' },
    WEATHER_LOG: { label: 'تقييم الطقس', icon: CloudSun, color: 'text-amber-700', bg: 'bg-amber-100' },
};

const ALL_TYPES = Object.keys(ASSESSMENT_CONFIG) as AssessmentType[];

function DeleteConfirmDialog({ assessment, apiaryId, onClose }: {
    assessment: AssessmentOperation;
    apiaryId: string;
    onClose: () => void;
}) {
    const deleteOp = useDeleteAssessment(apiaryId);

    const handleDelete = async () => {
        try {
            await deleteOp.mutateAsync(assessment.id);
            toast.success('تم حذف التقييم بنجاح');
            onClose();
        } catch {
            toast.error('فشل في حذف التقييم');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">تأكيد الحذف</h3>
                <p className="text-gray-500 text-sm mb-6">
                    هل أنت متأكد من حذف هذا التقييم <strong>#{assessment.operationNumber}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex gap-3">
                    <button onClick={handleDelete} disabled={deleteOp.isPending}
                        className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50">
                        {deleteOp.isPending ? 'جاري الحذف...' : 'حذف'}
                    </button>
                    <button onClick={onClose} className="flex-1 border py-2.5 rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                </div>
            </div>
        </div>
    );
}

function getAssessmentData(assessment: AssessmentOperation) {
    const d = assessment.data;
    if (!d) return null;

    switch (d.assessmentType) {
        case 'FLIGHT_ASSESSMENT':
            return `🕐 ${d.duration} دقيقة | 🐝 ${d.beeCount} نحلة`;
        case 'POLLEN_ASSESSMENT':
            return `🕐 ${d.duration} دقيقة | 🐝 ${d.pollenCarryingBees ?? d.beeCount} نحلة`;
        case 'WEATHER_LOG': {
            const src = d.source === 'api' ? '🤖 تلقائي' : '✍️ يدوي';
            const parts = [`🌡️ ${d.temperature ?? '-'}°C`, `🌧️ ${d.rainfall ?? 0} مم`];
            if (d.humidity != null) parts.push(`💧 ${d.humidity}%`);
            if (d.windSpeed != null) parts.push(`💨 ${d.windSpeed} كم/س`);
            parts.push(src);
            return parts.join(' | ');
        }
        default:
            return null;
    }
}

export default function EvaluationsLog() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const [filterType, setFilterType] = useState<AssessmentType | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deleteAssessment, setDeleteAssessment] = useState<AssessmentOperation | null>(null);

    const filters = {
        ...(filterType && { assessmentType: filterType }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
    };

    const { data: assessments = [], isLoading, isError, refetch } = useEvaluationsLog(apiaryId, filters);

    const stats = ALL_TYPES.map(type => ({
        type,
        count: (assessments as AssessmentOperation[]).filter(a => a.data?.assessmentType === type).length,
    })).filter(s => s.count > 0);

    if (isLoading) {
        return (
            <div className="space-y-4" dir="rtl">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-2xl border border-red-100" dir="rtl">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="font-bold">فشل في تحميل سجل التقييمات</p>
                <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
            <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-6 h-6 text-slate-600" />
                    سجل التقييمات
                </h3>
                <p className="text-gray-500 text-sm mt-1">جميع التقييمات السابقة المسجلة في المنحل</p>
            </div>

            {stats.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {stats.map(({ type, count }) => {
                        const cfg = ASSESSMENT_CONFIG[type];
                        const Icon = cfg.icon;
                        return (
                            <button key={type} onClick={() => setFilterType(filterType === type ? '' : type)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border transition ${filterType === type ? `${cfg.bg} ${cfg.color} border-current` : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                                <Icon className="w-3.5 h-3.5" />
                                {cfg.label} ({count})
                            </button>
                        );
                    })}
                    {filterType && (
                        <button onClick={() => setFilterType('')} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-gray-500 border border-gray-200 hover:bg-gray-50">
                            <X className="w-3 h-3" /> مسح الفلتر
                        </button>
                    )}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-4 items-end shadow-sm">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">نوع التقييم</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value as AssessmentType | '')}
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                        <option value="">جميع الأنواع</option>
                        {ALL_TYPES.map(t => <option key={t} value={t}>{ASSESSMENT_CONFIG[t].label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">من تاريخ</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">إلى تاريخ</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                {(filterType || startDate || endDate) && (
                    <button onClick={() => { setFilterType(''); setStartDate(''); setEndDate(''); }}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 border rounded-lg hover:bg-gray-50">
                        <Filter className="w-3.5 h-3.5" /> مسح الكل
                    </button>
                )}
            </div>

            {(assessments as AssessmentOperation[]).length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <History className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-500 mb-2">لا توجد تقييمات</h3>
                    <p className="text-gray-400 text-sm">
                        {filterType || startDate || endDate ? 'لا توجد تقييمات تطابق الفلاتر المحددة' : 'لم يتم تسجيل أي تقييمات في هذا المنحل بعد'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">النوع</th>
                                <th className="px-6 py-4">التاريخ</th>
                                <th className="px-6 py-4">الخلية</th>
                                <th className="px-6 py-4">البيانات</th>
                                <th className="px-6 py-4">الوصف</th>
                                <th className="px-6 py-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(assessments as AssessmentOperation[]).map(a => {
                                const cfg = ASSESSMENT_CONFIG[a.data?.assessmentType || 'FLIGHT_ASSESSMENT'];
                                const Icon = cfg.icon;
                                return (
                                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-sm">
                                                {a.operationNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {new Date(a.operationDate).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {a.hive ? `خلية ${a.hive.hiveNumber}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 text-sm">
                                            {getAssessmentData(a)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">
                                            {a.data?.notes || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => setDeleteAssessment(a)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                                                <Trash2 className="w-3.5 h-3.5" /> حذف
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {deleteAssessment && (
                <DeleteConfirmDialog
                    assessment={deleteAssessment}
                    apiaryId={apiaryId!}
                    onClose={() => setDeleteAssessment(null)}
                />
            )}
        </div>
    );
}
