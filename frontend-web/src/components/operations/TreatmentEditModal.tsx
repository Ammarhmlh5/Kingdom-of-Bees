import { useState } from 'react';
import { X, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateOperation } from '@/hooks/api/useOperationsLog';
import { Operation } from '@/services/operationsLog';

const DISEASE_OPTIONS = [
    { value: 'VARROA', label: 'الفاروا' },
    { value: 'NOSEMA', label: 'النوزيما' },
    { value: 'FOULBROOD', label: 'التسوس الأمريكي' },
    { value: 'CHALKBROOD', label: 'التسوس الطباشيري' },
    { value: 'WAX_MOTH', label: 'دودة الشمع' },
    { value: 'SMALL_HIVE_BEETLE', label: 'خنفساء الخلية الصغيرة' },
    { value: 'OTHER', label: 'أخرى' },
];

const TREATMENT_TYPES = [
    { value: 'MEDICATION', label: 'دواء' },
    { value: 'CLEANING', label: 'تنظيف' },
    { value: 'FRAME_REPLACEMENT', label: 'استبدال إطارات' },
    { value: 'HIVE_REPLACEMENT', label: 'استبدال خلية' },
    { value: 'OTHER', label: 'أخرى' },
];

interface Props {
    operation: Operation;
    apiaryId: string;
    onClose: () => void;
}

export default function TreatmentEditModal({ operation, apiaryId, onClose }: Props) {
    const updateOp = useUpdateOperation(apiaryId);
    const data = operation.data || {};
    const [form, setForm] = useState({
        treatmentDate: (data.treatmentDate || operation.operationDate).split('T')[0],
        treatmentType: data.treatmentType || 'MEDICATION',
        disease: data.disease || '',
        medication: data.medication || '',
        dosage: data.dosage || '',
        notes: data.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateOp.mutateAsync({
                operationId: operation.id,
                data: {
                    description: operation.description,
                    operationDate: form.treatmentDate,
                    data: {
                        ...data,
                        treatmentType: form.treatmentType,
                        disease: form.disease,
                        medication: form.medication,
                        dosage: form.dosage,
                        notes: form.notes,
                    }
                }
            });
            toast.success('تم تعديل العلاج بنجاح');
            onClose();
        } catch {
            toast.error('فشل في تعديل العلاج');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-red-100"><Stethoscope className="w-5 h-5 text-red-700" /></span>
                        <div>
                            <h2 className="text-lg font-bold">تعديل العلاج #{operation.operationNumber}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
                            <input type="date" value={form.treatmentDate}
                                onChange={e => setForm(f => ({ ...f, treatmentDate: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع العلاج</label>
                            <select value={form.treatmentType} onChange={e => setForm(f => ({ ...f, treatmentType: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                                {TREATMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المرض / المشكلة</label>
                        <select value={form.disease} onChange={e => setForm(f => ({ ...f, disease: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                            <option value="">اختر...</option>
                            {DISEASE_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الدواء</label>
                            <input type="text" value={form.medication}
                                onChange={e => setForm(f => ({ ...f, medication: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="اسم الدواء" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الجرعة</label>
                            <input type="text" value={form.dosage}
                                onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="مثال: 5 مل" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                        <textarea value={form.notes} rows={3}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                            placeholder="أي ملاحظات إضافية..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={updateOp.isPending}
                            className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50">
                            {updateOp.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
