import { useState, useEffect } from 'react';
import { ApiaryStrengthGauge } from './ApiaryStrengthGauge';
import { HiveTypeIndicators } from './HiveTypeIndicators';
import { TaskCompletionIndicator } from './TaskCompletionIndicator';
import { getApiaryMetrics } from '@/services/apiaryMetrics';
import { getTaskStats } from '@/services/apiaryTasks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedDashboardTabProps {
    apiaryId: string;
}

export function EnhancedDashboardTab({ apiaryId }: EnhancedDashboardTabProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // Metrics state
    const [metrics, setMetrics] = useState<{
        overallStrength: number;
        strengthRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK';
        totalHives: number;
        excellentHives: number;
        excellentPercent: number;
        excellentTrend: number;
        goodHives: number;
        goodPercent: number;
        goodTrend: number;
        weakHives: number;
        weakPercent: number;
        weakTrend: number;
    } | null>(null);

    // Task stats state
    const [taskStats, setTaskStats] = useState<{
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
    } | null>(null);

    // Fetch data
    const fetchData = async () => {
        try {
            setError(null);
            
            // Fetch metrics and task stats in parallel
            const [metricsData, statsData] = await Promise.all([
                getApiaryMetrics(apiaryId),
                getTaskStats(apiaryId)
            ]);

            setMetrics(metricsData);
            setTaskStats(statsData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('فشل تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (apiaryId) {
            fetchData();
        }
    }, [apiaryId]);

    // Refresh handler
    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                            إعادة المحاولة
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">لوحة التحكم المحسّنة</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        نظرة شاملة على حالة المنحل والمهام
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                >
                    <RefreshCw className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                    تحديث
                </Button>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Strength Gauge */}
                <div className="lg:col-span-1">
                    <ApiaryStrengthGauge
                        strength={metrics?.overallStrength || 0}
                        rating={metrics?.strengthRating || 'FAIR'}
                        totalHives={metrics?.totalHives || 0}
                        loading={loading}
                    />
                </div>

                {/* Right Column - Hive Type Indicators and Task Completion */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hive Type Indicators */}
                    <HiveTypeIndicators
                        excellent={{
                            count: metrics?.excellentHives || 0,
                            percent: metrics?.excellentPercent || 0,
                            trend: metrics?.excellentTrend || 0
                        }}
                        good={{
                            count: metrics?.goodHives || 0,
                            percent: metrics?.goodPercent || 0,
                            trend: metrics?.goodTrend || 0
                        }}
                        weak={{
                            count: metrics?.weakHives || 0,
                            percent: metrics?.weakPercent || 0,
                            trend: metrics?.weakTrend || 0
                        }}
                        loading={loading}
                    />

                    {/* Task Completion Indicator */}
                    {taskStats && (
                        <TaskCompletionIndicator
                            stats={taskStats}
                            loading={loading}
                        />
                    )}
                </div>
            </div>

            {/* Info Message */}
            {!loading && metrics && (
                <div className="text-center text-sm text-muted-foreground">
                    آخر تحديث: {new Date().toLocaleString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            )}
        </div>
    );
}
