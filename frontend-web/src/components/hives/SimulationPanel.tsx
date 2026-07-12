import { useState } from 'react';
import { runSimulation, SimulationRequest, SimulationResponse } from '@/services/hives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
    Sparkles,
    Play,
    Loader2,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

interface SimulationPanelProps {
    apiaryId: string;
    hives: any[];
}

export function SimulationPanel({ apiaryId, hives }: SimulationPanelProps) {
    const [scope, setScope] = useState<'APIARY' | 'HIVE'>('APIARY');
    const [selectedHiveId, setSelectedHiveId] = useState<string>('');
    const [duration, setDuration] = useState(12);
    const [factors, setFactors] = useState({
        includeWeather: true,
        includeBeekeeper: true,
        includeSeasons: true
    });
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<SimulationResponse | null>(null);

    const handleRunSimulation = async () => {
        if (scope === 'HIVE' && !selectedHiveId) {
            toast.error('يرجى اختيار خلية');
            return;
        }

        setRunning(true);
        try {
            const request: SimulationRequest = {
                scope,
                hiveIds: scope === 'HIVE' ? [selectedHiveId] : undefined,
                duration,
                factors
            };

            const data = await runSimulation(apiaryId, request);
            setResults(data);
            toast.success('تم إنشاء المحاكاة بنجاح');
        } catch (error) {
            console.error('Failed to run simulation:', error);
            toast.error('فشل تشغيل المحاكاة');
        } finally {
            setRunning(false);
        }
    };

    const getMonthName = (month: number) => {
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return months[month - 1] || `شهر ${month}`;
    };

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <CardTitle>محرك المحاكاة التنبؤية</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Configuration */}
                <div className="space-y-4">
                    {/* Scope Selection */}
                    <div className="space-y-2">
                        <Label>نطاق المحاكاة</Label>
                        <Select value={scope} onValueChange={(v: 'APIARY' | 'HIVE') => setScope(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APIARY">المنحل بالكامل</SelectItem>
                                <SelectItem value="HIVE">خلية واحدة</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Hive Selection (if scope is HIVE) */}
                    {scope === 'HIVE' && (
                        <div className="space-y-2">
                            <Label>اختر الخلية</Label>
                            <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر خلية..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {hives.map(hive => (
                                        <SelectItem key={hive.id} value={hive.id}>
                                            خلية #{hive.hiveNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label>المدة (بالأشهر)</Label>
                        <Select value={duration.toString()} onValueChange={(v: string) => setDuration(parseInt(v))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3 أشهر</SelectItem>
                                <SelectItem value="6">6 أشهر</SelectItem>
                                <SelectItem value="12">12 شهر (سنة)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Factors */}
                    <div className="space-y-3 pt-2">
                        <Label>العوامل المؤثرة</Label>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <Label htmlFor="weather" className="cursor-pointer">
                                تضمين بيانات الطقس
                            </Label>
                            <Switch
                                id="weather"
                                checked={factors.includeWeather}
                                onCheckedChange={(checked) => setFactors({ ...factors, includeWeather: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <Label htmlFor="beekeeper" className="cursor-pointer">
                                تضمين سلوك النحال
                            </Label>
                            <Switch
                                id="beekeeper"
                                checked={factors.includeBeekeeper}
                                onCheckedChange={(checked) => setFactors({ ...factors, includeBeekeeper: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <Label htmlFor="seasons" className="cursor-pointer">
                                تضمين المواسم
                            </Label>
                            <Switch
                                id="seasons"
                                checked={factors.includeSeasons}
                                onCheckedChange={(checked) => setFactors({ ...factors, includeSeasons: checked })}
                            />
                        </div>
                    </div>

                    {/* Run Button */}
                    <Button
                        onClick={handleRunSimulation}
                        disabled={running || (scope === 'HIVE' && !selectedHiveId)}
                        className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                    >
                        {running ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                جاري المحاكاة...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                تشغيل المحاكاة
                            </>
                        )}
                    </Button>
                </div>

                {/* Results */}
                {results && results.predictions && results.predictions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700">نتائج المحاكاة</h3>
                            <Badge variant="outline" className="bg-purple-50 border-purple-200">
                                ثقة: {results.predictions[0]?.confidence || 0}%
                            </Badge>
                        </div>

                        {/* Predictions Timeline */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {results.predictions.map((prediction: any, index: number) => {
                                const prevPrediction = index > 0 ? results.predictions[index - 1] : null;
                                const strengthChange = prevPrediction 
                                    ? prediction.predictedState.strength - prevPrediction.predictedState.strength
                                    : 0;

                                return (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">
                                                    {getMonthName(prediction.month)}
                                                </span>
                                                {prevPrediction && getTrendIcon(
                                                    prediction.predictedState.strength,
                                                    prevPrediction.predictedState.strength
                                                )}
                                            </div>
                                            <Badge variant={
                                                prediction.predictedState.strength >= 80 ? 'default' :
                                                prediction.predictedState.strength >= 50 ? 'secondary' : 'destructive'
                                            }>
                                                قوة: {prediction.predictedState.strength}%
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                            <div>حضنة: {prediction.predictedState.broodFrames}</div>
                                            <div>عسل: {prediction.predictedState.honeyProduction} كجم</div>
                                            <div>ملكة: {prediction.predictedState.queenStatus}</div>
                                        </div>

                                        {prediction.predictedState.diseases && prediction.predictedState.diseases.length > 0 && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>أمراض محتملة: {prediction.predictedState.diseases.join(', ')}</span>
                                            </div>
                                        )}

                                        {prediction.recommendations && prediction.recommendations.length > 0 && (
                                            <div className="mt-2 text-xs text-blue-600">
                                                💡 {prediction.recommendations[0]}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
