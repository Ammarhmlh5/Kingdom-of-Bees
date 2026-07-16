import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, ClipboardCheck, X, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useInspections, useCreateInspection } from '@/hooks/api';
import { useHives } from '@/hooks/api';
import { useInspectionSettings, useValidateInspectionDate } from '@/hooks/api/useInspectionSettings';
import { Skeleton } from '@/components/ui/skeleton';

const INSPECTION_TYPES = [
    { value: 'ROUTINE', label: 'روتيني' },
    { value: 'DETAILED', label: 'تفصيلي' },
    { value: 'QUICK_CHECK', label: 'فحص سريع' },
    { value: 'DISEASE_CHECK', label: 'فحص أمراض' },
    { value: 'QUEEN_CHECK', label: 'فحص ملكة' },
];

const ASSESSMENT_LABELS: Record<string, string> = {
    EXCELLENT: 'ممتاز', GOOD: 'جيد', FAIR: 'مقبول', POOR: 'ضعيف', CRITICAL: 'حرج'
};
const ASSESSMENT_COLORS: Record<string, string> = {
    EXCELLENT: 'bg-green-100 text-green-700',
    GOOD: 'bg-blue-100 text-blue-700',
    FAIR: 'bg-yellow-100 text-yellow-700',
    POOR: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
};

function AddInspectionModal({ apiaryId, onClose }: { apiaryId: string; onClose: () => void }) {
    const { data: hives = [] } = useHives(apiaryId);
    const { data: settings = [] } = useInspectionSettings();
    const validateDate = useValidateInspectionDate();
    const createInspection = useCreateInspection();
    const [validationMsg, setValidationMsg] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [form, setForm] = useState({
        hiveId: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionType: 'ROUTINE',
        queenSeen: false,
        overallAssessment: 'GOOD',
        notes: '',
    });

    const currentSetting = (settings as any[]).find((s: any) => s.type === form.inspectionType);

    useEffect(() => {
      if (currentSetting && currentSetting.isActive !== false) {
        setValidationMsg(`الحد الأدنى: ${currentSetting.minInterval} يوم | الحد الأعلى: ${currentSetting.maxInterval} يوم`);
        setValidationError(null);
      } else if (currentSetting?.isActive === false) {
        setValidationMsg(null);
        setValidationError('هذا النوع غير مفعل حالياً');
      } else {
        setValidationMsg(null);
        setValidationError(null);
      }
    }, [form.inspectionType, currentSetting]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.hiveId) { toast.error('يرجى اختيار خلية'); return; }

        if (currentSetting && currentSetting.isActive !== false && form.inspectionType !== 'QUICK_CHECK') {
          try {
            const result = await validateDate.mutateAsync({
              type: form.inspectionType,
              inspectionDate: form.inspectionDate,
            });
            if (!result.valid) {
              toast.error(result.message || 'التاريخ خارج النطاق المسموح');
              return;
            }
          } catch {
            const date = new Date(form.inspectionDate);
            const now = new Date();
            const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < currentSetting.minInterval) {
              toast.error(`التاريخ قريب جداً. أدنى فترة: ${currentSetting.minInterval} أيام`);
              return;
            }
            if (diffDays > currentSetting.maxInterval) {
              toast.error(`التاريخ بعيد جداً. أقصى فترة: ${currentSetting.maxInterval} أيام`);
              return;
            }
          }
        }

        try {
            await createInspection.mutateAsync({
                apiaryId,
                data: {
                    hiveId: form.hiveId,
                    inspectionDate: form.inspectionDate,
                    inspectionType: form.inspectionType as any,
                    queenSeen: form.queenSeen,
                    overallAssessment: form.overallAssessment as any,
                    notes: form.notes || undefined,
                },
            });
            toast.success('تم تسجيل الفحص بنجاح');
            onClose();
        } catch {
            toast.error('فشل في تسجيل الفحص');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">فحص جديد</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الخلية *</label>
                        <select value={form.hiveId} onChange={e => setForm(f => ({ ...f, hiveId: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required>
                            <option value="">-- اختر خلية --</option>
                            {(hives as any[]).map((h: any) => (
                                <option key={h.id} value={h.id}>خلية {h.hiveNumber}{h.name ? ` - ${h.name}` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
                            <input type="date" value={form.inspectionDate}
                                onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الفحص</label>
                            <select value={form.inspectionType} onChange={e => setForm(f => ({ ...f, inspectionType: e.target.value }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                                {INSPECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>
                    {validationMsg && (
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>{validationMsg}</span>
                      </div>
                    )}
                    {validationError && (
                      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{validationError}</span>
                      </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التقييم العام</label>
                        <select value={form.overallAssessment} onChange={e => setForm(f => ({ ...f, overallAssessment: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                            {Object.entries(ASSESSMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="queenSeen" checked={form.queenSeen}
                            onChange={e => setForm(f => ({ ...f, queenSeen: e.target.checked }))}
                            className="w-4 h-4 accent-amber-500" />
                        <label htmlFor="queenSeen" className="text-sm font-medium text-gray-700">تمت رؤية الملكة</label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                        <textarea value={form.notes} rows={3}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                            placeholder="أي ملاحظات عن الفحص..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={createInspection.isPending || validateDate.isPending}
                            className="flex-1 bg-amber-600 text-white py-2.5 rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50">
                            {createInspection.isPending ? 'جاري الحفظ...' : validateDate.isPending ? 'جاري التحقق...' : 'تسجيل الفحص'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function InspectionsPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data: inspections = [], isLoading, isError, refetch } = useInspections(apiaryId);

    // Ensure inspections is always an array
    const inspectionsArray = Array.isArray(inspections) ? inspections : (inspections as any[]) || [];
    
    const filteredInspections = inspectionsArray.filter((inspection: any) => {
        const matchesSearch = inspection.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inspection.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inspection.hive?.hiveNumber?.toString().includes(searchTerm);
        const matchesType = filterType === 'all' || inspection.inspectionType === filterType;
        return matchesSearch && matchesType;
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-4" dir="rtl">
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
                <p className="font-bold">فشل في تحميل الفحوصات</p>
                <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <ClipboardCheck className="w-8 h-8 text-amber-500" />
                        الفحوصات
                    </h1>
                    <p className="text-gray-500 mt-1">تسجيل ومتابعة فحوصات الخلايا</p>
                </div>
                <button onClick={() => setShowAddModal(true)}
                    className="bg-amber-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-amber-700 transition font-bold">
                    <Plus className="w-5 h-5" />
                    فحص جديد
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="بحث في الفحوصات..."
                        className="w-full pr-10 pl-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select className="border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                        value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">جميع الأنواع</option>
                        {INSPECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredInspections.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {searchTerm || filterType !== 'all' ? 'لا توجد فحوصات تطابق بحثك' : 'لا توجد فحوصات مسجلة بعد'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredInspections.map((insp: any) => (
                            <div key={insp.id}>
                                <div className="p-4 hover:bg-gray-50 transition cursor-pointer flex justify-between items-center"
                                    onClick={() => setExpandedId(expandedId === insp.id ? null : insp.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                            <ClipboardCheck className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                خلية {insp.hive?.hiveNumber || insp.hiveId?.slice(0, 6)}
                                            </p>
                                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(insp.inspectionDate || insp.date || insp.createdAt).toLocaleDateString('ar-SA')}
                                                {insp.inspectionType && (
                                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {INSPECTION_TYPES.find(t => t.value === insp.inspectionType)?.label || insp.inspectionType}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {insp.overallAssessment && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${ASSESSMENT_COLORS[insp.overallAssessment] || 'bg-gray-100 text-gray-600'}`}>
                                                {ASSESSMENT_LABELS[insp.overallAssessment] || insp.overallAssessment}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {expandedId === insp.id && (
                                    <div className="px-6 pb-4 bg-gray-50/50 border-t border-gray-100">
                                        <div className="grid grid-cols-2 gap-3 pt-3 text-sm">
                                            <div><span className="text-gray-500">رؤية الملكة:</span> <span className="font-medium">{insp.queenSeen ? 'نعم' : 'لا'}</span></div>
                                            {insp.notes && <div className="col-span-2"><span className="text-gray-500">ملاحظات:</span> <span className="font-medium">{insp.notes}</span></div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAddModal && <AddInspectionModal apiaryId={apiaryId!} onClose={() => setShowAddModal(false)} />}
        </div>
    );
}
