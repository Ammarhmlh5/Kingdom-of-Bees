import React, { useEffect, useState } from 'react';
import { HiveAnalysis } from '../../services/analysis';
import analysisService from '../../services/analysis';

interface HiveAnalysisCardProps {
  hiveId: string;
}

const HiveAnalysisCard: React.FC<HiveAnalysisCardProps> = ({ hiveId }) => {
  const [analysis, setAnalysis] = useState<HiveAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [hiveId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await analysisService.analyzeHive(hiveId);
      setAnalysis(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">خطأ في تحميل التحليل: {error}</p>
      </div>
    );
  }

  if (!analysis) return null;

  // Get strength color
  const getStrengthColor = () => {
    switch (analysis.strength.rating) {
      case 'VERY_STRONG': return 'text-green-600 bg-green-50';
      case 'STRONG': return 'text-blue-600 bg-blue-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'WEAK': return 'text-orange-600 bg-orange-50';
      case 'VERY_WEAK': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get urgency color
  const getUrgencyColor = () => {
    switch (analysis.feedingNeed.urgency) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get swarm risk color
  const getSwarmRiskColor = () => {
    switch (analysis.swarmRisk.risk) {
      case 'IMMINENT': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MODERATE': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">تحليل الخلية</h2>
        <p className="text-sm text-blue-100 mt-1">
          آخر تحديث: {new Date(analysis.analyzedAt).toLocaleString('ar-SA')}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Alerts */}
        {analysis.alerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h3 className="font-bold text-red-800 mb-2">⚠️ تنبيهات هامة</h3>
            <ul className="space-y-1">
              {analysis.alerts.map((alert, index) => (
                <li key={index} className="text-red-700 text-sm">• {alert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Strength */}
        <div className="border rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3">💪 قوة الخلية</h3>
          <div className={`inline-block px-4 py-2 rounded-full font-bold ${getStrengthColor()}`}>
            {analysis.strength.rating} - {analysis.strength.score}/100
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-gray-600">إطارات الحضنة</div>
              <div className="font-bold text-lg">{analysis.strength.factors.broodFrames}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-gray-600">إطارات العسل</div>
              <div className="font-bold text-lg">{analysis.strength.factors.honeyFrames}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-gray-600">إطارات اللقاح</div>
              <div className="font-bold text-lg">{analysis.strength.factors.pollenFrames}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-gray-600">عمر الحضنة</div>
              <div className="font-bold text-sm">{analysis.strength.factors.broodAge}</div>
            </div>
          </div>
        </div>

        {/* Feeding Need */}
        <div className="border rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3">🍯 احتياج التغذية</h3>
          <div className={`inline-block px-4 py-2 rounded-full font-bold ${getUrgencyColor()}`}>
            {analysis.feedingNeed.urgency}
          </div>
          {analysis.feedingNeed.needed && (
            <div className="mt-4 space-y-2">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-600">النوع المطلوب</div>
                <div className="font-bold">{analysis.feedingNeed.type}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-600">الكمية</div>
                <div className="font-bold">{analysis.feedingNeed.quantityKg} كجم</div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-600">السبب</div>
                <div className="text-sm">{analysis.feedingNeed.reason}</div>
              </div>
              {analysis.feedingNeed.recommendations.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-semibold mb-1">التوصيات:</div>
                  <ul className="text-sm space-y-1">
                    {analysis.feedingNeed.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {!analysis.feedingNeed.needed && (
            <p className="text-green-600 mt-2">✓ الخلية لديها احتياطيات كافية</p>
          )}
        </div>

        {/* Swarm Risk */}
        <div className="border rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3">🐝 خطر التطريد</h3>
          <div className={`inline-block px-4 py-2 rounded-full font-bold ${getSwarmRiskColor()}`}>
            {analysis.swarmRisk.risk} - {analysis.swarmRisk.score}/100
          </div>
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`p-2 rounded ${analysis.swarmRisk.factors.congestion ? 'bg-red-100' : 'bg-green-100'}`}>
                {analysis.swarmRisk.factors.congestion ? '⚠️' : '✓'} ازدحام
              </div>
              <div className={`p-2 rounded ${analysis.swarmRisk.factors.noEggs ? 'bg-red-100' : 'bg-green-100'}`}>
                {analysis.swarmRisk.factors.noEggs ? '⚠️' : '✓'} غياب البيض
              </div>
              <div className={`p-2 rounded ${analysis.swarmRisk.factors.oldBrood ? 'bg-red-100' : 'bg-green-100'}`}>
                {analysis.swarmRisk.factors.oldBrood ? '⚠️' : '✓'} حضنة قديمة
              </div>
              <div className={`p-2 rounded ${analysis.swarmRisk.factors.highHoney ? 'bg-red-100' : 'bg-green-100'}`}>
                {analysis.swarmRisk.factors.highHoney ? '⚠️' : '✓'} عسل عالي
              </div>
            </div>
            {analysis.swarmRisk.recommendations.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-semibold mb-1">التوصيات:</div>
                <ul className="text-sm space-y-1">
                  {analysis.swarmRisk.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* General Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">📋 توصيات عامة</h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={loadAnalysis}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 تحديث التحليل
        </button>
      </div>
    </div>
  );
};

export default HiveAnalysisCard;
