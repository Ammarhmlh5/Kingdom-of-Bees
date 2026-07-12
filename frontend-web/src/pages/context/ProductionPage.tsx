import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sprout, Plus, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useHarvestHistory, useRecordHarvest } from '@/hooks/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHives } from '@/hooks/api';

const HARVEST_TYPES = [
    { value: 'HONEY', label: 'عسل' },
    { value: 'WAX', label: 'شمع' },
    { value: 'POLLEN', label: 'حبوب لقاح' },
    { value: 'PROPOLIS', label: 'بروبلس' },
    { value: 'ROYAL_JELLY', label: 'غذاء ملكي' },
    { value: 'BEE_VENOM', label: 'سم النحل' },
];

const UNITS = ['KG', 'GRAM', 'LITER'];
const UNIT_LABELS: Record<string, string> = { KG: 'كجم', GRAM: 'جرام', LITER: 'لتر' };

function AddHarvestModal({ apiaryId, onClose }: { apiaryId: string; onClose: () => void }) {
    const { data: hives = [] } = useHives(apiaryId);
    const recordHarvest = useRecordHarvest();
    const [form, setForm] = useState({
        harvestType: 'HONEY',
        harvestDate: new Date().toISOString().split('T')[0],
        totalQuantity: '',
        unit: 'KG',
        hiveId: '',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.totalQuantity || Number(form.totalQuantity) <= 0) {
            toast.error('يرجى إدخال كمية صحيحة');
            return;
        }
        try {
            await recordHarvest.mutateAsync({
                apiaryId,
                harvestType: form.harvestType,
                harvestDate: form.harvestDate,
                totalQuantity: Number(form.totalQuantity),
                unit: form.unit,
                hiveId: form.hiveId || undefined,
                notes: form.notes || undefined,
            });
            toast.success('تم تسجيل الحصاد بنجاح');
            onClose();
        } catch {
            toast.error('فشل في تسجيل الحصاد');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">تسجيل حصاد جديد</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع المنتج *</label>
                            <select value={form.harvestType} onChange={e => setForm(f => ({ ...f, harvestType: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                                {HARVEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
                            <input type="date" value={form.harvestDate} onChange={e => setForm(f => ({ ...f, harvestDate: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الكمية *</label>
                            <input type="number" min="0.001" step="0.001" value={form.totalQuantity}
                                onChange={e => setForm(f => ({ ...f, totalQuantity: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة *</label>
                            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                                {UNITS.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الخلية المصدر</label>
                        <select value={form.hiveId} onChange={e => setForm(f => ({ ...f, hiveId: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                            <option value="">المنحل كاملاً</option>
                            {(hives as any[]).map((h: any) => (
                                <option key={h.id} value={h.id}>خلية {h.hiveNumber}{h.name ? ` - ${h.name}` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                        <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="أي ملاحظات إضافية..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={recordHarvest.isPending}
                            className="flex-1 bg-amber-600 text-white py-2.5 rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50">
                            {recordHarvest.isPending ? 'جاري الحفظ...' : 'تسجيل الحصاد'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ProductionPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const { data: harvestRecords = [], isLoading, isError, refetch } = useHarvestHistory(apiaryId!);
    const [filterType, setFilterType] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const records = harvestRecords as any[];

    // Compute stats
    const totalHoney = records.filter(r => r.harvestType === 'HONEY' && r.unit === 'KG').reduce((s: number, r: any) => s + Number(r.totalQuantity || 0), 0);
    const totalWax = records.filter(r => r.harvestType === 'WAX' && r.unit === 'KG').reduce((s: number, r: any) => s + Number(r.totalQuantity || 0), 0);
    const totalPollen = records.filter(r => r.harvestType === 'POLLEN' && r.unit === 'KG').reduce((s: number, r: any) => s + Number(r.totalQuantity || 0), 0);

    const filtered = filterType ? records.filter(r => r.harvestType === filterType) : records;

    if (isLoading) {
        return (
            <div className="p-8 space-y-4" dir="rtl">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <div className="grid grid-cols-3 gap-4"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div>
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-2xl border border-red-100" dir="rtl">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="font-bold">فشل في تحميل سجلات الحصاد</p>
                <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Sprout className="w-8 h-8 text-amber-500" />
                        الحصاد
                    </h1>
                    <p className="text-gray-500 mt-1">تسجيل وتتبع إنتاج المنحل</p>
                </div>
                <button onClick={() => setShowAddModal(true)}
                    className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-700 transition flex items-center gap-2 shadow-lg shadow-amber-600/20">
                    <Plus className="w-5 h-5" />
                    تسجيل حصاد جديد
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <p className="text-amber-700 font-bold text-sm mb-1">🍯 إجمالي العسل</p>
                    <p className="text-3xl font-black text-amber-900">{totalHoney.toFixed(1)} <span className="text-lg font-medium">كجم</span></p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                    <p className="text-yellow-700 font-bold text-sm mb-1">🕯️ إجمالي الشمع</p>
                    <p className="text-3xl font-black text-yellow-900">{totalWax.toFixed(1)} <span className="text-lg font-medium">كجم</span></p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <p className="text-green-700 font-bold text-sm mb-1">🌸 حبوب اللقاح</p>
                    <p className="text-3xl font-black text-green-900">{totalPollen.toFixed(1)} <span className="text-lg font-medium">كجم</span></p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">فلترة:</span>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                    <option value="">جميع الأنواع</option>
                    {HARVEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            {/* Records */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center">
                    <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-500 mb-2">لا توجد سجلات حصاد</h3>
                    <p className="text-gray-400 mb-6">ابدأ بتسجيل أول حصاد في منحلك</p>
                    <button onClick={() => setShowAddModal(true)}
                        className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition">
                        تسجيل أول حصاد
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-4">التاريخ</th>
                                <th className="px-6 py-4">النوع</th>
                                <th className="px-6 py-4">الكمية</th>
                                <th className="px-6 py-4">الخلية</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r: any) => (
                                <tr key={r.id} className="hover:bg-amber-50/30 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="px-6 py-4 text-gray-600">{new Date(r.harvestDate).toLocaleDateString('ar-SA')}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {HARVEST_TYPES.find(t => t.value === r.harvestType)?.label || r.harvestType}
                                    </td>
                                    <td className="px-6 py-4 text-amber-700 font-bold">
                                        {Number(r.totalQuantity).toFixed(2)} {UNIT_LABELS[r.unit] || r.unit}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {r.hive ? `خلية ${r.hive.hiveNumber}` : 'المنحل كاملاً'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && <AddHarvestModal apiaryId={apiaryId!} onClose={() => setShowAddModal(false)} />}
        </div>
    );
}
