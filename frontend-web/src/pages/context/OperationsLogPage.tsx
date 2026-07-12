import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    History, ClipboardCheck, Utensils, Sprout, GitFork, GitMerge,
    Stethoscope, Layers, X, AlertCircle, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { useOperationsLog, useDeleteOperation } from '@/hooks/api/useOperationsLog';
import { Skeleton } from '@/components/ui/Skeleton';
import { Operation, OperationType } from '@/services/operationsLog';
import FeedingEditModal from '@/components/operations/FeedingEditModal';
import InspectionEditModal from '@/components/operations/InspectionEditModal';
import HarvestEditModal from '@/components/operations/HarvestEditModal';
import TreatmentEditModal from '@/components/operations/TreatmentEditModal';
import SimpleEditModal from '@/components/operations/SimpleEditModal';

// Operation type config
const OP_CONFIG: Record<OperationType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    INSPECTION: { label: 'فحص', icon: ClipboardCheck, color: 'text-blue-700', bg: 'bg-blue-100' },
    FEEDING:    { label: 'تغذية', icon: Utensils, color: 'text-green-700', bg: 'bg-green-100' },
    HARVEST:    { label: 'حصاد', icon: Sprout, color: 'text-amber-700', bg: 'bg-amber-100' },
    SPLIT:      { label: 'تقسيم', icon: GitFork, color: 'text-purple-700', bg: 'bg-purple-100' },
    MERGE:      { label: 'دمج', icon: GitMerge, color: 'text-orange-700', bg: 'bg-orange-100' },
    TREATMENT:  { label: 'علاج', icon: Stethoscope, color: 'text-red-700', bg: 'bg-red-100' },
    ADD_SUPER:  { label: 'إضافة عاسلة', icon: Layers, color: 'text-gray-700', bg: 'bg-gray-100' },
};

const ALL_TYPES = Object.keys(OP_CONFIG) as OperationType[];


function DeleteConfirmDialog({ operation, apiaryId, onClose }: {
    operation: Operation;
    apiaryId: string;
    onClose: () => void;
}) {
    const deleteOp = useDeleteOperation(apiaryId);

    const handleDelete = async () => {
        try {
            await deleteOp.mutateAsync(operation.id);
            toast.success('تم حذف العملية بنجاح');
            onClose();
        } catch {
            toast.error('فشل في حذف العملية');
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
                    هل أنت متأكد من حذف العملية <strong>#{operation.operationNumber}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
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

export default function OperationsLogPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const [filterType, setFilterType] = useState<OperationType | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [editOp, setEditOp] = useState<Operation | null>(null);
    const [deleteOp, setDeleteOp] = useState<Operation | null>(null);

    const filters = {
        ...(filterType && { operationType: filterType }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
    };

    const { data: operations = [], isLoading, isError, refetch } = useOperationsLog(apiaryId, filters);

    // Stats per type
    const stats = ALL_TYPES.map(type => ({
        type,
        count: (operations as Operation[]).filter(op => op.operationType === type).length,
    })).filter(s => s.count > 0);

    if (isLoading) {
        return (
            <div className="p-8 space-y-4" dir="rtl">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-2xl border border-red-100" dir="rtl">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="font-bold">فشل في تحميل سجل العمليات</p>
                <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <History className="w-8 h-8 text-slate-600" />
                    سجل العمليات
                </h1>
                <p className="text-gray-500 mt-1">جميع العمليات التي تمت في المنحل — التعديل والحذف من هنا</p>
            </div>

            {/* Stats Badges */}
            {stats.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {stats.map(({ type, count }) => {
                        const cfg = OP_CONFIG[type];
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

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-4 items-end shadow-sm">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">نوع العملية</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value as OperationType | '')}
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                        <option value="">جميع الأنواع</option>
                        {ALL_TYPES.map(t => <option key={t} value={t}>{OP_CONFIG[t].label}</option>)}
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

            {/* Operations List */}
            {(operations as Operation[]).length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-500 mb-2">لا توجد عمليات</h3>
                    <p className="text-gray-400">
                        {filterType || startDate || endDate ? 'لا توجد عمليات تطابق الفلاتر المحددة' : 'لم يتم تسجيل أي عمليات في هذا المنحل بعد'}
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
                                <th className="px-6 py-4">الوصف</th>
                                <th className="px-6 py-4">المنفذ</th>
                                <th className="px-6 py-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(operations as Operation[]).map(op => {
                                const cfg = OP_CONFIG[op.operationType] || OP_CONFIG.INSPECTION;
                                const Icon = cfg.icon;
                                return (
                                    <tr key={op.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-sm">
                                                {op.operationNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {new Date(op.operationDate).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {op.hive ? `خلية ${op.hive.hiveNumber}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 text-sm max-w-xs truncate">{op.description}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {op.performer?.fullName || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setEditOp(op)}
                                                    className="text-amber-600 hover:text-amber-800 text-sm font-medium">تعديل</button>
                                                <span className="text-gray-300">|</span>
                                                <button onClick={() => setDeleteOp(op)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium">حذف</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {editOp && (() => {
                const close = () => setEditOp(null);
                switch (editOp.operationType) {
                    case 'FEEDING': return <FeedingEditModal operation={editOp} apiaryId={apiaryId!} onClose={close} />;
                    case 'INSPECTION': return <InspectionEditModal operation={editOp} apiaryId={apiaryId!} onClose={close} />;
                    case 'HARVEST': return <HarvestEditModal operation={editOp} apiaryId={apiaryId!} onClose={close} />;
                    case 'TREATMENT': return <TreatmentEditModal operation={editOp} apiaryId={apiaryId!} onClose={close} />;
                    default: return <SimpleEditModal operation={editOp} apiaryId={apiaryId!} onClose={close} />;
                }
            })()}
            {deleteOp && <DeleteConfirmDialog operation={deleteOp} apiaryId={apiaryId!} onClose={() => setDeleteOp(null)} />}
        </div>
    );
}
