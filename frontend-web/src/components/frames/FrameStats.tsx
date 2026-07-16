import React, { useEffect, useState } from 'react';
import { frameService } from '../../services/frames';

interface FrameStatsProps {
    apiaryId?: string;
    hiveId: string;
    showCharts?: boolean;
}

interface Stats {
    totalFrames: number;
    broodFrames: number;
    honeyFrames: number;
    pollenFrames: number;
    emptyFrames: number;
    averageHoney: number;
    averageBrood: number;
    averagePollen: number;
    broodAgeDistribution: {
        EGGS: number;
        YOUNG_LARVAE: number;
        OLD_LARVAE: number;
        CAPPED: number;
        MIXED: number;
    };
}

const FrameStats: React.FC<FrameStatsProps> = ({ apiaryId, hiveId, showCharts = false }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, [hiveId]);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const frames = await frameService.getHiveFrames(apiaryId || '', hiveId);

            // Calculate stats
            const totalFrames = frames.length;
            let broodFrames = 0;
            let honeyFrames = 0;
            let pollenFrames = 0;
            let emptyFrames = 0;
            let totalHoney = 0;
            let totalBrood = 0;
            let totalPollen = 0;

            const broodAgeDistribution = {
                EGGS: 0,
                YOUNG_LARVAE: 0,
                OLD_LARVAE: 0,
                CAPPED: 0,
                MIXED: 0
            };

            frames.forEach((frame: any) => {
                // Calculate averages from both sides
                const avgHoney = ((frame.sideAHoneyPercentage || 0) + (frame.sideBHoneyPercentage || 0)) / 2;
                const avgBrood = ((frame.sideABroodPercentage || 0) + (frame.sideBBroodPercentage || 0)) / 2;
                const avgPollen = ((frame.sideAPollenPercentage || 0) + (frame.sideBPollenPercentage || 0)) / 2;

                totalHoney += avgHoney;
                totalBrood += avgBrood;
                totalPollen += avgPollen;

                // Count frame types
                if (avgBrood > 30) broodFrames++;
                if (avgHoney > 30) honeyFrames++;
                if (avgPollen > 20) pollenFrames++;
                if (avgHoney < 10 && avgBrood < 10 && avgPollen < 10) emptyFrames++;

                // Brood age distribution
                if (frame.sideABroodAge && frame.sideABroodAge in broodAgeDistribution) broodAgeDistribution[frame.sideABroodAge as keyof typeof broodAgeDistribution]++;
                if (frame.sideBBroodAge && frame.sideBBroodAge in broodAgeDistribution) broodAgeDistribution[frame.sideBBroodAge as keyof typeof broodAgeDistribution]++;
            });

            setStats({
                totalFrames,
                broodFrames,
                honeyFrames,
                pollenFrames,
                emptyFrames,
                averageHoney: totalFrames > 0 ? Math.round(totalHoney / totalFrames) : 0,
                averageBrood: totalFrames > 0 ? Math.round(totalBrood / totalFrames) : 0,
                averagePollen: totalFrames > 0 ? Math.round(totalPollen / totalFrames) : 0,
                broodAgeDistribution
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i: any) => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">خطأ في تحميل الإحصائيات: {error}</p>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-lg text-gray-900">📊 إحصائيات الإطارات</h3>
            </div>

            <div className="p-6 space-y-6">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="text-2xl font-bold text-blue-900">{stats.totalFrames}</div>
                        <div className="text-sm text-blue-700">إجمالي الإطارات</div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                        <div className="text-3xl mb-2">🐝</div>
                        <div className="text-2xl font-bold text-amber-900">{stats.broodFrames}</div>
                        <div className="text-sm text-amber-700">إطارات حضنة</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                        <div className="text-3xl mb-2">🍯</div>
                        <div className="text-2xl font-bold text-yellow-900">{stats.honeyFrames}</div>
                        <div className="text-sm text-yellow-700">إطارات عسل</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                        <div className="text-3xl mb-2">🌼</div>
                        <div className="text-2xl font-bold text-orange-900">{stats.pollenFrames}</div>
                        <div className="text-sm text-orange-700">إطارات لقاح</div>
                    </div>
                </div>

                {/* Averages */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">المتوسطات</h4>
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">🍯 متوسط العسل</span>
                                <span className="font-bold text-gray-900">{stats.averageHoney}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full transition-all"
                                    style={{ width: `${stats.averageHoney}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">🐝 متوسط الحضنة</span>
                                <span className="font-bold text-gray-900">{stats.averageBrood}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-amber-600 h-2 rounded-full transition-all"
                                    style={{ width: `${stats.averageBrood}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">🌼 متوسط اللقاح</span>
                                <span className="font-bold text-gray-900">{stats.averagePollen}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-orange-500 h-2 rounded-full transition-all"
                                    style={{ width: `${stats.averagePollen}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brood Age Distribution */}
                {showCharts && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">توزيع أعمار الحضنة</h4>
                        <div className="space-y-2">
                            {Object.entries(stats.broodAgeDistribution).map(([age, count]) => {
                                if (count === 0) return null;
                                const total = Object.values(stats.broodAgeDistribution).reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                                const labels: Record<string, string> = {
                                    EGGS: '🥚 بيض',
                                    YOUNG_LARVAE: '🐛 يرقات صغيرة',
                                    OLD_LARVAE: '🐛 يرقات كبيرة',
                                    CAPPED: '🔒 مغلقة',
                                    MIXED: '🔄 متنوعة'
                                };

                                const colors: Record<string, string> = {
                                    EGGS: 'bg-blue-500',
                                    YOUNG_LARVAE: 'bg-green-500',
                                    OLD_LARVAE: 'bg-yellow-500',
                                    CAPPED: 'bg-orange-500',
                                    MIXED: 'bg-purple-500'
                                };

                                return (
                                    <div key={age}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{labels[age]}</span>
                                            <span className="font-medium text-gray-900">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`${colors[age]} h-2 rounded-full transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty Frames Warning */}
                {stats.emptyFrames > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <p className="font-medium text-yellow-800">
                                    {stats.emptyFrames} إطار فارغ
                                </p>
                                <p className="text-sm text-yellow-700">
                                    قد تحتاج هذه الإطارات إلى الإزالة أو إضافة شمع أساس
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FrameStats;
