import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useHiveAnalysis } from '@/hooks/api';
import type { HiveAnalysis, FrameTrend } from '../services/analysis';

export default function HiveAnalysisPage() {
  const { hiveId } = useParams<{ hiveId: string }>();
  const navigate = useNavigate();

  const { data: analysis, isLoading: loading, error: queryError, refetch: loadStats } = useHiveAnalysis(hiveId || '');
  const error = queryError ? (queryError as any).message : null;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'VERY_STRONG':
        return 'text-green-700 bg-green-100';
      case 'STRONG':
        return 'text-green-600 bg-green-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'WEAK':
        return 'text-orange-600 bg-orange-50';
      case 'VERY_WEAK':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'VERY_STRONG':
        return 'قوية جداً';
      case 'STRONG':
        return 'قوية';
      case 'MEDIUM':
        return 'متوسطة';
      case 'WEAK':
        return 'ضعيفة';
      case 'VERY_WEAK':
        return 'ضعيفة جداً';
      default:
        return rating;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'text-red-700 bg-red-100';
      case 'HIGH':
        return 'text-orange-700 bg-orange-100';
      case 'MEDIUM':
        return 'text-yellow-700 bg-yellow-100';
      case 'LOW':
        return 'text-blue-700 bg-blue-100';
      case 'NONE':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'حرج';
      case 'HIGH':
        return 'عالي';
      case 'MEDIUM':
        return 'متوسط';
      case 'LOW':
        return 'منخفض';
      case 'NONE':
        return 'لا يوجد';
      default:
        return urgency;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'IMMINENT':
        return 'text-red-700 bg-red-100';
      case 'HIGH':
        return 'text-orange-700 bg-orange-100';
      case 'MODERATE':
        return 'text-yellow-700 bg-yellow-100';
      case 'LOW':
        return 'text-blue-700 bg-blue-100';
      case 'NONE':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'IMMINENT':
        return 'وشيك';
      case 'HIGH':
        return 'عالي';
      case 'MODERATE':
        return 'متوسط';
      case 'LOW':
        return 'منخفض';
      case 'NONE':
        return 'لا يوجد';
      default:
        return risk;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'DECREASING':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'STABLE':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return 'متزايد';
      case 'DECREASING':
        return 'متناقص';
      case 'STABLE':
        return 'مستقر';
      default:
        return trend;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'فشل تحميل التحليل'}</p>
        <button
          onClick={() => loadStats()}
          className="mt-4 text-yellow-600 hover:text-yellow-700 underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const strength = analysis.strength ?? { rating: 'MEDIUM', score: 0, factors: {} as Record<string, string> };
  const feedingNeed = analysis.feedingNeed ?? { urgency: 'LOW', needed: false, recommendations: [] as Array<{ rec: string; index: number }> };
  const swarmRisk = analysis.swarmRisk ?? { risk: 'LOW', score: 0, factors: {} as Record<string, string>, recommendations: [] as Array<{ rec: string; index: number }> };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/hives/${hiveId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900">تحليل شامل للخلية</h1>
          <p className="text-gray-500 mt-1">
            تم التحليل: {new Date(analysis.analyzedAt ?? '').toLocaleString('ar-SA')}
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hive Strength */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">قوة الخلية</h2>
          <div className="text-center mb-4">
            <div className="text-5xl font-black text-yellow-600 mb-2">
              {strength.score}
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getRatingColor(strength.rating)}`}>
              {getRatingLabel(strength.rating)}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">إطارات الحضنة:</span>
              <span className="font-semibold">{strength.factors.broodFrames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">إطارات العسل:</span>
              <span className="font-semibold">{strength.factors.honeyFrames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">إطارات اللقاح:</span>
              <span className="font-semibold">{strength.factors.pollenFrames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">إجمالي الإطارات:</span>
              <span className="font-semibold">{strength.factors.totalFrames}</span>
            </div>
          </div>
        </div>

        {/* Feeding Need */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">احتياج التغذية</h2>
          <div className="text-center mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getUrgencyColor(feedingNeed.urgency)}`}>
              {getUrgencyLabel(feedingNeed.urgency)}
            </span>
          </div>
          {feedingNeed.needed ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">نوع التغذية</label>
                <p className="font-semibold">{feedingNeed.type}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">الكمية المطلوبة</label>
                <p className="font-semibold">{feedingNeed.quantityKg} كجم</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">السبب</label>
                <p className="text-sm text-gray-700">{feedingNeed.reason}</p>
              </div>
              {feedingNeed.recommendations.length > 0 && (
                <div>
                  <label className="text-xs text-gray-600">التوصيات</label>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 mt-1">
                    {feedingNeed.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec.rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-4">
              الخلية لا تحتاج للتغذية حالياً
            </p>
          )}
        </div>

        {/* Swarm Risk */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">خطر التطريد</h2>
          <div className="text-center mb-4">
            <div className="text-4xl font-black text-orange-600 mb-2">
              {swarmRisk.score}%
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getRiskColor(swarmRisk.risk)}`}>
              {getRiskLabel(swarmRisk.risk)}
            </span>
          </div>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ازدحام:</span>
              <span className={swarmRisk.factors.congestion ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {swarmRisk.factors.congestion ? 'نعم' : 'لا'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">غياب البيض:</span>
              <span className={swarmRisk.factors.noEggs ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {swarmRisk.factors.noEggs ? 'نعم' : 'لا'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">حضنة قديمة:</span>
              <span className={swarmRisk.factors.oldBrood ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {swarmRisk.factors.oldBrood ? 'نعم' : 'لا'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">عسل عالي:</span>
              <span className={swarmRisk.factors.highHoney ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {swarmRisk.factors.highHoney ? 'نعم' : 'لا'}
              </span>
            </div>
          </div>
          {swarmRisk.recommendations.length > 0 && (
            <div>
              <label className="text-xs text-gray-600">التوصيات</label>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 mt-1">
                {swarmRisk.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec.rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Trends */}
      {analysis.trends && analysis.trends.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4">اتجاهات الإطارات</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">الإطار</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">اتجاه العسل</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">اتجاه الحضنة</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">اتجاه اللقاح</th>
                </tr>
              </thead>
              <tbody>
                {analysis.trends.map((trend: FrameTrend) => (
                  <tr key={trend.frameId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">إطار {trend.position}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {getTrendIcon(trend.trends.honeyTrend)}
                        <span className="text-sm">{getTrendLabel(trend.trends.honeyTrend)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {getTrendIcon(trend.trends.broodTrend)}
                        <span className="text-sm">{getTrendLabel(trend.trends.broodTrend)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {getTrendIcon(trend.trends.pollenTrend)}
                        <span className="text-sm">{getTrendLabel(trend.trends.pollenTrend)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
