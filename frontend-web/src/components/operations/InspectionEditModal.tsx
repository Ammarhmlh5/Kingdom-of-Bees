import { useState, useEffect, useMemo } from 'react';
import { X, ClipboardCheck, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateOperation } from '@/hooks/api/useOperationsLog';
import { Operation } from '@/services/operationsLog';
import { getHiveFrames, Frame } from '@/services/frames';
import { logger } from '@/utils/logger';

type OverallAssessment = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
type QueenQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
type FrameCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';

interface FrameDetail {
    frameId: string;
    position: number;
    honeyPercentage: number;
    broodPercentage: number;
    pollenPercentage: number;
    condition: FrameCondition;
}

const ASSESSMENT_LABELS: Record<string, string> = {
    EXCELLENT: 'ممتاز', GOOD: 'جيد', FAIR: 'متوسط', POOR: 'ضعيف', CRITICAL: 'حرج'
};
const QUEEN_QUALITY_LABELS: Record<string, string> = {
    EXCELLENT: 'ممتازة', GOOD: 'جيدة', FAIR: 'متوسطة', POOR: 'ضعيفة'
};

function formatDate(d: Date | string): string {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toISOString().split('T')[0];
}

interface Props {
    operation: Operation;
    apiaryId: string;
    onClose: () => void;
}

export default function InspectionEditModal({ operation, apiaryId, onClose }: Props) {
    const updateOp = useUpdateOperation(apiaryId);
    const data = operation.data || {};

    const [frames, setFrames] = useState<Frame[]>([]);
    const [framesLoading, setFramesLoading] = useState(false);
    const [framesError, setFramesError] = useState<string | null>(null);
    const [frameDetails, setFrameDetails] = useState<Record<string, FrameDetail>>({});
    const [inspectionDate, setInspectionDate] = useState(
        data.inspectionDate ? formatDate(data.inspectionDate) : formatDate(operation.operationDate)
    );
    const [formData, setFormData] = useState({
        overallAssessment: (data.overallAssessment as OverallAssessment) || 'GOOD',
        queenSeen: data.queenSeen || false,
        queenQuality: (data.queenQuality as QueenQuality) || undefined as QueenQuality | undefined,
        broodFrames: data.broodFrames || 0,
        honeyFrames: data.honeyFrames || 0,
        pollenFrames: data.pollenFrames || 0,
        foundationAdded: data.foundationAdded || 0,
        notes: data.notes || '',
    });

    const frameTotals = useMemo(() =>
        Object.values(frameDetails).map(d => ({
            frameId: d.frameId,
            position: d.position,
            total: d.honeyPercentage + d.broodPercentage + d.pollenPercentage,
            isValid: d.honeyPercentage + d.broodPercentage + d.pollenPercentage <= 100,
        })),
        [frameDetails]
    );

    const hiveId = operation.hiveId || '';

    useEffect(() => {
        if (!apiaryId || !hiveId) return;
        setFramesLoading(true);
        setFramesError(null);
        getHiveFrames(apiaryId, hiveId)
            .then((result) => {
                const sorted = (result || []).sort((a: any, b: any) => a.position - b.position);
                setFrames(sorted);
                const details: Record<string, FrameDetail> = {};
                sorted.forEach((f: any) => {
                    details[f.id] = {
                        frameId: f.id,
                        position: f.position,
                        honeyPercentage: f.honeyPercentage ?? 0,
                        broodPercentage: f.broodPercentage ?? 0,
                        pollenPercentage: f.pollenPercentage ?? 0,
                        condition: f.condition || 'GOOD',
                    };
                });
                setFrameDetails(details);
            })
            .catch((error) => {
                logger.error('فشل تحميل الإطارات', { error, apiaryId, hiveId });
                setFramesError('فشل تحميل الإطارات');
                toast.error('فشل تحميل الإطارات');
            })
            .finally(() => setFramesLoading(false));
    }, [apiaryId, hiveId]);

    const updateFrame = (frameId: string, field: keyof FrameDetail, value: number | string) => {
        setFrameDetails(prev => ({
            ...prev,
            [frameId]: { ...prev[frameId], [field]: value },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const invalidFrames = frameTotals.filter(f => !f.isValid);
        if (invalidFrames.length > 0) {
            toast.error('مجموع النسب في بعض الإطارات يتجاوز 100%');
            return;
        }
        const detailsArray = Object.values(frameDetails).map(d => ({
            ...d,
            honeyPercentage: d.honeyPercentage || 0,
            broodPercentage: d.broodPercentage || 0,
            pollenPercentage: d.pollenPercentage || 0,
        }));

        try {
            await updateOp.mutateAsync({
                operationId: operation.id,
                data: {
                    description: `فحص الخلية ${operation.hive?.hiveNumber || ''}`,
                    operationDate: inspectionDate,
                    data: {
                        ...data,
                        overallAssessment: formData.overallAssessment,
                        queenSeen: formData.queenSeen,
                        queenQuality: formData.queenQuality,
                        broodFrames: formData.broodFrames,
                        honeyFrames: formData.honeyFrames,
                        pollenFrames: formData.pollenFrames,
                        foundationAdded: formData.foundationAdded,
                        notes: formData.notes,
                        frameDetails: detailsArray,
                    },
                },
            });
            toast.success('تم تعديل الفحص بنجاح');
            onClose();
        } catch {
            toast.error('فشل في تعديل الفحص');
        }
    };

    const getFrameValidationClass = (total: number) => {
        if (total > 100) return 'bg-red-100 text-red-700';
        if (total === 100) return 'bg-green-100 text-green-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-blue-100">
                            <ClipboardCheck className="w-5 h-5 text-blue-700" />
                        </span>
                        <div>
                            <h2 className="text-lg font-bold">تعديل الفحص #{operation.operationNumber}</h2>
                            {operation.hive && (
                                <p className="text-sm text-gray-500">خلية {operation.hive.hiveNumber}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Date & Assessment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">تاريخ الفحص *</label>
                            <input type="date" value={inspectionDate}
                                onChange={e => setInspectionDate(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">التقييم العام</label>
                            <select value={formData.overallAssessment}
                                onChange={e => setFormData(f => ({ ...f, overallAssessment: e.target.value as OverallAssessment }))}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                                {Object.entries(ASSESSMENT_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Queen Status */}
                    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-900">حالة الملكة</h3>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.queenSeen}
                                onChange={e => setFormData(f => ({ ...f, queenSeen: e.target.checked }))}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm font-medium">تم رؤية الملكة</span>
                        </label>
                        {formData.queenSeen && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">جودة الملكة</label>
                                <select value={formData.queenQuality || ''}
                                    onChange={e => setFormData(f => ({ ...f, queenQuality: e.target.value as QueenQuality || undefined }))}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                                    <option value="">اختر الجودة</option>
                                    {Object.entries(QUEEN_QUALITY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Per-Frame Evaluation */}
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900">تقييم الإطارات</h3>
                        <p className="text-sm text-blue-700">استخدم الشرائط لتحديد نسبة العسل والحضنة وحبوب اللقاح في كل إطار</p>

                        {framesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <span className="mr-2 text-gray-600">جاري تحميل الإطارات...</span>
                            </div>
                        ) : framesError ? (
                            <div className="flex flex-col items-center py-8 text-red-600">
                                <AlertTriangle className="w-8 h-8 mb-2" />
                                <p className="mb-2">{framesError}</p>
                            </div>
                        ) : frames.length === 0 ? (
                            <p className="text-gray-500 text-sm py-4 text-center">
                                لا توجد إطارات مسجلة لهذه الخلية. يمكنك متابعة التعديل بدون تقييم إطارات.
                            </p>
                        ) : (
                            <>
                                {frameTotals.some(f => !f.isValid) && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <p className="text-sm text-red-700">مجموع النسب في بعض الإطارات يتجاوز 100%</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {frames.map(frame => {
                                        const detail = frameDetails[frame.id];
                                        if (!detail) return null;
                                        const total = detail.honeyPercentage + detail.broodPercentage + detail.pollenPercentage;
                                        return (
                                            <div key={frame.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-bold text-gray-800">إطار {frame.position}</span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getFrameValidationClass(total)}`}>
                                                        {total}%
                                                    </span>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>🍯 عسل</span>
                                                        <span className="font-bold text-yellow-700">{detail.honeyPercentage}%</span>
                                                    </div>
                                                    <input type="range" min="0" max="100"
                                                        value={detail.honeyPercentage}
                                                        onChange={e => updateFrame(frame.id, 'honeyPercentage', parseInt(e.target.value))}
                                                        className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                                                </div>
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>🐝 حضنة</span>
                                                        <span className="font-bold text-amber-800">{detail.broodPercentage}%</span>
                                                    </div>
                                                    <input type="range" min="0" max="100"
                                                        value={detail.broodPercentage}
                                                        onChange={e => updateFrame(frame.id, 'broodPercentage', parseInt(e.target.value))}
                                                        className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-700" />
                                                </div>
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>🌼 لقاح</span>
                                                        <span className="font-bold text-orange-600">{detail.pollenPercentage}%</span>
                                                    </div>
                                                    <input type="range" min="0" max="100"
                                                        value={detail.pollenPercentage}
                                                        onChange={e => updateFrame(frame.id, 'pollenPercentage', parseInt(e.target.value))}
                                                        className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                                                </div>
                                                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-yellow-400 transition-all" style={{ width: `${detail.honeyPercentage}%` }} />
                                                    <div className="h-full bg-amber-800 transition-all" style={{ width: `${detail.broodPercentage}%` }} />
                                                    <div className="h-full bg-orange-500 transition-all" style={{ width: `${detail.pollenPercentage}%` }} />
                                                </div>
                                                <div className="mt-2">
                                                    <select value={detail.condition}
                                                        onChange={e => updateFrame(frame.id, 'condition', e.target.value)}
                                                        className="w-full text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                                                        <option value="EXCELLENT">ممتاز</option>
                                                        <option value="GOOD">جيد</option>
                                                        <option value="FAIR">متوسط</option>
                                                        <option value="POOR">ضعيف</option>
                                                        <option value="DAMAGED">تالف</option>
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Frame Counts */}
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-900">إحصائية الإطارات</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عدد إطارات الحضنة</label>
                                <input type="number" min="0" value={formData.broodFrames}
                                    onChange={e => setFormData(f => ({ ...f, broodFrames: parseInt(e.target.value) || 0 }))}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عدد إطارات العسل</label>
                                <input type="number" min="0" value={formData.honeyFrames}
                                    onChange={e => setFormData(f => ({ ...f, honeyFrames: parseInt(e.target.value) || 0 }))}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عدد إطارات اللقاح</label>
                                <input type="number" min="0" value={formData.pollenFrames}
                                    onChange={e => setFormData(f => ({ ...f, pollenFrames: parseInt(e.target.value) || 0 }))}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Foundation Added */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عدد إطارات الشمع الأساس المضافة</label>
                        <input type="number" min="0" value={formData.foundationAdded}
                            onChange={e => setFormData(f => ({ ...f, foundationAdded: parseInt(e.target.value) || 0 }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                        <textarea value={formData.notes} rows={4}
                            onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                            placeholder="أي ملاحظات إضافية عن الفحص..." />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={updateOp.isPending}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
                            {updateOp.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
