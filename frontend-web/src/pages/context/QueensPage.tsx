import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Crown, Plus, X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useQueens, useCreateQueen, useDeleteQueen } from '@/hooks/api/useQueens';
import { useHives } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Queen } from '@/services/queens';

const QUEEN_SOURCES = [
    { value: 'PURCHASED', label: 'مشتراة' },
    { value: 'BRED', label: 'مربّاة' },
    { value: 'CAUGHT', label: 'ملتقطة' },
    { value: 'GIFTED', label: 'مهداة' },
];

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'نشطة',
    INACTIVE: 'غير نشطة',
    DEAD: 'ميتة',
    SOLD: 'مباعة',
};

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-600',
    DEAD: 'bg-red-100 text-red-700',
    SOLD: 'bg-blue-100 text-blue-700',
};

function AddQueenModal({ apiaryId, onClose }: { apiaryId: string; onClose: () => void }) {
    const { data: hives = [] } = useHives(apiaryId);
    const createQueen = useCreateQueen(apiaryId);
    const [form, setForm] = useState({
        queenNumber: '',
        source: 'PURCHASED',
        beeBreedId: '',
        birthDate: '',
        introductionDate: '',
        marked: false,
        markColor: '',
        hiveId: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createQueen.mutateAsync({
                queenNumber: form.queenNumber || undefined,
                source: form.source,
                beeBreedId: form.beeBreedId || undefined,
                birthDate: form.birthDate || undefined,
                introductionDate: form.introductionDate || undefined,
                marked: form.marked,
                markColor: form.markColor || undefined,
                hiveId: form.hiveId || undefined,
            });
            toast.success('تم إضافة الملكة بنجاح');
            onClose();
        } catch {
            toast.error('فشل في إضافة الملكة');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">إضافة ملكة جديدة</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الملكة</label>
                            <input type="text" value={form.queenNumber} onChange={e => setForm(f => ({ ...f, queenNumber: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Q-001" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المصدر *</label>
                            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required>
                                {QUEEN_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                            <input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التقديم</label>
                            <input type="date" value={form.introductionDate} onChange={e => setForm(f => ({ ...f, introductionDate: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">لون العلامة</label>
                            <input type="text" value={form.markColor} onChange={e => setForm(f => ({ ...f, markColor: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="أصفر، أبيض..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الخلية</label>
                            <select value={form.hiveId} onChange={e => setForm(f => ({ ...f, hiveId: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="">بدون خلية</option>
                                {(hives as any[]).map((h: any) => (
                                    <option key={h.id} value={h.id}>خلية {h.hiveNumber}{h.name ? ` - ${h.name}` : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="marked" checked={form.marked} onChange={e => setForm(f => ({ ...f, marked: e.target.checked }))}
                            className="w-4 h-4 accent-amber-500" />
                        <label htmlFor="marked" className="text-sm font-medium text-gray-700">مُعلَّمة</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={createQueen.isPending}
                            className="flex-1 bg-amber-600 text-white py-2.5 rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50">
                            {createQueen.isPending ? 'جاري الحفظ...' : 'إضافة الملكة'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function QueenDetailDrawer({ queen, onClose }: { queen: Queen; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">تفاصيل الملكة</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500">رقم الملكة</span><span className="font-bold">{queen.queenNumber || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">الحالة</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[queen.status] || 'bg-gray-100'}`}>{STATUS_LABELS[queen.status] || queen.status}</span>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">المصدر</span><span className="font-medium">{QUEEN_SOURCES.find(s => s.value === queen.source)?.label || queen.source}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">السلالة</span><span className="font-medium">{queen.beeBreed?.nameAr || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">تاريخ الميلاد</span><span className="font-medium">{queen.birthDate ? new Date(queen.birthDate).toLocaleDateString('ar-SA') : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">تاريخ التقديم</span><span className="font-medium">{queen.introductionDate ? new Date(queen.introductionDate).toLocaleDateString('ar-SA') : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">مُعلَّمة</span><span className="font-medium">{queen.marked ? 'نعم' : 'لا'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">لون العلامة</span><span className="font-medium">{queen.markColor || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">الخلية</span><span className="font-medium">{queen.hive ? `خلية ${queen.hive.hiveNumber}` : '-'}</span></div>
                </div>
            </div>
        </div>
    );
}

export default function QueensPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const { data: queens = [], isLoading, isError, refetch } = useQueens(apiaryId);
    const deleteQueen = useDeleteQueen(apiaryId);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedQueen, setSelectedQueen] = useState<Queen | null>(null);

    const activeCount = (queens as Queen[]).filter(q => q.status === 'ACTIVE').length;

    if (isLoading) {
        return (
            <div className="p-8 space-y-4" dir="rtl">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-2xl border border-red-100" dir="rtl">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="font-bold">فشل في تحميل الملكات</p>
                <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Crown className="w-8 h-8 text-amber-500" />
                        الملكات
                    </h1>
                    <p className="text-gray-500 mt-1">إدارة ملكات المنحل وتتبع حالتها</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                        <span className="text-green-700 font-bold text-sm">{activeCount} ملكة نشطة</span>
                    </div>
                    <button onClick={() => setShowAddModal(true)}
                        className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-700 transition flex items-center gap-2 shadow-lg shadow-amber-600/20">
                        <Plus className="w-5 h-5" />
                        إضافة ملكة
                    </button>
                </div>
            </div>

            {(queens as Queen[]).length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center">
                    <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-500 mb-2">لا توجد ملكات مسجلة</h3>
                    <p className="text-gray-400 mb-6">ابدأ بإضافة أول ملكة في منحلك</p>
                    <button onClick={() => setShowAddModal(true)}
                        className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition">
                        إضافة ملكة
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-4">رقم الملكة</th>
                                <th className="px-6 py-4">الحالة</th>
                                <th className="px-6 py-4">تاريخ الميلاد</th>
                                <th className="px-6 py-4">لون العلامة</th>
                                <th className="px-6 py-4">الخلية</th>
                                <th className="px-6 py-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(queens as Queen[]).map(queen => (
                                <tr key={queen.id} className="hover:bg-amber-50/30 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                                    onClick={() => setSelectedQueen(queen)}>
                                    <td className="px-6 py-4 font-bold text-gray-900">{queen.queenNumber || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[queen.status] || 'bg-gray-100'}`}>
                                            {STATUS_LABELS[queen.status] || queen.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {queen.birthDate ? new Date(queen.birthDate).toLocaleDateString('ar-SA') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{queen.markColor || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {queen.hive ? `خلية ${queen.hive.hiveNumber}` : '-'}
                                    </td>
                                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => {
                                            if (confirm('هل أنت متأكد من حذف هذه الملكة؟')) {
                                                deleteQueen.mutate(queen.id, {
                                                    onSuccess: () => toast.success('تم حذف الملكة'),
                                                    onError: () => toast.error('فشل في حذف الملكة')
                                                });
                                            }
                                        }} className="text-red-500 hover:text-red-700 text-sm font-medium">حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && <AddQueenModal apiaryId={apiaryId!} onClose={() => setShowAddModal(false)} />}
            {selectedQueen && <QueenDetailDrawer queen={selectedQueen} onClose={() => setSelectedQueen(null)} />}
        </div>
    );
}
