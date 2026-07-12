import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    getSuperCandidates,
    addSuper,
    SuperCandidate,
    SeasonalContext,
    AddSuperData
} from '@/services/hives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
    ArrowUp,
    Layers,
    Calendar,
    TrendingUp,
    CheckCircle,
    Loader2,
    Sparkles,
    AlertCircle,
    ChevronsUp
} from 'lucide-react';

const readinessConfig: Record<string, { color: string; label: string; icon: any; border: string }> = {
    ADD_SECOND_STORY: {
        color: 'bg-green-500',
        label: 'جاهزة لرفع دور ثاني',
        icon: ArrowUp,
        border: 'border-l-green-500'
    },
    ADD_THIRD_STORY: {
        color: 'bg-blue-600',
        label: 'جاهزة لرفع دور ثالث',
        icon: ChevronsUp,
        border: 'border-l-blue-600'
    },
    ADD_EXCLUDER: {
        color: 'bg-emerald-500',
        label: 'جاهزة لحاجز ملكات',
        icon: Layers,
        border: 'border-l-emerald-500'
    },
    MONITOR: {
        color: 'bg-yellow-500',
        label: 'مراقبة',
        icon: AlertCircle,
        border: 'border-l-yellow-500'
    }
};

export function SuperTab() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const [candidates, setCandidates] = useState<SuperCandidate[]>([]);
    const [seasonalContext, setSeasonalContext] = useState<SeasonalContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedHive, setSelectedHive] = useState<SuperCandidate | null>(null);
    const [superData, setSuperData] = useState<AddSuperData>({
        operationType: 'ADD_SECOND_STORY',
        targetStory: 2,
        framesInSuper: 10,
        hasExcluder: false,
        framesMovedUp: [],
        expectedYield: 0,
        notes: ''
    });
    const [saving, setSaving] = useState(false);

    const fetchCandidates = async () => {
        if (!apiaryId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await getSuperCandidates(apiaryId);
            setCandidates(data.candidates);
            setSeasonalContext(data.seasonalContext);
        } catch (error) {
            console.error('Failed to load super candidates:', error);
            toast.error('فشل تحميل المرشحين لرفع الأدوار');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [apiaryId]);

    const handleSelectHive = (candidate: SuperCandidate) => {
        setSelectedHive(candidate);
        const isAddingStory = candidate.readiness === 'ADD_SECOND_STORY' || candidate.readiness === 'ADD_THIRD_STORY';
        setSuperData({
            operationType: candidate.readiness as any,
            targetStory: candidate.targetStory,
            framesInSuper: 10,
            hasExcluder: false,
            framesMovedUp: candidate.frameSuggestions?.framesToMoveUp || [],
            expectedYield: 0,
            notes: ''
        });
    };

    const handleAddSuper = async () => {
        if (!selectedHive || !apiaryId) {
            toast.error('يرجى اختيار خلية');
            return;
        }

        setSaving(true);
        try {
            await addSuper(apiaryId, selectedHive.hiveId, superData);
            const typeLabel = superData.operationType === 'ADD_SECOND_STORY' ? 'دور ثاني'
                : superData.operationType === 'ADD_THIRD_STORY' ? 'دور ثالث'
                : 'حاجز ملكات';
            toast.success(`تم رفع ${typeLabel} بنجاح`);
            setSelectedHive(null);
            setSuperData({
                operationType: 'ADD_SECOND_STORY',
                targetStory: 2,
                framesInSuper: 10,
                hasExcluder: false,
                framesMovedUp: [],
                expectedYield: 0,
                notes: ''
            });
            fetchCandidates();
        } catch (error: any) {
            console.error('Failed to add super:', error);
            toast.error(error.response?.data?.error || 'فشلت العملية');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري تحليل الخلايا...</p>
                </div>
            </div>
        );
    }

    // Form view
    if (selectedHive) {
        const isAddingStory = superData.operationType === 'ADD_SECOND_STORY' || superData.operationType === 'ADD_THIRD_STORY';
        const isSecondStory = superData.operationType === 'ADD_SECOND_STORY';
        const config = readinessConfig[selectedHive.readiness] || readinessConfig.MONITOR;

        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-green-600 p-3 rounded-lg">
                            <ArrowUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {isSecondStory ? `رفع دور ثاني لخلية #${selectedHive.hiveNumber}`
                                    : superData.operationType === 'ADD_THIRD_STORY' ? `رفع دور ثالث لخلية #${selectedHive.hiveNumber}`
                                    : `إضافة حاجز ملكات لخلية #${selectedHive.hiveNumber}`}
                            </h2>
                            <p className="text-gray-600">
                                {isAddingStory ? `إضافة طابق جديد (دور ${isSecondStory ? 'ثاني' : 'ثالث'}) للخلية`
                                    : 'تركيب حاجز لمنع الملكة من الصعود للطابق العلوي'}
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-6">
                        {/* Hive Info */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-green-900">الخلية المختارة</span>
                                <Badge className={`${config.color} text-white`}>
                                    {config.label}
                                </Badge>
                            </div>
                            <p className="text-lg font-bold text-green-700">خلية #{selectedHive.hiveNumber}</p>
                            <div className="text-sm text-green-600 mt-2 space-y-1">
                                <p>الطوابق الحالية: {selectedHive.currentStories}</p>
                                {isAddingStory && (
                                    <p className="font-semibold text-green-800">
                                        ← سترتفع إلى: {selectedHive.currentStories + 1} طوابق
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Operation Type */}
                        <div className="space-y-2">
                            <Label>نوع العملية</Label>
                            <div className="p-3 bg-gray-50 rounded-lg border text-sm font-medium text-gray-700">
                                {isAddingStory
                                    ? `رفع دور ${isSecondStory ? 'ثاني' : 'ثالث'} (طابق ${isSecondStory ? '2' : '3'})`
                                    : 'إضافة حاجز ملكات'}
                            </div>
                        </div>

                        {isAddingStory && (
                            <>
                                {/* Frames Count */}
                                <div className="space-y-2">
                                    <Label htmlFor="framesInSuper">عدد الإطارات في الطابق الجديد *</Label>
                                    <Input
                                        id="framesInSuper"
                                        type="number"
                                        min="8"
                                        max="12"
                                        value={superData.framesInSuper}
                                        onChange={(e) => setSuperData({ ...superData, framesInSuper: parseInt(e.target.value) || 10 })}
                                    />
                                    <p className="text-xs text-gray-500">
                                        عادة 10 إطارات للصناديق القياسية
                                    </p>
                                </div>

                                {/* Expected Yield */}
                                <div className="space-y-2">
                                    <Label htmlFor="expectedYield">الإنتاج المتوقع (كجم)</Label>
                                    <Input
                                        id="expectedYield"
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={superData.expectedYield}
                                        onChange={(e) => setSuperData({ ...superData, expectedYield: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </>
                        )}

                        {/* Excluder Switch */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-blue-600" />
                                <div>
                                    <Label htmlFor="hasExcluder" className="cursor-pointer font-semibold">
                                        استخدام حاجز ملكات
                                    </Label>
                                    <p className="text-xs text-gray-600">
                                        {isAddingStory
                                            ? 'يمنع الملكة من وضع البيض في الطابق الجديد'
                                            : 'يفصل الملكة عن الطوابق العلوية'}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="hasExcluder"
                                checked={superData.hasExcluder}
                                onCheckedChange={(checked) => setSuperData({ ...superData, hasExcluder: checked })}
                            />
                        </div>

                        {/* Frame Suggestions */}
                        {selectedHive.frameSuggestions && selectedHive.frameSuggestions.framesToMoveUp.length > 0 && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    <span className="font-semibold text-purple-900">توصيات الإطارات</span>
                                </div>
                                <p className="text-sm text-purple-800 mb-2">
                                    {isSecondStory
                                        ? 'يُنصح برفع إطارات حاضنة من الطابق الأول للطابق الجديد لجذب النحل:'
                                        : 'يُنصح برفع إطارات عسل من الطابق الثاني للطابق الجديد:'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedHive.frameSuggestions.framesToMoveUp.map((frameId, index) => (
                                        <Badge key={frameId} variant="outline" className="bg-white">
                                            إطار #{index + 1}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendation */}
                        <div className={`rounded-lg p-4 ${isSecondStory ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                            <p className="text-sm">
                                <strong>توصية:</strong> {selectedHive.recommendation}
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">ملاحظات</Label>
                            <Textarea
                                id="notes"
                                rows={4}
                                placeholder={isAddingStory ? 'أي ملاحظات إضافية عن رفع الدور...' : 'أي ملاحظات إضافية عن الحاجز...'}
                                value={superData.notes}
                                onChange={(e) => setSuperData({ ...superData, notes: e.target.value })}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedHive(null)}
                                className="flex-1"
                            >
                                رجوع
                            </Button>
                            <Button
                                onClick={handleAddSuper}
                                disabled={saving}
                                className={`flex-1 ${isAddingStory ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                        جاري التنفيذ...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        {isAddingStory ? 'تأكيد الرفع' : 'تأكيد الإضافة'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Main view
    return (
        <div className="space-y-6">
            {seasonalContext && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-amber-600 p-3 rounded-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                السياق الموسمي
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <p className="text-sm text-gray-600">الموسم الحالي</p>
                                    <p className="text-lg font-bold text-amber-700">{seasonalContext.season}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">المواسم القادمة</p>
                                    <p className="text-lg font-bold text-amber-700">
                                        {seasonalContext.flows?.join(', ') || 'لا توجد'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">أيام حتى الذروة</p>
                                    <p className="text-lg font-bold text-amber-700">{seasonalContext.daysUntilPeak} يوم</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-green-600 p-3 rounded-lg">
                        <ArrowUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            رفع أدوار وعاسلات
                        </h2>
                        <p className="text-gray-600">
                            الخلايا الجاهزة لرفع دور ثاني أو ثالث
                        </p>
                    </div>
                    <div className="text-left">
                        <div className="text-3xl font-bold text-green-600">{candidates.length}</div>
                        <div className="text-sm text-gray-500">خلية جاهزة</div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> دور ثاني
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> دور ثالث
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> حاجز ملكات
                </span>
            </div>

            {candidates.length === 0 ? (
                <Card className="border-2 border-dashed">
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            لا توجد خلايا جاهزة
                        </h3>
                        <p className="text-gray-500">
                            لا توجد خلايا قوية بما يكفي لرفع دور ثاني أو ثالث في الوقت الحالي
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate) => {
                        const config = readinessConfig[candidate.readiness] || readinessConfig.MONITOR;
                        const isAddingStory = candidate.readiness === 'ADD_SECOND_STORY' || candidate.readiness === 'ADD_THIRD_STORY';
                        return (
                            <Card
                                key={candidate.hiveId}
                                className={`hover:shadow-lg transition-all duration-200 border-l-4 ${config.border}`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <CardTitle className="text-xl font-bold">
                                            خلية #{candidate.hiveNumber}
                                        </CardTitle>
                                        <Badge className={`${config.color} text-white`}>
                                            <config.icon className="w-3 h-3 ml-1 inline" />
                                            {config.label}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Layers className="w-4 h-4" />
                                        <span>الطوابق الحالية: {candidate.currentStories}</span>
                                        {isAddingStory && (
                                            <span className="text-green-600 font-semibold">
                                                ← {candidate.currentStories + 1}
                                            </span>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 border rounded-lg p-3">
                                        <p className="text-sm text-gray-900">
                                            {candidate.recommendation}
                                        </p>
                                    </div>

                                    {candidate.frameSuggestions && candidate.frameSuggestions.framesToMoveUp.length > 0 && (
                                        <div className="text-sm text-gray-600">
                                            <TrendingUp className="w-4 h-4 inline ml-1" />
                                            {candidate.frameSuggestions.framesToMoveUp.length} إطار مقترح للرفع
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => handleSelectHive(candidate)}
                                        className={`w-full gap-2 ${
                                            candidate.readiness === 'ADD_SECOND_STORY' ? 'bg-green-600 hover:bg-green-700'
                                            : candidate.readiness === 'ADD_THIRD_STORY' ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-emerald-600 hover:bg-emerald-700'
                                        }`}
                                    >
                                        {candidate.readiness === 'ADD_SECOND_STORY' ? (
                                            <><ArrowUp className="w-4 h-4" /> رفع دور ثاني</>
                                        ) : candidate.readiness === 'ADD_THIRD_STORY' ? (
                                            <><ChevronsUp className="w-4 h-4" /> رفع دور ثالث</>
                                        ) : (
                                            <><Layers className="w-4 h-4" /> إضافة حاجز</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
