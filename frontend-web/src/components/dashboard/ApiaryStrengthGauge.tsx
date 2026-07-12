import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface ApiaryStrengthGaugeProps {
    strength: number; // 0-100
    rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK';
    totalHives: number;
    loading?: boolean;
}

export function ApiaryStrengthGauge({ 
    strength, 
    rating, 
    totalHives, 
    loading = false 
}: ApiaryStrengthGaugeProps) {
    
    // Get color based on strength
    const getColor = (value: number): string => {
        if (value >= 80) return 'text-emerald-500';
        if (value >= 60) return 'text-yellow-500';
        if (value >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    // Get background color for the gauge
    const getBgColor = (value: number): string => {
        if (value >= 80) return 'from-emerald-500 to-emerald-600';
        if (value >= 60) return 'from-yellow-500 to-yellow-600';
        if (value >= 40) return 'from-orange-500 to-orange-600';
        return 'from-red-500 to-red-600';
    };

    // Get Arabic label
    const getRatingLabel = (r: string): string => {
        switch (r) {
            case 'EXCELLENT':
                return 'ممتاز';
            case 'GOOD':
                return 'جيد';
            case 'FAIR':
                return 'متوسط';
            case 'WEAK':
                return 'ضعيف';
            default:
                return 'غير محدد';
        }
    };

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-center">قوة المنحل الإجمالية</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <Skeleton className="w-48 h-48 rounded-full" />
                    <Skeleton className="w-32 h-6 mt-4" />
                </CardContent>
            </Card>
        );
    }

    // Calculate the circumference and offset for the circular progress
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (strength / 100) * circumference;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-center text-lg font-bold">
                    قوة المنحل الإجمالية
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
                {/* Circular Gauge */}
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-gray-200"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className={cn(
                                "transition-all duration-1000 ease-out",
                                getColor(strength)
                            )}
                        />
                    </svg>
                    
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={cn(
                            "text-5xl font-bold",
                            getColor(strength)
                        )}>
                            {Math.round(strength)}%
                        </div>
                        <div className={cn(
                            "text-lg font-semibold mt-2",
                            getColor(strength)
                        )}>
                            {getRatingLabel(rating)}
                        </div>
                    </div>
                </div>

                {/* Total Hives */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        إجمالي الخلايا
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                        {totalHives} خلية
                    </p>
                </div>

                {/* Legend */}
                <div className="mt-6 w-full max-w-xs">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full" />
                    <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-red-500">ضعيف</span>
                        <span className="text-yellow-500">متوسط</span>
                        <span className="text-emerald-500">ممتاز</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
