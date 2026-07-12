// 📊 AnalyticsPage
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiaryAnalytics, useDashboardKPIs, useProductionStats, useFinancialSummary } from "@/hooks/api";
import { useApiaries } from "@/hooks/api";
import {
    Loader2, Brain, Target, TrendingUp, AlertTriangle,
    CheckCircle2, Clock, FlaskConical
} from "lucide-react";
import { useState } from 'react';
import type { PendingPrediction, RecentMatch, AccuracySummaryItem } from '@/services/analytics';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
    SWARM_RISK_PREDICTION: 'خطر التطريد',
    HONEY_YIELD_ESTIMATE: 'توقع كمية العسل',
    QUEEN_FAILURE_RISK: 'خطر فشل الملكة',
    POST_MERGE_CHECK: 'متابعة ما بعد الدمج',
    POST_SPLIT_QUEEN_CHECK: 'متابعة ما بعد التقسيم',
    COLONY_GROWTH_ESTIMATE: 'توقع نمو المستعمرة',
    DISEASE_RISK_PREDICTION: 'خطر انتشار مرض',
};

const RISK_BADGE: Record<string, { label: string; className: string }> = {
    CRITICAL:  { label: 'حرج',   className: 'bg-red-100 text-red-800 border-red-200' },
    HIGH:      { label: 'عالي',  className: 'bg-orange-100 text-orange-800 border-orange-200' },
    MEDIUM:    { label: 'متوسط', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    LOW:       { label: 'منخفض', className: 'bg-green-100 text-green-800 border-green-200' },
};

function getAnalysisIcon(type: string) {
    switch (type) {
        case 'SWARM_RISK_PREDICTION':  return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        case 'HONEY_YIELD_ESTIMATE':   return <TrendingUp className="h-4 w-4 text-amber-500" />;
        case 'QUEEN_FAILURE_RISK':     return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'COLONY_GROWTH_ESTIMATE': return <TrendingUp className="h-4 w-4 text-green-500" />;
        default:                       return <FlaskConical className="h-4 w-4 text-blue-500" />;
    }
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PredictionCard({ prediction }: { prediction: PendingPrediction }) {
    const p = prediction.predictionPayload;
    const riskStyle = p.riskLevel ? RISK_BADGE[p.riskLevel] ?? RISK_BADGE.MEDIUM : null;
    const confidence = prediction.confidenceScore;

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
            <div className="mt-0.5 p-2 rounded-lg bg-muted">
                {getAnalysisIcon(prediction.analysisType)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                        {ANALYSIS_TYPE_LABELS[prediction.analysisType] || prediction.analysisType}
                    </span>
                    <Badge variant="outline" className="text-xs px-2 py-0 bg-blue-50 text-blue-700 border-blue-200">
                        خلية {prediction.hive?.hiveNumber || '—'}
                    </Badge>
                    {riskStyle && (
                        <Badge variant="outline" className={`text-xs px-2 py-0 ${riskStyle.className}`}>
                            {riskStyle.label}
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.reason}</p>
                {p.recommendation && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">💡 {p.recommendation}</p>
                )}
                {p.expectedQuantityKg && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">🍯 الكمية المتوقعة: {p.expectedQuantityKg} كجم</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">{formatDate(prediction.createdAt)}</span>
                    {confidence !== null && (
                        <span className="text-xs text-green-600 font-medium">دقة: {Number(confidence).toFixed(0)}%</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function MatchCard({ match }: { match: RecentMatch }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
            <div className={`p-2 rounded-full ${match.isAccurate ? 'bg-green-100' : 'bg-red-100'}`}>
                <CheckCircle2 className={`h-4 w-4 ${match.isAccurate ? 'text-green-600' : 'text-red-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                        {ANALYSIS_TYPE_LABELS[match.analysis?.analysisType] || match.analysis?.analysisType}
                    </span>
                    <span className={`text-sm font-bold ${match.accuracyScore >= 80 ? 'text-green-600' : match.accuracyScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {Number(match.accuracyScore).toFixed(1)}%
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(match.matchedAt)}</p>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
    const { data: apiaries, isLoading: apiariesLoading } = useApiaries();
    const [selectedApiaryId, setSelectedApiaryId] = useState<string | undefined>();
    const activeApiaryId = selectedApiaryId || apiaries?.[0]?.id;

    const { data: analytics, isLoading: analyticsLoading } = useApiaryAnalytics(activeApiaryId);
    const { data: production, isLoading: prodLoading } = useProductionStats();

    const loading = apiariesLoading || analyticsLoading;

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                <p className="text-muted-foreground text-sm">جاري تحليل بيانات المنحل...</p>
            </div>
        );
    }

    // Accuracy chart data
    const accuracyChartData = (analytics?.accuracySummary || []).map((item: AccuracySummaryItem) => ({
        name: ANALYSIS_TYPE_LABELS[item.analysisType] || item.analysisType,
        accuracy: item.averageAccuracy,
        matches: item.totalMatches
    }));

    const stats = analytics?.stats || { totalPending: 0, totalMatched: 0, overallAccuracy: null };

    return (
        <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                        محرك التحليل والتوقعات
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        تتبع توقعات النظام الذكية ودقة مطابقتها مع الواقع — نواة التعلم الذاتي
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 border-amber-200 bg-amber-50 text-amber-800">
                        <Brain className="h-3 w-3 ml-1" />
                        النظام التحليلي نشط
                    </Badge>
                    {apiaries && apiaries.length > 1 && (
                        <select
                            value={activeApiaryId || ''}
                            onChange={e => setSelectedApiaryId(e.target.value)}
                            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
                        >
                            {apiaries.map((a: any) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* KPI Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Brain className="h-5 w-5 text-blue-500" />
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">معلق</Badge>
                        </div>
                        <p className="text-3xl font-bold text-blue-700">{stats.totalPending}</p>
                        <p className="text-xs text-muted-foreground mt-1">توقع بانتظار التحقق</p>
                    </CardContent>
                </Card>

                <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">محسوم</Badge>
                        </div>
                        <p className="text-3xl font-bold text-green-700">{stats.totalMatched}</p>
                        <p className="text-xs text-muted-foreground mt-1">توقع تمت مطابقته</p>
                    </CardContent>
                </Card>

                <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Target className="h-5 w-5 text-amber-500" />
                            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">دقة</Badge>
                        </div>
                        <p className="text-3xl font-bold text-amber-700">
                            {stats.overallAccuracy !== null ? `${stats.overallAccuracy}%` : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">متوسط الدقة الإجمالية</p>
                    </CardContent>
                </Card>

                <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">أنواع</Badge>
                        </div>
                        <p className="text-3xl font-bold text-purple-700">{analytics?.accuracySummary?.length || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">نوع تحليل نشط</p>
                    </CardContent>
                </Card>
            </div>

            {/* Accuracy by Type Chart */}
            {accuracyChartData.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-amber-500" />
                            دقة التوقعات حسب النوع
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={accuracyChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'الدقة']}
                                    contentStyle={{ borderRadius: '8px', direction: 'rtl' }}
                                />
                                <Bar dataKey="accuracy" fill="#f59e0b" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: any) => `${Number(v).toFixed(0)}%`, fontSize: 11 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Pending Predictions + Recent Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pending Predictions */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-4 w-4 text-blue-500" />
                            التوقعات النشطة بانتظار التحقق
                            <Badge className="mr-auto bg-blue-100 text-blue-700 text-xs">
                                {analytics?.pendingPredictions?.length || 0}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!analytics?.pendingPredictions?.length ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <Brain className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">لا توجد توقعات معلقة حالياً</p>
                                <p className="text-xs mt-1">سيقوم النظام بتوليد توقعات تلقائياً عند إدخال عمليات جديدة</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                {analytics.pendingPredictions.map((p: PendingPrediction) => (
                                    <PredictionCard key={p.id} prediction={p} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Matches */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            آخر المطابقات المنجزة
                            <Badge className="mr-auto bg-green-100 text-green-700 text-xs">
                                {analytics?.recentMatches?.length || 0}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!analytics?.recentMatches?.length ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <Target className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">لا توجد مطابقات بعد</p>
                                <p className="text-xs mt-1">ستظهر المطابقات هنا عند تأكيد التوقعات السابقة بعمليات مستقبلية</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                {analytics.recentMatches.map((m: RecentMatch) => (
                                    <MatchCard key={m.id} match={m} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* How it works */}
            <Card className="border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-amber-800">🧠 كيف يعمل محرك التعلم الذاتي؟</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-amber-900">
                        <div className="flex gap-2">
                            <span className="font-bold text-lg leading-none">١.</span>
                            <p><strong>التسجيل الفوري:</strong> عند إدخال أي عملية (فحص، تغذية، قطف)، يحفظ النظام البيانات فوراً في الجداول الأساسية ويرد بنجاح.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-lg leading-none">٢.</span>
                            <p><strong>توليد التوقعات:</strong> في الخلفية، يحلل النظام البيانات ويولد توقعات مستقبلية (مثل خطر التطريد أو موعد الحصاد) تُحفظ هنا.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-lg leading-none">٣.</span>
                            <p><strong>المطابقة والتعلم:</strong> عند إدخال عمليات مستقبلية، يطابق النظام النتائج الفعلية بالتوقعات القديمة ويحسب دقة النظام تلقائياً.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
