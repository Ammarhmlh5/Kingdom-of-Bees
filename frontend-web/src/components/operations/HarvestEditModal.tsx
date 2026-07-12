import { useState } from 'react';
import { X, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateOperation } from '@/hooks/api/useOperationsLog';
import { Operation } from '@/services/operationsLog';

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

interface Props {
    operation: Operation;
    apiaryId: string;
    onClose: () => void;
}

export default function HarvestEditModal({ operation, apiaryId, onClose }: Props) {
    const updateOp = useUpdateOperation(apiaryId);
    const data = operation.data || {};
    const [form, setForm] = useState({
        harvestDate: (data.harvestDate || operation.operationDate).split('T')[0],
        harvestType: data.harvestType || 'HONEY',
        totalQuantity: data.totalQuantity?.toString() || data.quantity?.toString() || data.quantityKg?.toString() || '',
        unit: data.unit || 'KG',
        notes: data.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.totalQuantity || Number(form.totalQuantity) <= 0) {
            toast.error('يرجى إدخال كمية صحيحة');
            return;
        }
        try {
            await updateOp.mutateAsync({
                operationId: operation.id,
                data: {
                    description: operation.description,
                    operationDate: form.harvestDate,
                    data: {
                        ...data,
                        harvestType: form.harvestType,
                        totalQuantity: Number(form.totalQuantity),
                        quantity: Number(form.totalQuantity),
                        quantityKg: Number(form.totalQuantity),
                        unit: form.unit,
                        notes: form.notes,
                    }
                }
            });
            toast.success('تم تعديل الحصاد بنجاح');
            onClose();
        } catch {
            toast.error('فشل في تعديل الحصاد');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-amber-100"><Sprout className="w-5 h-5 text-amber-700" /></span>
                        <div>
                            <h2 className="text-lg font-bold">تعديل الحصاد #{operation.operationNumber}</h2>
                        </div>
                    </div>
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
                            <input type="date" value={form.harvestDate}
                                onChange={e => setForm(f => ({ ...f, harvestDate: e.target.value }))}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                        <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="أي ملاحظات إضافية..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={updateOp.isPending}
                            className="flex-1 bg-amber-600 text-white py-2.5 rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50">
                            {updateOp.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
