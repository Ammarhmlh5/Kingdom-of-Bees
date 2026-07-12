import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Milk, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useFeedingRecords, useCreateFeedingRecord } from '@/hooks/api/useFeeding';
import { useHives } from '@/hooks/api';
import { Skeleton } from '@/components/ui/Skeleton';

const CONTENT_TYPES = [
    { value: 'SUGAR_SYRUP', label: 'شراب سكر', type: 'internal' },
    { value: 'PROTEIN', label: 'بروتين', type: 'internal' },
    { value: 'POLLEN_SUBSTITUTE', label: 'بديل حبوب لقاح', type: 'internal' },
    { value: 'FONDANT', label: 'فوندان', type: 'internal' },
    { value: 'MEDICINAL', label: 'دوائي', type: 'external' },
    { value: 'SUPPLEMENT', label: 'مكمل غذائي', type: 'external' },
    { value: 'OTHER', label: 'أخرى', type: 'external' },
];

const PURPOSES = [
    { value: 'STIMULATION', label: 'تحفيز' },
    { value: 'MAINTENANCE', label: 'صيانة' },
    { value: 'EMERGENCY', label: 'طارئ' },
    { value: 'TREATMENT', label: 'علاج' },
    { value: 'WINTER_PREP', label: 'تحضير شتاء' },
    { value: 'SPRING_BUILDUP', label: 'بناء ربيعي' },
];

function AddFeedingModal({ apiaryId, onClose }: { apiaryId: string; onClose: () => void }) {
    const { data: hives = [] } = useHives(apiaryId);
    const createFeeding = useCreateFeedingRecord(apiaryId);
    const [form, setForm] = useState({
        hiveId: '',
        feedingDate: new Date().toISOString().split('T')[0],
        feedingLocation: 'INTERNAL',
        contentType: 'SUGAR_SYRUP',
        quantityKg: '',
        purpose: 'MAINTENANCE',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.quantityKg || Number(form.quantityKg) <= 0) {
            toast.error('يرجى إدخال كمية صحيحة');
            return;
        }
        try {
            await createFeeding.mutateAsync({
                apiaryId,
                hiveId: form.hiveId || undefined,
                feedingDate: form.feedingDate,
                feedingLocation: form.feedingLocation as any,
                contentType: form.contentType as any,
                quantityKg: Number(form.quantityKg),
                purpose: form.purpose as any,
                notes: form.notes || undefined,
            });
            toast.success('تم تسجيل التغذية بنجاح');
            onClose();
        } catch {
            toast.error('فشل في تسجيل التغذية');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">تسجيل تغذية جديدة</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الهدف</label>
                        <select value={form.hiveId} onChange={e => setForm(f => ({ ...f, hiveId: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                            <option value="">المنحل كاملاً</option>
                            {(hives as any[]).map((h: any) => (
                                <option key={h.id} value={h.id}>خلية {h.hiveNumber}{h.name ? ` - ${h.name}` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
                            <input type="date" value={form.feedingDate}
                                onChange={e => setForm(f => ({ ...f, feedingDate: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
                            <select value={form.feedingLocation} onChange={e => setForm(f => ({ ...f, feedingLocation: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="INTERNAL">داخلي</option>
                                <option value="EXTERNAL">خارجي</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الغذاء *</label>
                            <select value={form.contentType} onChange={e => setForm(f => ({ ...f, contentType: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                                {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الكمية (كجم) *</label>
                            <input type="number" min="0.01" step="0.01" value={form.quantityKg}
                                onChange={e => setForm(f => ({ ...f, quantityKg: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الغرض</label>
                        <select value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                            {PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                        <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="أي ملاحظات إضافية..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={createFeeding.isPending}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
                            {createFeeding.isPending ? 'جاري الحفظ...' : 'تسجيل التغذية'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function FeedingPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const { data: feedingRecords = [], isLoading, isError, refetch } = useFeedingRecords(apiaryId!);
    const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
    const [showAddModal, setShowAddModal] = useState(false);

    const records = feedingRecords as any[];

    // Compute real stats
    const now = new Date();
    const thisMonth = records.filter((r: any) => {
        const d = new Date(r.feedingDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalSugar = thisMonth.filter((r: any) => r.contentType === 'SUGAR_SYRUP').reduce((s: number, r: any) => s + Number(r.quantityKg || 0), 0);
    const totalProtein = thisMonth.filter((r: any) => r.contentType === 'PROTEIN').reduce((s: number, r: any) => s + Number(r.quantityKg || 0), 0);

    const filtered = records.filter((r: any) =>
        activeTab === 'internal' ? r.feedingLocation === 'INTERNAL' : r.feedingLocation === 'EXTERNAL'
    );

    if (isLoading) {
        return (
            <div className="p-8 space-y-4" dir="rtl">
                <Skeleton className="h-12 w-full max-w-sm rounded-xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-2xl border border-red-100" dir="rtl">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="font-bold">فشل في تحميل سجلات التغذية</p>
                <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Milk className="w-8 h-8 text-blue-500 fill-blue-500/10" />
                        التغذية
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">متابعة تغذية النحل، السكر، والبروتين.</p>
                </div>
                <button onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-600/20">
                    <Plus size={20} />
                    تسجيل تغذية جديدة
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <span className="text-blue-600 font-bold text-sm uppercase">إجمالي السكر (الشهر)</span>
                    <p className="text-4xl font-black text-gray-900 mt-2">{totalSugar.toFixed(1)} <span className="text-lg text-gray-400">كجم</span></p>
                </div>
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                    <span className="text-amber-600 font-bold text-sm uppercase">إجمالي البروتين (الشهر)</span>
                    <p className="text-4xl font-black text-gray-900 mt-2">{totalProtein.toFixed(1)} <span className="text-lg text-gray-400">كجم</span></p>
                </div>
                <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
                    <span className="text-purple-600 font-bold text-sm uppercase">عدد مرات التغذية</span>
                    <p className="text-4xl font-black text-gray-900 mt-2">{thisMonth.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full max-w-[400px] grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
                <button onClick={() => setActiveTab('internal')}
                    className={`text-sm font-bold px-3 py-2.5 rounded-lg transition-all ${activeTab === 'internal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                    تغذية داخلية
                </button>
                <button onClick={() => setActiveTab('external')}
                    className={`text-sm font-bold px-3 py-2.5 rounded-lg transition-all ${activeTab === 'external' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                    تغذية خارجية
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-right">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50">
                            <th className="px-8 py-5">التاريخ</th>
                            <th className="px-8 py-5">النوع</th>
                            <th className="px-8 py-5">الكمية</th>
                            <th className="px-8 py-5">الخلية / المنحل</th>
                            <th className="px-8 py-5">ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-10 text-center text-gray-400 font-medium">
                                    لا توجد سجلات تغذية لعرضها حالياً
                                </td>
                            </tr>
                        ) : (
                            filtered.map((record: any) => (
                                <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-8 py-5 font-medium text-gray-600">
                                        {new Date(record.feedingDate).toLocaleDateString('ar-SA')}
                                    </td>
                                    <td className="px-8 py-5 font-bold text-gray-900">
                                        {CONTENT_TYPES.find(t => t.value === record.contentType)?.label || record.contentType || 'غير محدد'}
                                    </td>
                                    <td className="px-8 py-5 text-blue-600 font-bold">
                                        {Number(record.quantityKg || 0).toFixed(2)} كجم
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-500">
                                        {record.hive ? `خلية ${record.hive.hiveNumber}` : 'المنحل كاملاً'}
                                    </td>
                                    <td className="px-8 py-5 text-gray-400 text-sm">{record.notes || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showAddModal && <AddFeedingModal apiaryId={apiaryId!} onClose={() => setShowAddModal(false)} />}
        </div>
    );
}
