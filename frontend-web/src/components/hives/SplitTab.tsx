import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSplitCandidates, executeSplit, SplitCandidate, ExecuteSplitData } from '@/services/hives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
    GitFork,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Loader2,
    ArrowRight
} from 'lucide-react';

export function SplitTab() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const [candidates, setCandidates] = useState<SplitCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedHive, setSelectedHive] = useState<SplitCandidate | null>(null);
    const [step, setStep] = useState(1);
    const [splitData, setSplitData] = useState<Partial<ExecuteSplitData>>({
        newHiveNumber: '',
        framesTransferred: [],
        queenLocation: 'SOURCE',
        notes: ''
    });
    const [saving, setSaving] = useState(false);

    const fetchCandidates = async () => {
        if (!apiaryId) return;

        setLoading(true);
        try {
            const data = await getSplitCandidates(apiaryId);
            setCandidates(data);
        } catch (error) {
            console.error('Failed to load split candidates:', error);
            toast.error('فشل تحميل المرشحين للتقسيم');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [apiaryId]);

    const handleSelectHive = (candidate: SplitCandidate) => {
        setSelectedHive(candidate);
        setStep(2);
    };

    const handleExecuteSplit = async () => {
        if (!selectedHive || !apiaryId || !splitData.newHiveNumber) {
            toast.error('يرجى إكمال جميع الحقول المطلوبة');
            return;
        }

        setSaving(true);
        try {
            await executeSplit(apiaryId, selectedHive.hiveId, splitData as ExecuteSplitData);
            toast.success('تم تقسيم الخلية بنجاح');
            setSelectedHive(null);
            setStep(1);
            setSplitData({
                newHiveNumber: '',
                framesTransferred: [],
                queenLocation: 'SOURCE',
                notes: ''
            });
            fetchCandidates();
        } catch (error: any) {
            console.error('Failed to execute split:', error);
            toast.error(error.response?.data?.error || 'فشل تقسيم الخلية');
        } finally {
            setSaving(false);
        }
    };

    const getReadinessColor = (level: string) => {
        switch (level) {
            case 'READY': return 'bg-green-500';
            case 'SOON': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getReadinessLabel = (level: string) => {
        switch (level) {
            case 'READY': return 'جاهزة الآن';
            case 'SOON': return 'قريباً';
            default: return 'غير جاهزة';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري تحليل الخلايا...</p>
                </div>
            </div>
        );
    }

    // Step 1: Select Candidate
    if (step === 1) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-600 p-3 rounded-lg">
                            <GitFork className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                تقسيم الخلايا
                            </h2>
                            <p className="text-gray-600">
                                اختر خلية قوية لتقسيمها وإنشاء خلية جديدة. النظام يحلل القوة والجاهزية تلقائياً.
                            </p>
                        </div>
                        <div className="text-left">
                            <div className="text-3xl font-bold text-blue-600">{candidates.length}</div>
                            <div className="text-sm text-gray-500">مرشح</div>
                        </div>
                    </div>
                </div>

                {/* Candidates List */}
                {candidates.length === 0 ? (
                    <Card className="border-2 border-dashed">
                        <CardContent className="py-12 text-center">
                            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                لا توجد خلايا جاهزة للتقسيم
                            </h3>
                            <p className="text-gray-500">
                                لا توجد خلايا قوية بما يكفي للتقسيم في الوقت الحالي
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidates.map((candidate) => (
                            <Card
                                key={candidate.hiveId}
                                className="hover:shadow-lg transition-all duration-200 border-l-4"
                                style={{ borderLeftColor: candidate.readinessLevel === 'READY' ? '#22c55e' : '#eab308' }}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <CardTitle className="text-xl font-bold">
                                            خلية #{candidate.hiveNumber}
                                        </CardTitle>
                                        <Badge className={`${getReadinessColor(candidate.readinessLevel)} text-white`}>
                                            {getReadinessLabel(candidate.readinessLevel)}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">قوة الخلية</span>
                                            <span className="font-bold text-blue-600">{candidate.strengthScore}/100</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${candidate.strengthScore}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>إطارات متوقعة: {candidate.estimatedFrames}</span>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-900">
                                            {candidate.recommendation}
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => handleSelectHive(candidate)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                        disabled={candidate.readinessLevel === 'NOT_READY'}
                                    >
                                        <GitFork className="w-4 h-4" />
                                        تقسيم هذه الخلية
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Step 2: Split Configuration
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-600 p-3 rounded-lg">
                        <GitFork className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            تقسيم خلية #{selectedHive?.hiveNumber}
                        </h2>
                        <p className="text-gray-600">
                            أدخل تفاصيل التقسيم والخلية الجديدة
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-6">
                    {/* New Hive Number */}
                    <div className="space-y-2">
                        <Label htmlFor="newHiveNumber">رقم الخلية الجديدة *</Label>
                        <Input
                            id="newHiveNumber"
                            placeholder="مثال: H015"
                            value={splitData.newHiveNumber}
                            onChange={(e) => setSplitData({ ...splitData, newHiveNumber: e.target.value })}
                        />
                    </div>

                    {/* Queen Location */}
                    <div className="space-y-2">
                        <Label htmlFor="queenLocation">موقع الملكة *</Label>
                        <Select
                            value={splitData.queenLocation}
                            onValueChange={(value: any) => setSplitData({ ...splitData, queenLocation: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SOURCE">الخلية الأم (الأصلية)</SelectItem>
                                <SelectItem value="RESULT">الخلية الجديدة</SelectItem>
                                <SelectItem value="BOTH_NEW">ملكات جديدة للاثنتين</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            اختر أين ستبقى الملكة الأصلية أو إذا كنت ستضيف ملكات جديدة
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظات</Label>
                        <Textarea
                            id="notes"
                            rows={4}
                            placeholder="أي ملاحظات إضافية عن التقسيم..."
                            value={splitData.notes}
                            onChange={(e) => setSplitData({ ...splitData, notes: e.target.value })}
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">تذكير:</p>
                            <p>سيتم تسجيل عملية التقسيم تلقائياً في سجل العمليات اليومية. تأكد من نقل الإطارات المناسبة (حضنة، عسل، حبوب لقاح) للخلية الجديدة.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setStep(1);
                                setSelectedHive(null);
                            }}
                            className="flex-1"
                        >
                            رجوع
                        </Button>
                        <Button
                            onClick={handleExecuteSplit}
                            disabled={!splitData.newHiveNumber || saving}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري التقسيم...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                    تأكيد التقسيم
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
