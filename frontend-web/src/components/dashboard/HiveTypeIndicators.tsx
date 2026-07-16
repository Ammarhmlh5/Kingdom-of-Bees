import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HiveTypeData {
    count: number;
    percent: number;
    trend: number; // +2, -1, 0
}

interface HiveTypeIndicatorsProps {
    excellent: HiveTypeData;
    good: HiveTypeData;
    weak: HiveTypeData;
    loading?: boolean;
}

interface IndicatorCardProps {
    title: string;
    icon: string;
    data: HiveTypeData;
    color: string;
    bgColor: string;
}

function IndicatorCard({ title, icon, data, color, bgColor }: IndicatorCardProps) {
    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <TrendingUp className="w-4 h-4" />;
        if (trend < 0) return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = (trend: number): string => {
        if (trend > 0) return 'text-green-600';
        if (trend < 0) return 'text-red-600';
        return 'text-gray-500';
    };

    const getTrendText = (trend: number): string => {
        if (trend > 0) return `+${trend} عن السابق`;
        if (trend < 0) return `${trend} عن السابق`;
        return 'لا تغيير';
    };

    return (
        <Card className="w-full">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{icon}</span>
                        <h3 className="font-semibold text-sm">{title}</h3>
                    </div>
                    
                    {/* Trend Indicator */}
                    <div className={cn(
                        "flex items-center gap-1 text-xs",
                        getTrendColor(data.trend)
                    )}>
                        {getTrendIcon(data.trend)}
                        <span>{getTrendText(data.trend)}</span>
                    </div>
                </div>

                {/* Count and Percentage */}
                <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                        <span className={cn("text-3xl font-bold", color)}>
                            {data.count}
                        </span>
                        <span className="text-sm text-muted-foreground">خلية</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                        {data.percent.toFixed(1)}% من الإجمالي
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-500", bgColor)}
                        style={{ width: `${data.percent}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export function HiveTypeIndicators({ 
    excellent, 
    good, 
    weak, 
    loading = false 
}: HiveTypeIndicatorsProps) {
    
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Excellent Hives */}
            <IndicatorCard
                title="خلايا ممتازة"
                icon="⭐"
                data={excellent}
                color="text-emerald-600"
                bgColor="bg-gradient-to-r from-emerald-500 to-emerald-600"
            />

            {/* Good Hives */}
            <IndicatorCard
                title="خلايا جيدة"
                icon="✓"
                data={good}
                color="text-yellow-600"
                bgColor="bg-gradient-to-r from-yellow-500 to-yellow-600"
            />

            {/* Weak Hives */}
            <IndicatorCard
                title="خلايا ضعيفة"
                icon="⚠"
                data={weak}
                color="text-red-600"
                bgColor="bg-gradient-to-r from-red-500 to-red-600"
            />
        </div>
    );
}