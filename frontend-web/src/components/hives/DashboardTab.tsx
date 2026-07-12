import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getHives } from '@/services/hives';
import { getStats } from '@/services/apiaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Activity,
    Loader2,
    Sprout,
    Droplets,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiaryStats } from './ApiaryStats';
import { SimulationPanel } from './SimulationPanel';
import { AlertsPanel } from './AlertsPanel';
import { AIConsultant } from './AIConsultant';

export function DashboardTab() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const [hives, setHives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalHives: 0,
        healthPercentage: 0,
        expectedProduction: 0,
        activeAlerts: 0,
        needsInspection: 0,
        avgPollen: 0,
        avgBrood: 0,
        avgHoney: 0,
        feedingRecommendation: null as any
    });

    const fetchData = async () => {
        if (!apiaryId) return;

        setLoading(true);
        try {
            const [hivesData, statsData] = await Promise.all([
                getHives(apiaryId),
                getStats(apiaryId)
            ]);

            setHives(Array.isArray(hivesData) ? hivesData : []);
            setStats({
                totalHives: statsData?.totalHives || 0,
                healthPercentage: statsData?.healthPercentage || 0,
                expectedProduction: statsData?.expectedProduction || 0,
                activeAlerts: statsData?.activeAlerts || 0,
                needsInspection: statsData?.needsInspection || 0,
                avgPollen: statsData?.avgPollen || 0,
                avgBrood: statsData?.avgBrood || 0,
                avgHoney: statsData?.avgHoney || 0,
                feedingRecommendation: statsData?.feedingRecommendation || null
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            // Don't crash, keep defaults
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchData();
    }, [apiaryId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-gray-500">جاري تحميل لوحة التحكم...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-amber-600 p-3 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            لوحة التحكم
                        </h2>
                        <p className="text-gray-600">
                            نظرة شاملة على حالة المنحل والتوقعات المستقبلية
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats (Premium Look) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 transition-all shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">إجمالي الخلايا</CardTitle>
                        <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalHives}</div>
                        <div className="flex flex-col gap-1 mt-1">
                            <p className="text-xs text-slate-500">خلايا نشطة في المنحل</p>
                            {stats.needsInspection > 0 && (
                                <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    {stats.needsInspection} بحاجة لفحص
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 transition-all shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">صحة المنحل</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">{stats.healthPercentage}%</div>
                        <p className="text-xs text-emerald-600/80 mt-1">الحالة العامة للطوائف</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 transition-all shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">الإنتاج المتوقع</CardTitle>
                        <Sprout className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">{stats.expectedProduction} <span className="text-sm font-normal text-slate-500">كجم</span></div>
                        <p className="text-xs text-slate-500 mt-1">تقديري للموسم الحالي</p>
                    </CardContent>
                </Card>

                <Card className={cn("bg-white/40 backdrop-blur-md border border-white/20 transition-all shadow-sm", stats.activeAlerts > 0 && "border-rose-200 bg-rose-50/30")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={cn("text-sm font-medium", stats.activeAlerts > 0 ? "text-rose-600" : "text-slate-600")}>تنبيهات نشطة</CardTitle>
                        <AlertTriangle className={cn("h-4 w-4", stats.activeAlerts > 0 ? "text-rose-500 animate-pulse" : "text-slate-400")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold", stats.activeAlerts > 0 ? "text-rose-600" : "text-slate-400")}>{stats.activeAlerts}</div>
                        <p className="text-xs text-slate-500 mt-1">طلبات تدخل عاجلة</p>
                    </CardContent>
                </Card>
            </div>


            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Stats & Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-white border-slate-200">
                            <CardContent className="pt-4 pb-3">
                                <div className="text-xs text-slate-500 mb-1">متوسط حبوب اللقاح</div>
                                <div className="flex items-end gap-2">
                                    <div className="text-xl font-bold text-amber-600">{stats.avgPollen}%</div>
                                    <div className={cn("text-[10px] mb-1 px-1.5 py-0.5 rounded-full", 
                                        stats.avgPollen > 30 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                                        {stats.avgPollen > 30 ? 'ممتاز' : 'جيد'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="pt-4 pb-3">
                                <div className="text-xs text-slate-500 mb-1">متوسط الحضنة</div>
                                <div className="flex items-end gap-2">
                                    <div className="text-xl font-bold text-rose-600">{stats.avgBrood}%</div>
                                    <div className={cn("text-[10px] mb-1 px-1.5 py-0.5 rounded-full", 
                                        stats.avgBrood > 50 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                        {stats.avgBrood > 50 ? 'ممتاز' : 'جيد'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="pt-4 pb-3">
                                <div className="text-xs text-slate-500 mb-1">متوسط العسل</div>
                                <div className="flex items-end gap-2">
                                    <div className="text-xl font-bold text-yellow-600">{stats.avgHoney}%</div>
                                    <div className={cn("text-[10px] mb-1 px-1.5 py-0.5 rounded-full", 
                                        stats.avgHoney > 40 ? "bg-emerald-50 text-emerald-600" : "bg-yellow-50 text-yellow-600")}>
                                        {stats.avgHoney > 40 ? 'مرتفع' : 'متوسط'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <ApiaryStats hives={hives} />

                    {/* Simulation Panel */}
                    <SimulationPanel apiaryId={apiaryId!} hives={hives} />
                </div>

                {/* Right Column - Alerts & AI Consultant */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Feeding Recommendation */}
                    {stats.feedingRecommendation && (
                        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 shadow-sm relative overflow-hidden">
                            <div className="absolute -left-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-5 h-5 text-indigo-600" />
                                    <CardTitle className="text-base text-indigo-900">توصية التغذية الذكية</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-3 bg-white/60 rounded-xl border border-white/40">
                                    <div className="text-sm font-semibold text-slate-800 mb-1">{stats.feedingRecommendation.recommendedType}</div>
                                    {stats.feedingRecommendation.recommendedQuantity > 0 && (
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {stats.feedingRecommendation.recommendedQuantity} <span className="text-sm font-normal text-indigo-600/70">{stats.feedingRecommendation.unit}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-start gap-2 text-xs text-indigo-800/80 bg-indigo-500/5 p-2 rounded-lg">
                                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-500" />
                                    <p className="leading-relaxed">{stats.feedingRecommendation.reasoning}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <AlertsPanel hives={hives} />

                    {/* AI Consultant */}
                    <div className="sticky top-6">
                        <AIConsultant
                            context={{
                                condition: stats.healthPercentage < 50 ? 'WEAK' : stats.healthPercentage > 80 ? 'EXCELLENT' : 'GOOD'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
