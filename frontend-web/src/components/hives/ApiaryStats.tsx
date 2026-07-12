import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    PieChart,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';

interface ApiaryStatsProps {
    hives: any[];
}

export function ApiaryStats({ hives }: ApiaryStatsProps) {
    const conditionStats = {
        EXCELLENT: hives.filter(h => (h.strengthRating || h.condition) === 'EXCELLENT').length,
        VERY_GOOD: hives.filter(h => (h.strengthRating || h.condition) === 'VERY_GOOD').length,
        GOOD: hives.filter(h => (h.strengthRating || h.condition) === 'GOOD').length,
        FAIR: hives.filter(h => (h.strengthRating || h.condition) === 'FAIR').length,
        WEAK: hives.filter(h => (h.strengthRating || h.condition) === 'WEAK').length,
        PENDING_INSPECTION: hives.filter(h => !h.strengthRating && !h.condition).length,
    };


    // Calculate strength distribution
    const strengthStats = {
        strong: hives.filter(h => h.strength === 'STRONG' || h.strength === 'VERY_STRONG').length,
        medium: hives.filter(h => h.strength === 'MEDIUM').length,
        weak: hives.filter(h => h.strength === 'WEAK' || h.strength === 'VERY_WEAK').length,
    };

    // Calculate average frames
    const avgFrames = hives.length > 0
        ? Math.round(hives.reduce((sum, h) => sum + (h.frames?.total || 0), 0) / hives.length)
        : 0;

    // Calculate queen age distribution
    const queenAgeStats = {
        young: hives.filter(h => h.queenAge && h.queenAge <= 1).length,
        prime: hives.filter(h => h.queenAge && h.queenAge > 1 && h.queenAge <= 2).length,
        old: hives.filter(h => h.queenAge && h.queenAge > 2).length,
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'EXCELLENT': return 'bg-green-500';
            case 'VERY_GOOD': return 'bg-green-400';
            case 'GOOD': return 'bg-yellow-500';
            case 'FAIR': return 'bg-orange-500';
            case 'WEAK': return 'bg-red-500';
            case 'PENDING_INSPECTION': return 'bg-slate-300';
            default: return 'bg-gray-500';
        }
    };

    const getConditionLabel = (condition: string) => {
        switch (condition) {
            case 'EXCELLENT': return 'ممتازة';
            case 'VERY_GOOD': return 'جيدة جداً';
            case 'GOOD': return 'جيدة';
            case 'FAIR': return 'متوسطة';
            case 'WEAK': return 'ضعيفة';
            case 'PENDING_INSPECTION': return 'بحاجة لفحص';
            default: return condition;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-amber-600" />
                    <CardTitle>إحصائيات المنحل</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Condition Distribution */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">توزيع الحالة</h3>
                    <div className="space-y-2">
                        {Object.entries(conditionStats).map(([condition, count]) => {
                            const percentage = hives.length > 0 ? (count / hives.length) * 100 : 0;
                            return (
                                <div key={condition} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{getConditionLabel(condition)}</span>
                                        <span className="font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`${getConditionColor(condition)} h-2 rounded-full transition-all`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Strength Distribution */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">توزيع القوة</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-green-600">{strengthStats.strong}</div>
                            <div className="text-xs text-gray-600">قوية</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <Minus className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-yellow-600">{strengthStats.medium}</div>
                            <div className="text-xs text-gray-600">متوسطة</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                            <TrendingDown className="w-5 h-5 text-red-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-red-600">{strengthStats.weak}</div>
                            <div className="text-xs text-gray-600">ضعيفة</div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">متوسط الإطارات</div>
                        <div className="text-2xl font-bold text-amber-600">{avgFrames}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">ملكات صغيرة</div>
                        <div className="text-2xl font-bold text-green-600">{queenAgeStats.young}</div>
                    </div>
                </div>

                {/* Queen Age Distribution */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">أعمار الملكات</h3>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="flex-1 justify-center py-2 bg-green-50 border-green-200">
                            <span className="text-green-700">صغيرة: {queenAgeStats.young}</span>
                        </Badge>
                        <Badge variant="outline" className="flex-1 justify-center py-2 bg-yellow-50 border-yellow-200">
                            <span className="text-yellow-700">متوسطة: {queenAgeStats.prime}</span>
                        </Badge>
                        <Badge variant="outline" className="flex-1 justify-center py-2 bg-red-50 border-red-200">
                            <span className="text-red-700">كبيرة: {queenAgeStats.old}</span>
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
