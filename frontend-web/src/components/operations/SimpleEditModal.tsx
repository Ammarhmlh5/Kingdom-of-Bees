import { useState } from 'react';
import { X, GitFork, GitMerge, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateOperation } from '@/hooks/api/useOperationsLog';
import { Operation } from '@/services/operationsLog';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; title: string }> = {
    SPLIT: { icon: GitFork, color: 'text-purple-700', bg: 'bg-purple-100', title: 'تقسيم' },
    MERGE: { icon: GitMerge, color: 'text-orange-700', bg: 'bg-orange-100', title: 'دمج' },
    ADD_SUPER: { icon: Layers, color: 'text-gray-700', bg: 'bg-gray-100', title: 'إضافة عاسلة' },
};

interface Props {
    operation: Operation;
    apiaryId: string;
    onClose: () => void;
}

export default function SimpleEditModal({ operation, apiaryId, onClose }: Props) {
    const updateOp = useUpdateOperation(apiaryId);
    const data = operation.data || {};
    const cfg = TYPE_CONFIG[operation.operationType] || TYPE_CONFIG.ADD_SUPER;
    const Icon = cfg.icon;
    const [form, setForm] = useState({
        operationDate: (data.operationDate || operation.operationDate).split('T')[0],
        description: operation.description,
        notes: data.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateOp.mutateAsync({
                operationId: operation.id,
                data: {
                    description: form.description,
                    operationDate: form.operationDate,
                    data: {
                        ...data,
                        notes: form.notes,
                    }
                }
            });
            toast.success('تم تعديل العملية بنجاح');
            onClose();
        } catch {
            toast.error('فشل في تعديل العملية');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <span className={`p-2 rounded-lg ${cfg.bg}`}><Icon className={`w-5 h-5 ${cfg.color}`} /></span>
                        <div>
                            <h2 className="text-lg font-bold">تعديل {cfg.title} #{operation.operationNumber}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                        <input type="date" value={form.operationDate}
                            onChange={e => setForm(f => ({ ...f, operationDate: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                        <textarea value={form.description} rows={3}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                        <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="أي ملاحظات إضافية..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={updateOp.isPending}
                            className="flex-1 bg-gray-700 text-white py-2.5 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50">
                            {updateOp.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
