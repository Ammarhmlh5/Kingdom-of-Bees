import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, Plus, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancials, useCreateFinancialRecord } from '@/hooks/api/useFinancials';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateFinancialInput } from '@/services/financials';

const REVENUE_CATEGORIES = ['مبيعات عسل', 'مبيعات شمع', 'مبيعات حبوب لقاح', 'مبيعات بروبلس', 'خدمات تلقيح', 'أخرى'];
const EXPENSE_CATEGORIES = ['أدوية وعلاج', 'معدات وأدوات', 'تغذية', 'عمالة', 'نقل', 'إيجار', 'أخرى'];

type Period = 'month' | 'quarter' | 'year';
const PERIOD_LABELS: Record<Period, string> = { month: 'الشهر الحالي', quarter: 'ربع السنة', year: 'السنة الكاملة' };

function AddRecordModal({ apiaryId, type, onClose }: {
    apiaryId: string;
    type: 'REVENUE' | 'EXPENSE';
    onClose: () => void;
}) {
    const createRecord = useCreateFinancialRecord(apiaryId);
    const categories = type === 'REVENUE' ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;
    const [form, setForm] = useState<CreateFinancialInput>({
        type,
        amount: 0,
        category: categories[0],
        description: '',
        recordDate: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount || form.amount <= 0) {
            toast.error('يرجى إدخال مبلغ صحيح');
            return;
        }
        try {
            await createRecord.mutateAsync(form);
            toast.success(type === 'REVENUE' ? 'تم إضافة الإيراد بنجاح' : 'تم إضافة التكلفة بنجاح');
            onClose();
        } catch {
            toast.error('فشل في حفظ السجل');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">{type === 'REVENUE' ? 'إضافة إيراد' : 'إضافة تكلفة'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
                        <input type="date" value={form.recordDate}
                            onChange={e => setForm(f => ({ ...f, recordDate: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ريال) *</label>
                        <input type="number" min="0.01" step="0.01" value={form.amount || ''}
                            onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الفئة *</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                        <input type="text" value={form.description || ''}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="تفاصيل إضافية..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={createRecord.isPending}
                            className={`flex-1 text-white py-2.5 rounded-xl font-bold transition disabled:opacity-50 ${type === 'REVENUE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {createRecord.isPending ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function FinancialsPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [period, setPeriod] = useState<Period>('month');
    const [showModal, setShowModal] = useState<'REVENUE' | 'EXPENSE' | null>(null);

    const isOwner = user?.role === 'OWNER' || user?.role === 'ADMIN';
    const { data, isLoading, isError, refetch } = useFinancials(apiaryId, period);

    if (!isOwner) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-amber-700 bg-amber-50 rounded-2xl border border-amber-200" dir="rtl">
                <DollarSign className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-bold text-lg">هذه الصفحة للمالك فقط</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-8 space-y-4" dir="rtl">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                </div>
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-2xl border border-red-100" dir="rtl">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="font-bold">فشل في تحميل البيانات المالية</p>
                <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">إعادة المحاولة</button>
            </div>
        );
    }

    const summary = data?.summary;
    const revenues = (data?.records || []).filter(r => r.type === 'REVENUE');
    const expenses = (data?.records || []).filter(r => r.type === 'EXPENSE');

    return (
        <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        الماليات
                    </h1>
                    <p className="text-gray-500 mt-1">تتبع الإيرادات والتكاليف</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={period} onChange={e => setPeriod(e.target.value as Period)}
                        className="border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                        {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                    <button onClick={() => setShowModal('REVENUE')}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> إيراد
                    </button>
                    <button onClick={() => setShowModal('EXPENSE')}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> تكلفة
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-bold text-sm">إجمالي الإيرادات</span>
                    </div>
                    <p className="text-3xl font-black text-green-800">{(summary?.totalRevenue || 0).toLocaleString('ar-SA')} <span className="text-lg font-medium">ر.س</span></p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 font-bold text-sm">إجمالي التكاليف</span>
                    </div>
                    <p className="text-3xl font-black text-red-800">{(summary?.totalExpenses || 0).toLocaleString('ar-SA')} <span className="text-lg font-medium">ر.س</span></p>
                </div>
                <div className={`border rounded-2xl p-6 ${(summary?.netProfit || 0) >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className={`w-5 h-5 ${(summary?.netProfit || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                        <span className={`font-bold text-sm ${(summary?.netProfit || 0) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>صافي الربح</span>
                    </div>
                    <p className={`text-3xl font-black ${(summary?.netProfit || 0) >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                        {(summary?.netProfit || 0).toLocaleString('ar-SA')} <span className="text-lg font-medium">ر.س</span>
                    </p>
                </div>
            </div>

            {/* Records Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenues */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-green-50/50 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <h3 className="font-bold text-green-800">الإيرادات ({revenues.length})</h3>
                    </div>
                    {revenues.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">لا توجد إيرادات في هذه الفترة</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {revenues.map(r => (
                                <div key={r.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50/50">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{r.category}</p>
                                        {r.description && <p className="text-xs text-gray-400">{r.description}</p>}
                                        <p className="text-xs text-gray-400">{new Date(r.recordDate).toLocaleDateString('ar-SA')}</p>
                                    </div>
                                    <span className="font-bold text-green-700">+{Number(r.amount).toLocaleString('ar-SA')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expenses */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-red-50/50 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <h3 className="font-bold text-red-800">التكاليف ({expenses.length})</h3>
                    </div>
                    {expenses.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">لا توجد تكاليف في هذه الفترة</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {expenses.map(r => (
                                <div key={r.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50/50">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{r.category}</p>
                                        {r.description && <p className="text-xs text-gray-400">{r.description}</p>}
                                        <p className="text-xs text-gray-400">{new Date(r.recordDate).toLocaleDateString('ar-SA')}</p>
                                    </div>
                                    <span className="font-bold text-red-700">-{Number(r.amount).toLocaleString('ar-SA')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && <AddRecordModal apiaryId={apiaryId!} type={showModal} onClose={() => setShowModal(null)} />}
        </div>
    );
}
