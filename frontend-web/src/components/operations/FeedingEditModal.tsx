import { useState } from 'react';
import { X, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateOperation } from '@/hooks/api/useOperationsLog';
import { Operation } from '@/services/operationsLog';

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

interface Props {
    operation: Operation;
    apiaryId: string;
    onClose: () => void;
}

export default function FeedingEditModal({ operation, apiaryId, onClose }: Props) {
    const updateOp = useUpdateOperation(apiaryId);
    const data = operation.data || {};
    const [form, setForm] = useState({
        feedingDate: (data.feedingDate || operation.operationDate).split('T')[0],
        feedingLocation: data.feedingLocation || 'INTERNAL',
        contentType: data.contentType || 'SUGAR_SYRUP',
        quantityKg: data.quantityKg?.toString() || data.quantityPerHive?.toString() || '',
        purpose: data.purpose || 'MAINTENANCE',
        notes: data.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.quantityKg || Number(form.quantityKg) <= 0) {
            toast.error('يرجى إدخال كمية صحيحة');
            return;
        }
        try {
            await updateOp.mutateAsync({
                operationId: operation.id,
                data: {
                    description: operation.description,
                    operationDate: form.feedingDate,
                    data: {
                        ...data,
                        feedingLocation: form.feedingLocation,
                        contentType: form.contentType,
                        quantityKg: Number(form.quantityKg),
                        quantityPerHive: Number(form.quantityKg),
                        purpose: form.purpose,
                        notes: form.notes,
                    }
                }
            });
            toast.success('تم تعديل التغذية بنجاح');
            onClose();
        } catch {
            toast.error('فشل في تعديل التغذية');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-green-100"><Utensils className="w-5 h-5 text-green-700" /></span>
                        <div>
                            <h2 className="text-lg font-bold">تعديل التغذية #{operation.operationNumber}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                        <button type="submit" disabled={updateOp.isPending}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50">
                            {updateOp.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
