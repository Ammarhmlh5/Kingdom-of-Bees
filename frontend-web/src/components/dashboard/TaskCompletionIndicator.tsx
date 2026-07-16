import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';

interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
    completionRate: number;
    breakdown: {
        inspections: { total: number; completed: number };
        feeding: { total: number; completed: number };
        operations: { total: number; completed: number };
        maintenance: { total: number; completed: number };
        harvest: { total: number; completed: number };
        treatment: { total: number; completed: number };
        other: { total: number; completed: number };
    };
}

interface TaskCompletionIndicatorProps {
    stats: TaskStats;
    loading?: boolean;
}

interface StatusCardProps {
    icon: React.ReactNode;
    label: string;
    count: number;
    color: string;
    bgColor: string;
}

function StatusCard({ icon, label, count, color, bgColor }: StatusCardProps) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className={cn("p-2 rounded-full", bgColor)}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("text-xl font-bold", color)}>{count}</p>
            </div>
        </div>
    );
}

interface TypeBreakdownProps {
    icon: string;
    label: string;
    total: number;
    completed: number;
}

function TypeBreakdown({ icon, label, total, completed }: TypeBreakdownProps) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="text-muted-foreground">{label}</span>
                </div>
                <span className="font-medium">
                    {completed}/{total}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export function TaskCompletionIndicator({ stats, loading = false }: TaskCompletionIndicatorProps) {
    
    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-center">مؤشر إنجاز المهام</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-center text-lg font-bold">
                    مؤشر إنجاز المهام
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Completion Rate */}
                <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background Circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={2 * Math.PI * 56}
                                strokeDashoffset={2 * Math.PI * 56 * (1 - stats.completionRate / 100)}
                                strokeLinecap="round"
                                className="text-blue-500 transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-3xl font-bold text-blue-600">
                                {Math.round(stats.completionRate)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                                معدل الإنجاز
                            </div>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                        {stats.completed} من {stats.total} مهمة مكتملة
                    </p>
                </div>

                {/* Status Breakdown */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">حسب الحالة</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <StatusCard
                            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                            label="مكتملة"
                            count={stats.completed}
                            color="text-green-600"
                            bgColor="bg-green-100"
                        />
                        <StatusCard
                            icon={<Clock className="w-5 h-5 text-blue-600" />}
                            label="قيد التنفيذ"
                            count={stats.inProgress}
                            color="text-blue-600"
                            bgColor="bg-blue-100"
                        />
                        <StatusCard
                            icon={<Circle className="w-5 h-5 text-gray-600" />}
                            label="قيد الانتظار"
                            count={stats.pending}
                            color="text-gray-600"
                            bgColor="bg-gray-100"
                        />
                        <StatusCard
                            icon={<AlertCircle className="w-5 h-5 text-orange-600" />}
                            label="متأخرة"
                            count={stats.overdue}
                            color="text-orange-600"
                            bgColor="bg-orange-100"
                        />
                    </div>
                </div>

                {/* Type Breakdown */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">حسب النوع</h4>
                    <div className="space-y-3">
                        <TypeBreakdown
                            icon="🔍"
                            label="فحوصات"
                            total={stats.breakdown.inspections.total}
                            completed={stats.breakdown.inspections.completed}
                        />
                        <TypeBreakdown
                            icon="🍯"
                            label="تغذية"
                            total={stats.breakdown.feeding.total}
                            completed={stats.breakdown.feeding.completed}
                        />
                        <TypeBreakdown
                            icon="⚙️"
                            label="عمليات"
                            total={stats.breakdown.operations.total}
                            completed={stats.breakdown.operations.completed}
                        />
                        <TypeBreakdown
                            icon="🔧"
                            label="صيانة"
                            total={stats.breakdown.maintenance.total}
                            completed={stats.breakdown.maintenance.completed}
                        />
                        <TypeBreakdown
                            icon="🌾"
                            label="حصاد"
                            total={stats.breakdown.harvest.total}
                            completed={stats.breakdown.harvest.completed}
                        />
                        <TypeBreakdown
                            icon="💊"
                            label="علاج"
                            total={stats.breakdown.treatment.total}
                            completed={stats.breakdown.treatment.completed}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
