import { Activity, Thermometer, TrendingUp, AlertTriangle, Plus, Search } from 'lucide-react';
import { useApiaries } from '@/hooks/api';
import { LiveApiaryMap } from '@/components/LiveApiaryMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardPage() {
    const { user } = useAuth();
    const { data: apiaries = [] } = useApiaries();

    // Fetch Real Dashboard Stats
    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/apiaries/stats/dashboard');
            return res.data;
        },
        initialData: {
            totalHives: 0,
            healthPercentage: 0,
            expectedProduction: 0,
            activeAlerts: 0,
            needsInspection: 0,
            recommendations: []
        }
    });

    const getRecommendationIcon = (iconName: string) => {
        switch (iconName) {
            case 'thermometer': return <Thermometer className="w-3 h-3" />;
            case 'activity': return <Activity className="w-3 h-3" />;
            default: return <AlertTriangle className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">
                        مساء الخير، {user?.fullName || 'نحال'} 👋
                    </h1>
                    <p className="text-slate-500">
                        إليك ملخص سريع لما يحدث في مناحلك اليوم.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="بحث في الخلايا، التنبيهات..." className="pr-9 bg-white/60 border-amber-200/30 focus-visible:ring-amber-400" />
                    </div>
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 shadow-[0_4px_12px_rgba(245,158,11,0.3)] border-0">
                        <Plus className="w-4 h-4 ml-2" />
                        فحص جديد
                    </Button>
                </div>
            </div>

            {/* KPI Cards (Glassmorphism) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 group-hover:text-amber-600 transition-colors">إجمالي الخلايا</CardTitle>
                        <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{stats.totalHives}</div>
                        <div className="flex flex-col gap-1 mt-1">
                            <p className="text-xs text-slate-500">
                                إجمالي الخلايا في جميع المناحل
                            </p>
                            {stats.needsInspection > 0 && (
                                <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    {stats.needsInspection} خلية بحاجة لفحص
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 group-hover:text-emerald-600 transition-colors">صحة المنحل</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{stats.healthPercentage}%</div>
                        <p className="text-xs text-emerald-600/80 mt-1">
                            {stats.healthPercentage >= 80 ? 'حالة ممتازة' : stats.healthPercentage >= 50 ? 'حالة جيدة' : 'يحتاج اهتمام'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 group-hover:text-amber-600 transition-colors">الإنتاج المتوقع</CardTitle>
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{stats.expectedProduction} <span className="text-lg font-normal text-slate-500">كجم</span></div>
                        <p className="text-xs text-slate-500 mt-1">
                            تقديري بناءً على عدد الخلايا
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-md border border-rose-200/50 hover:bg-rose-50/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rose-600 group-hover:text-rose-700 transition-colors">تنبيهات نشطة</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">{stats.activeAlerts}</div>
                        <p className="text-xs text-rose-600/80 mt-1">
                            تتطلب اهتمام فوري
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Info */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Map / IoT Section */}
                <Card className="col-span-4 bg-white/40 border-white/20 backdrop-blur-md shadow-sm min-h-[400px]">
                    <CardHeader>
                        <CardTitle className="text-slate-800">خريطة المناحل المباشرة</CardTitle>
                        <CardDescription>بيانات الموقع وحالة المناحل</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] p-0 overflow-hidden m-6 rounded-xl border border-slate-200 shadow-inner">
                        <LiveApiaryMap apiaries={apiaries} />
                    </CardContent>
                </Card>

                {/* Recent Activity / AI Insights */}
                <Card className="col-span-3 bg-white/40 border-white/20 backdrop-blur-md shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            توصيات المستشار الذكي
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] border border-indigo-200">BETA</span>
                        </CardTitle>
                        <CardDescription>
                            توصيات ذكية بناءً على البيانات الحالية.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Dynamic Recommendations */}
                            {stats.recommendations && stats.recommendations.length > 0 ? (
                                stats.recommendations.map((rec: any, idx: number) => (
                                    <div key={idx} className={`p-4 rounded-xl border transition-colors ${rec.type === 'weather' ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50' :
                                            rec.type === 'health' ? 'bg-amber-50/50 border-amber-100 hover:bg-amber-50' :
                                                'bg-slate-50/50 border-slate-100'
                                        }`}>
                                        <p className={`text-sm font-medium leading-relaxed ${rec.type === 'weather' ? 'text-indigo-800' :
                                                rec.type === 'health' ? 'text-amber-800' :
                                                    'text-slate-800'
                                            }`}>
                                            "{rec.message}"
                                        </p>
                                        <p className={`text-xs mt-2 flex items-center gap-1 ${rec.type === 'weather' ? 'text-indigo-500' :
                                                rec.type === 'health' ? 'text-amber-600' :
                                                    'text-slate-500'
                                            }`}>
                                            {getRecommendationIcon(rec.icon)}
                                            {rec.type === 'weather' ? 'تحليل الطقس' : 'تحليل الأداء'} • {rec.time}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    لا توجد توصيات حالياً.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
