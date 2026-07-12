import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    getMergeCandidates,
    executeMerge,
    MergeCandidate,
    MergeSuggestion,
    ExecuteMergeData
} from '@/services/hives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
    Combine,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Shield,
    Leaf,
    Snowflake
} from 'lucide-react';

export function MergeTab() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const [season, setSeason] = useState<'SPRING' | 'AUTUMN'>('AUTUMN');
    const [weakHives, setWeakHives] = useState<MergeCandidate[]>([]);
    const [suggestions, setSuggestions] = useState<MergeSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedHive, setSelectedHive] = useState<MergeCandidate | null>(null);
    const [mergeData, setMergeData] = useState<Partial<ExecuteMergeData>>({
        targetHiveId: '',
        mergeMethod: 'NEWSPAPER',
        queenKept: 'TARGET',
        safetyProtocol: [],
        notes: ''
    });
    const [saving, setSaving] = useState(false);

    const fetchCandidates = async () => {
        if (!apiaryId) return;

        setLoading(true);
        try {
            const data = await getMergeCandidates(apiaryId, season);
            setWeakHives(data.weakHives);
            setSuggestions(data.suggestedMerges);
        } catch (error) {
            console.error('Failed to load merge candidates:', error);
            toast.error('فشل تحميل المرشحين للدمج');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [apiaryId, season]);

    const handleSelectHive = (candidate: MergeCandidate) => {
        setSelectedHive(candidate);

        // Find suggestion for this hive
        const suggestion = suggestions.find(s => s.weakHive === candidate.hiveId);
        if (suggestion) {
            setMergeData({
                ...mergeData,
                targetHiveId: suggestion.targetHive,
                queenKept: suggestion.queenToKeep as any,
                safetyProtocol: suggestion.safetyProtocol
            });
        }
    };

    const handleExecuteMerge = async () => {
        if (!selectedHive || !apiaryId || !mergeData.targetHiveId) {
            toast.error('يرجى اختيار الخلية الهدف');
            return;
        }

        setSaving(true);
        try {
            await executeMerge(apiaryId, selectedHive.hiveId, mergeData as ExecuteMergeData);
            toast.success('تم دمج الخلايا بنجاح');
            setSelectedHive(null);
            setMergeData({
                targetHiveId: '',
                mergeMethod: 'NEWSPAPER',
                queenKept: 'TARGET',
                safetyProtocol: [],
                notes: ''
            });
            fetchCandidates();
        } catch (error: any) {
            console.error('Failed to execute merge:', error);
            toast.error(error.response?.data?.error || 'فشل دمج الخلايا');
        } finally {
            setSaving(false);
        }
    };

    const getRiskColor = (level: number) => {
        if (level >= 80) return 'bg-red-500';
        if (level >= 50) return 'bg-orange-500';
        return 'bg-yellow-500';
    };

    const getRiskLabel = (level: number) => {
        if (level >= 80) return 'خطر عالي جداً';
        if (level >= 50) return 'خطر عالي';
        return 'خطر متوسط';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري تحليل الخلايا...</p>
                </div>
            </div>
        );
    }

    // If hive selected, show merge form
    if (selectedHive) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-600 p-3 rounded-lg">
                            <Combine className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                دمج خلية #{selectedHive.hiveNumber}
                            </h2>
                            <p className="text-gray-600">
                                اختر الخلية الهدف وطريقة الدمج الآمنة
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-6">
                        {/* Weak Hive Info */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-red-900">الخلية الضعيفة</span>
                                <Badge className="bg-red-500 text-white">
                                    {getRiskLabel(selectedHive.riskLevel)}
                                </Badge>
                            </div>
                            <p className="text-lg font-bold text-red-700">خلية #{selectedHive.hiveNumber}</p>
                            <p className="text-sm text-red-600 mt-1">
                                فرصة البقاء: {selectedHive.survivalChance}%
                            </p>
                        </div>

                        {/* Target Hive Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="targetHive">الخلية الهدف (القوية) *</Label>
                            <Select
                                value={mergeData.targetHiveId}
                                onValueChange={(value: string) => setMergeData({ ...mergeData, targetHiveId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر خلية قوية..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {suggestions
                                        .filter(s => s.weakHive === selectedHive.hiveId)
                                        .map(s => (
                                            <SelectItem key={s.targetHive} value={s.targetHive}>
                                                خلية مقترحة (موصى بها)
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Merge Method */}
                        <div className="space-y-2">
                            <Label htmlFor="mergeMethod">طريقة الدمج *</Label>
                            <Select
                                value={mergeData.mergeMethod}
                                onValueChange={(value: any) => setMergeData({ ...mergeData, mergeMethod: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NEWSPAPER">ورق الجرائد (موصى بها)</SelectItem>
                                    <SelectItem value="DIRECT">مباشر (خطر)</SelectItem>
                                    <SelectItem value="GRADUAL">تدريجي (آمن)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                طريقة ورق الجرائد هي الأكثر أماناً لتجنب القتال بين النحل
                            </p>
                        </div>

                        {/* Queen Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="queenKept">الملكة المحتفظ بها *</Label>
                            <Select
                                value={mergeData.queenKept}
                                onValueChange={(value: any) => setMergeData({ ...mergeData, queenKept: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TARGET">ملكة الخلية الهدف (موصى بها)</SelectItem>
                                    <SelectItem value="WEAK">ملكة الخلية الضعيفة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Safety Protocol */}
                        {mergeData.safetyProtocol && mergeData.safetyProtocol.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold text-blue-900">بروتوكول الأمان</span>
                                </div>
                                <ul className="space-y-2">
                                    {mergeData.safetyProtocol.map((step, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">ملاحظات</Label>
                            <Textarea
                                id="notes"
                                rows={4}
                                placeholder="أي ملاحظات إضافية عن الدمج..."
                                value={mergeData.notes}
                                onChange={(e) => setMergeData({ ...mergeData, notes: e.target.value })}
                            />
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-semibold mb-1">تحذير:</p>
                                <p>سيتم حذف الخلية الضعيفة من السجلات بعد الدمج. تأكد من نقل جميع الإطارات والنحل قبل التأكيد.</p>
                            </div>
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
                                onClick={handleExecuteMerge}
                                disabled={!mergeData.targetHiveId || saving}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                        جاري الدمج...
                                    </>
                                ) : (
                                    <>
                                        <Combine className="w-4 h-4 ml-2" />
                                        تأكيد الدمج
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Main view: Season selection and candidates list
    return (
        <div className="space-y-6">
            {/* Header with Season Toggle */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-red-600 p-3 rounded-lg">
                        <Combine className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            دمج وتطوير الخلايا
                        </h2>
                        <p className="text-gray-600">
                            إدارة موسمية للخلايا الضعيفة والنويات
                        </p>
                    </div>
                    <div className="text-left">
                        <div className="text-3xl font-bold text-red-600">{weakHives.length}</div>
                        <div className="text-sm text-gray-500">خلية ضعيفة</div>
                    </div>
                </div>
            </div>

            {/* Season Tabs */}
            <Tabs value={season} onValueChange={(v) => setSeason(v as 'SPRING' | 'AUTUMN')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="SPRING" className="gap-2">
                        <Leaf className="w-4 h-4" />
                        الربيع/الصيف (تطوير)
                    </TabsTrigger>
                    <TabsTrigger value="AUTUMN" className="gap-2">
                        <Snowflake className="w-4 h-4" />
                        الخريف/الشتاء (دمج)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={season} className="mt-6">
                    {weakHives.length === 0 ? (
                        <Card className="border-2 border-dashed">
                            <CardContent className="py-12 text-center">
                                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    رائع! لا توجد خلايا ضعيفة
                                </h3>
                                <p className="text-gray-500">
                                    جميع الخلايا في حالة جيدة
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {weakHives.map((candidate) => (
                                <Card
                                    key={candidate.hiveId}
                                    className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <CardTitle className="text-xl font-bold">
                                                خلية #{candidate.hiveNumber}
                                            </CardTitle>
                                            <Badge className={`${getRiskColor(candidate.riskLevel)} text-white`}>
                                                {getRiskLabel(candidate.riskLevel)}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">فرصة البقاء</span>
                                                <span className="font-bold text-red-600">{candidate.survivalChance}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-red-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${candidate.survivalChance}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-sm text-red-900">
                                                {candidate.recommendation}
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => handleSelectHive(candidate)}
                                            className="w-full bg-red-600 hover:bg-red-700 gap-2"
                                        >
                                            <Combine className="w-4 h-4" />
                                            دمج هذه الخلية
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
