import { useState, useEffect, useCallback, useMemo } from 'react';
import { recordInspection, InspectionData, FrameDetailData } from '@/services/hives';
import { getHiveFrames, Frame } from '@/services/frames';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ClipboardCheck, Loader2, Calendar, RotateCcw, AlertTriangle, X } from 'lucide-react';
import {
    InspectionModalProps,
    InspectionContextData,
    FrameDetailData as LocalFrameDetailData,
    OverallAssessment,
    QueenQuality,
    FrameCondition,
    ValidationError,
    FrameTotal,
} from '@/types/inspectionModal';
import { logger } from '@/utils/logger';

// ==================== Constants ====================

const DEFAULT_FORM_DATA = {
    overallAssessment: 'GOOD' as OverallAssessment,
    queenSeen: false,
    queenQuality: undefined as QueenQuality | undefined,
    broodFrames: 0,
    honeyFrames: 0,
    pollenFrames: 0,
    foundationAdded: 0,
    framesTransferred: [] as Array<{ from: string; to: string; count: number }>,
    diseases: [] as string[],
    foodStock: {
        honey: 0,
        pollen: 0,
    },
    notes: '',
};

// ==================== Utility Functions ====================

function formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function validateForm(
    inspectionDate: string,
    queenSeen: boolean,
    queenQuality: string | undefined,
    frameTotals: FrameTotal[]
): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate date is not in the future
    if (inspectionDate) {
        const selectedDate = new Date(inspectionDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (selectedDate > today) {
            errors.push({
                field: 'inspectionDate',
                message: 'لا يمكن تحديد تاريخ في المستقبل',
            });
        }
    }

    // Validate queen quality if queen was seen
    if (queenSeen && !queenQuality) {
        errors.push({
            field: 'queenQuality',
            message: 'يرجى تحديد جودة الملكة',
        });
    }

    // Validate frame percentages
    const invalidFrames = frameTotals.filter((f) => !f.isValid);
    if (invalidFrames.length > 0) {
        errors.push({
            field: 'framePercentages',
            message: `مجموع النسب في ${invalidFrames.length} إطار يتجاوز 100%`,
        });
    }

    return errors;
}

function calculateFrameTotals(
    frameDetails: Record<string, LocalFrameDetailData>
): FrameTotal[] {
    return Object.values(frameDetails).map((detail) => {
        const total =
            (detail.honeyPercentage || 0) +
            (detail.broodPercentage || 0) +
            (detail.pollenPercentage || 0);

        return {
            frameId: detail.frameId,
            position: detail.position,
            total,
            isValid: total <= 100,
        };
    });
}

function hasFormChanges(
    initialForm: typeof DEFAULT_FORM_DATA,
    currentForm: typeof DEFAULT_FORM_DATA,
    initialDate: string,
    currentDate: string
): boolean {
    return (
        JSON.stringify(initialForm) !== JSON.stringify(currentForm) ||
        initialDate !== currentDate
    );
}

// ==================== Components ====================

function FrameSkeleton() {
    return (
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-8 bg-gray-200 rounded-full" />
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="mb-3">
                    <div className="h-3 w-12 bg-gray-200 rounded mb-1" />
                    <div className="h-2 w-full bg-gray-200 rounded" />
                </div>
            ))}
            <div className="h-4 w-full bg-gray-200 rounded mt-2" />
        </div>
    );
}

function ConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
}: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="w-5 h-5" />
                        تغييرات غير محفوظة
                    </DialogTitle>
                    <DialogDescription>
                        لديك تغييرات لم يتم حفظها. هل أنت متأكد من إغلاق النافذة؟
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        إلغاء
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        نعم، إغلاق بدون حفظ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function LoadingOverlay({ message }: { message: string }) {
    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                <span className="text-sm text-gray-600">{message}</span>
            </div>
        </div>
    );
}

export function InspectionModal({
    hiveId,
    apiaryId,
    isOpen,
    onClose,
    onSuccess,
    contextData,
}: InspectionModalProps) {
    // State
    const [loading, setLoading] = useState(false);
    const [framesLoading, setFramesLoading] = useState(false);
    const [framesError, setFramesError] = useState<string | null>(null);
    const [frames, setFrames] = useState<Frame[]>([]);
    const [frameDetails, setFrameDetails] = useState<Record<string, LocalFrameDetailData>>({});
    const [inspectionDate, setInspectionDate] = useState(formatDateForInput(new Date()));
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [formData, setFormData] = useState<typeof DEFAULT_FORM_DATA>(DEFAULT_FORM_DATA);

    // Track initial values for dirty detection
    const initialFormData = useMemo(() => DEFAULT_FORM_DATA, []);
    const initialDate = useMemo(() => formatDateForInput(new Date()), []);

    // Calculate frame totals for validation
    const frameTotals = useMemo(
        () => calculateFrameTotals(frameDetails),
        [frameDetails]
    );

    // Validation errors
    const validationErrors = useMemo(
        () => validateForm(inspectionDate, formData.queenSeen, formData.queenQuality, frameTotals),
        [inspectionDate, formData.queenSeen, formData.queenQuality, frameTotals]
    );

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(DEFAULT_FORM_DATA);
            setInspectionDate(formatDateForInput(new Date()));
            setFrameDetails({});
            setFramesError(null);
            setIsDirty(false);
        }
    }, [isOpen]);

    // Track changes
    useEffect(() => {
        setIsDirty(hasFormChanges(initialFormData, formData, initialDate, inspectionDate));
    }, [formData, inspectionDate, initialFormData, initialDate]);

    // Fetch frames
    const fetchFrames = useCallback(async () => {
        if (!apiaryId || !hiveId) return;

        setFramesLoading(true);
        setFramesError(null);

        try {
            const data = await getHiveFrames(apiaryId, hiveId);
            const sorted = (data || []).sort((a, b) => a.position - b.position);
            setFrames(sorted);

            const details: Record<string, LocalFrameDetailData> = {};
            sorted.forEach((f: any) => {
                // Backend returns honeyPercentage, broodPercentage, pollenPercentage
                // Not sideAHoneyPercentage etc.
                const honeyPercentage = f.honeyPercentage ?? 0;
                const broodPercentage = f.broodPercentage ?? 0;
                const pollenPercentage = f.pollenPercentage ?? 0;
                
                details[f.id] = {
                    frameId: f.id,
                    position: f.position,
                    honeyPercentage,
                    broodPercentage,
                    pollenPercentage,
                    condition: (f.condition as FrameCondition) || 'GOOD',
                };
            });
            setFrameDetails(details);
        } catch (error) {
            logger.error('فشل تحميل الإطارات', { error, apiaryId, hiveId });
            setFramesError('فشل تحميل الإطارات. يرجى المحاولة مرة أخرى.');
            toast.error('فشل تحميل الإطارات');
        } finally {
            setFramesLoading(false);
        }
    }, [apiaryId, hiveId]);

    // Load frames when modal opens
    useEffect(() => {
        console.log('[InspectionModal] useEffect triggered', { isOpen, apiaryId, hiveId });
        if (isOpen && apiaryId && hiveId) {
            console.log('[InspectionModal] Calling fetchFrames...');
            fetchFrames();
        }
    }, [isOpen, apiaryId, hiveId, fetchFrames]);

    // Update frame
    const updateFrame = useCallback(
        (frameId: string, field: keyof LocalFrameDetailData, value: unknown) => {
            setFrameDetails((prev) => ({
                ...prev,
                [frameId]: { ...prev[frameId], [field]: value },
            }));
        },
        []
    );

    // Handle close with dirty check
    const handleClose = useCallback(() => {
        if (isDirty) {
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    }, [isDirty, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowConfirmClose(false);
        onClose();
    }, [onClose]);

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Show validation errors as toasts
        if (validationErrors.length > 0) {
            validationErrors.forEach((error) => {
                toast.error(error.message);
            });
            return;
        }

        const detailsArray = Object.values(frameDetails).map((d) => ({
            ...d,
            honeyPercentage: d.honeyPercentage || 0,
            broodPercentage: d.broodPercentage || 0,
            pollenPercentage: d.pollenPercentage || 0,
        }));

        setLoading(true);
        try {
            await recordInspection(apiaryId, hiveId, {
                ...formData as unknown as InspectionData,
                inspectionDate: new Date(inspectionDate),
                frameDetails: detailsArray,
            });
            toast.success('تم تسجيل الفحص بنجاح');
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            logger.error('فشل تسجيل الفحص', { error });
            toast.error(err.response?.data?.error || 'فشل تسجيل الفحص');
        } finally {
            setLoading(false);
        }
    };

    // Get validation status for a frame
    const getFrameValidationClass = (total: number) => {
        if (total > 100) return 'bg-red-100 text-red-700';
        if (total === 100) return 'bg-green-100 text-green-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent
                    className="max-w-4xl max-h-[90vh] overflow-y-auto"
                    aria-describedby="inspection-description"
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <ClipboardCheck className="w-6 h-6 text-amber-600" />
                            تسجيل فحص الخلية
                            {contextData?.hiveNumber && (
                                <span className="text-lg font-normal text-gray-500">
                                    - خلية {contextData.hiveNumber}
                                </span>
                            )}
                        </DialogTitle>
                        <DialogDescription id="inspection-description">
                            سجل جميع تفاصيل الفحص بدقة لتحديث حالة الخلية
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        aria-label="نموذج تسجيل فحص الخلية"
                    >
                        {/* Loading Overlay */}
                        {loading && <LoadingOverlay message="جاري حفظ الفحص..." />}

                        {/* Inspection Date & Overall Assessment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="inspectionDate"
                                    className="flex items-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    تاريخ الفحص
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="inspectionDate"
                                    type="date"
                                    value={inspectionDate}
                                    onChange={(e) => setInspectionDate(e.target.value)}
                                    required
                                    aria-describedby={
                                        validationErrors.find(
                                            (e) => e.field === 'inspectionDate'
                                        )
                                            ? 'inspectionDate-error'
                                            : undefined
                                    }
                                    max={formatDateForInput(new Date())}
                                    className="ltr:direction-ltr"
                                />
                                {validationErrors.find(
                                    (e) => e.field === 'inspectionDate'
                                ) && (
                                    <p
                                        id="inspectionDate-error"
                                        className="text-xs text-red-600"
                                        role="alert"
                                    >
                                        {validationErrors.find(
                                            (e) => e.field === 'inspectionDate'
                                        )?.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="overallAssessment">
                                    التقييم العام للخلية
                                </Label>
                                <Select
                                    value={formData.overallAssessment}
                                    onValueChange={(value: string) =>
                                        setFormData({
                                            ...formData,
                                            overallAssessment: value as OverallAssessment,
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id="overallAssessment"
                                        aria-label="اختر التقييم"
                                    >
                                        <SelectValue placeholder="اختر التقييم" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXCELLENT">ممتاز</SelectItem>
                                        <SelectItem value="GOOD">جيد</SelectItem>
                                        <SelectItem value="FAIR">متوسط</SelectItem>
                                        <SelectItem value="POOR">ضعيف</SelectItem>
                                        <SelectItem value="CRITICAL">حرج</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Queen Status */}
                        <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <h3 className="font-semibold text-purple-900">حالة الملكة</h3>

                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                    id="queenSeen"
                                    checked={formData.queenSeen}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            queenSeen: checked as boolean,
                                        })
                                    }
                                    aria-describedby="queenSeen-description"
                                />
                                <Label
                                    htmlFor="queenSeen"
                                    className="cursor-pointer"
                                    id="queenSeen-label"
                                >
                                    تم رؤية الملكة
                                </Label>
                            </div>
                            <p id="queenSeen-description" className="sr-only">
                                حدد ما إذا كانت الملكة قد شوهدت أثناء الفحص
                            </p>

                            {formData.queenSeen && (
                                <div className="space-y-2">
                                    <Label htmlFor="queenQuality">
                                        جودة الملكة
                                        <span className="text-red-500 mr-1">*</span>
                                    </Label>
                                    <Select
                                        value={formData.queenQuality}
                                        onValueChange={(value: string) =>
                                            setFormData({
                                                ...formData,
                                                queenQuality: value as QueenQuality,
                                            })
                                        }
                                    >
                                        <SelectTrigger
                                            id="queenQuality"
                                            aria-describedby={
                                                validationErrors.find(
                                                    (e) => e.field === 'queenQuality'
                                                )
                                                    ? 'queenQuality-error'
                                                    : undefined
                                            }
                                        >
                                            <SelectValue placeholder="اختر جودة الملكة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EXCELLENT">ممتازة</SelectItem>
                                            <SelectItem value="GOOD">جيدة</SelectItem>
                                            <SelectItem value="FAIR">متوسطة</SelectItem>
                                            <SelectItem value="POOR">ضعيفة</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {validationErrors.find(
                                        (e) => e.field === 'queenQuality'
                                    ) && (
                                        <p
                                            id="queenQuality-error"
                                            className="text-xs text-red-600"
                                            role="alert"
                                        >
                                            {validationErrors.find(
                                                (e) => e.field === 'queenQuality'
                                            )?.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Per-Frame Evaluation */}
                        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-blue-900">
                                        تقييم الإطارات
                                    </h3>
                                    <p className="text-sm text-blue-700">
                                        استخدم الشرائط لتحديد نسبة العسل والحضنة وحبوب
                                        اللقاح في كل إطار
                                    </p>
                                </div>
                                {framesError && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={fetchFrames}
                                        className="text-blue-600 border-blue-300"
                                        aria-label="إعادة تحميل الإطارات"
                                    >
                                        <RotateCcw className="w-4 h-4 ml-1" />
                                        إعادة المحاولة
                                    </Button>
                                )}
                            </div>

                            {framesLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <FrameSkeleton key={i} />
                                    ))}
                                </div>
                            ) : framesError ? (
                                <div
                                    className="flex flex-col items-center justify-center py-8 text-center"
                                    role="alert"
                                >
                                    <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                                    <p className="text-red-600 mb-2">{framesError}</p>
                                    <Button
                                        variant="outline"
                                        onClick={fetchFrames}
                                        className="mt-2"
                                    >
                                        <RotateCcw className="w-4 h-4 ml-1" />
                                        إعادة المحاولة
                                    </Button>
                                </div>
                            ) : frames.length === 0 ? (
                                <p className="text-gray-500 text-sm py-4 text-center">
                                    لا توجد إطارات مسجلة لهذه الخلية. يمكنك متابعة تسجيل
                                    الفحص بدون تقييم إطارات.
                                </p>
                            ) : (
                                <>
                                    {/* Validation warning */}
                                    {validationErrors.find(
                                        (e) => e.field === 'framePercentages'
                                    ) && (
                                        <div
                                            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                                            role="alert"
                                        >
                                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                            <p className="text-sm text-red-700">
                                                {validationErrors.find(
                                                    (e) => e.field === 'framePercentages'
                                                )?.message}
                                            </p>
                                        </div>
                                    )}

                                    <div
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        role="group"
                                        aria-label="إطارات الخلية"
                                    >
                                        {frames.map((frame) => {
                                            const detail = frameDetails[frame.id];
                                            if (!detail) return null;
                                            const total =
                                                (detail.honeyPercentage || 0) +
                                                (detail.broodPercentage || 0) +
                                                (detail.pollenPercentage || 0);

                                            return (
                                                <div
                                                    key={frame.id}
                                                    className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm"
                                                    role="group"
                                                    aria-label={`إطار ${frame.position}`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-bold text-gray-800">
                                                            إطار {frame.position}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getFrameValidationClass(
                                                                total
                                                            )}`}
                                                            aria-label={`المجموع: ${total}%`}
                                                        >
                                                            {total}%
                                                        </span>
                                                    </div>

                                                    {/* Honey Slider */}
                                                    <div className="mb-3" role="slider" aria-label="نسبة العسل">
                                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                            <span>🍯 عسل</span>
                                                            <span className="font-bold text-yellow-700">
                                                                {detail.honeyPercentage || 0}%
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={detail.honeyPercentage || 0}
                                                            onChange={(e) =>
                                                                updateFrame(
                                                                    frame.id,
                                                                    'honeyPercentage',
                                                                    parseInt(e.target.value)
                                                                )
                                                            }
                                                            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                            aria-valuenow={detail.honeyPercentage || 0}
                                                            aria-valuetext={`${detail.honeyPercentage || 0}% عسل`}
                                                        />
                                                    </div>

                                                    {/* Brood Slider */}
                                                    <div className="mb-3" role="slider" aria-label="نسبة الحضنة">
                                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                            <span>🐝 حضنة</span>
                                                            <span className="font-bold text-amber-800">
                                                                {detail.broodPercentage || 0}%
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={detail.broodPercentage || 0}
                                                            onChange={(e) =>
                                                                updateFrame(
                                                                    frame.id,
                                                                    'broodPercentage',
                                                                    parseInt(e.target.value)
                                                                )
                                                            }
                                                            className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                            aria-valuenow={detail.broodPercentage || 0}
                                                            aria-valuetext={`${detail.broodPercentage || 0}% حضنة`}
                                                        />
                                                    </div>

                                                    {/* Pollen Slider */}
                                                    <div className="mb-3" role="slider" aria-label="نسبة حبوب اللقاح">
                                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                            <span>🌼 لقاح</span>
                                                            <span className="font-bold text-orange-600">
                                                                {detail.pollenPercentage || 0}%
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={detail.pollenPercentage || 0}
                                                            onChange={(e) =>
                                                                updateFrame(
                                                                    frame.id,
                                                                    'pollenPercentage',
                                                                    parseInt(e.target.value)
                                                                )
                                                            }
                                                            className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                            aria-valuenow={detail.pollenPercentage || 0}
                                                            aria-valuetext={`${detail.pollenPercentage || 0}% لقاح`}
                                                        />
                                                    </div>

                                                    {/* Visual Bar */}
                                                    <div
                                                        className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex"
                                                        role="img"
                                                        aria-label="تمثيل بصري للنسب"
                                                    >
                                                        <div
                                                            className="h-full bg-yellow-400 transition-all"
                                                            style={{
                                                                width: `${detail.honeyPercentage || 0}%`,
                                                            }}
                                                            title={`عسل: ${detail.honeyPercentage || 0}%`}
                                                        />
                                                        <div
                                                            className="h-full bg-amber-800 transition-all"
                                                            style={{
                                                                width: `${detail.broodPercentage || 0}%`,
                                                            }}
                                                            title={`حضنة: ${detail.broodPercentage || 0}%`}
                                                        />
                                                        <div
                                                            className="h-full bg-orange-500 transition-all"
                                                            style={{
                                                                width: `${detail.pollenPercentage || 0}%`,
                                                            }}
                                                            title={`لقاح: ${detail.pollenPercentage || 0}%`}
                                                        />
                                                    </div>

                                                    {/* Condition */}
                                                    <div className="mt-2">
                                                        <label
                                                            htmlFor={`condition-${frame.id}`}
                                                            className="sr-only"
                                                        >
                                                            حالة الإطار
                                                        </label>
                                                        <select
                                                            id={`condition-${frame.id}`}
                                                            value={detail.condition || 'GOOD'}
                                                            onChange={(e) =>
                                                                updateFrame(
                                                                    frame.id,
                                                                    'condition',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        >
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

                        {/* Frame Counts Summary */}
                        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <h3 className="font-semibold text-green-900">
                                إحصائية الإطارات
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="broodFrames">عدد إطارات الحضنة</Label>
                                    <Input
                                        id="broodFrames"
                                        type="number"
                                        min="0"
                                        value={formData.broodFrames}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                broodFrames: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        aria-describedby="broodFrames-description"
                                    />
                                    <p id="broodFrames-description" className="sr-only">
                                        أدخل عدد إطارات الحضنة في الخلية
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="honeyFrames">عدد إطارات العسل</Label>
                                    <Input
                                        id="honeyFrames"
                                        type="number"
                                        min="0"
                                        value={formData.honeyFrames}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                honeyFrames: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        aria-describedby="honeyFrames-description"
                                    />
                                    <p id="honeyFrames-description" className="sr-only">
                                        أدخل عدد إطارات العسل في الخلية
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pollenFrames">
                                        عدد إطارات حبوب اللقاح
                                    </Label>
                                    <Input
                                        id="pollenFrames"
                                        type="number"
                                        min="0"
                                        value={formData.pollenFrames}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                pollenFrames: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        aria-describedby="pollenFrames-description"
                                    />
                                    <p id="pollenFrames-description" className="sr-only">
                                        أدخل عدد إطارات حبوب اللقاح في الخلية
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Foundation Added */}
                        <div className="space-y-2">
                            <Label htmlFor="foundationAdded">
                                عدد إطارات الشمع الأساس المضافة
                            </Label>
                            <Input
                                id="foundationAdded"
                                type="number"
                                min="0"
                                value={formData.foundationAdded}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        foundationAdded: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">ملاحظات</Label>
                            <Textarea
                                id="notes"
                                rows={4}
                                placeholder="أي ملاحظات إضافية عن الفحص..."
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                aria-describedby="notes-description"
                            />
                            <p id="notes-description" className="sr-only">
                                أدخل أي ملاحظات إضافية حول حالة الخلية
                            </p>
                        </div>

                        {/* Dirty indicator */}
                        {isDirty && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-700 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                يوجد تغييرات غير محفوظة
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                                aria-label="إلغاء并进行关闭"
                            >
                                <X className="w-4 h-4 ml-1" />
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                className="bg-amber-600 hover:bg-amber-700"
                                disabled={loading || framesLoading || validationErrors.length > 0}
                                aria-label="حفظ الفحص"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCheck className="w-4 h-4 ml-2" />
                                        حفظ الفحص
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirmClose}
                onConfirm={handleConfirmClose}
                onCancel={() => setShowConfirmClose(false)}
            />
        </>
    );
}