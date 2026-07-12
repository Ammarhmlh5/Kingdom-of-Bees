/**
 * HiveStatistics Component
 * 
 * إحصائيات الخلية
 * يعرض ملخصات بيانية ورقمية عن حالة الخلية الصحية
 */

import React from 'react';
import { useI18n } from '../i18n';
import { useHiveRecord } from '../hooks/useHiveRecord';
import './HiveStatistics.css';

export interface HiveStatisticsProps {
    hiveId: string;
    className?: string;
}

export const HiveStatistics: React.FC<HiveStatisticsProps> = ({
    hiveId,
    className = '',
}) => {
    const { t, direction: dir } = useI18n();
    const { statistics, loading } = useHiveRecord({ hiveId });

    if (loading || !statistics) return null;

    const healthScore = statistics.healthScore || 0;

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#3b82f6';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className={`hive-statistics ${className}`} dir={dir}>
            <div className="stat-card main-score">
                <div className="score-ring" style={{ borderColor: getScoreColor(healthScore) }}>
                    <span className="score-value">{healthScore}</span>
                    <span className="score-label">{t('hiveRecord.statistics.healthScore')}</span>
                </div>
                <div className="trend-indicator">
                    {statistics.healthTrend === 'improving' && '📈 ' + t('hiveRecord.statistics.improving')}
                    {statistics.healthTrend === 'stable' && '➡️ ' + t('hiveRecord.statistics.stable')}
                    {statistics.healthTrend === 'declining' && '📉 ' + t('hiveRecord.statistics.declining')}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h4>{t('hiveRecord.statistics.diseases')}</h4>
                    <div className="stat-row">
                        <span>{t('common.total')}</span>
                        <strong>{statistics.totalDiseases}</strong>
                    </div>
                    <div className="stat-row">
                        <span>{t('hiveRecord.diseaseStatus.active')}</span>
                        <strong className="text-red">{statistics.activeDiseases}</strong>
                    </div>
                    <div className="stat-row">
                        <span>{t('hiveRecord.diseaseStatus.resolved')}</span>
                        <strong className="text-green">{statistics.resolvedDiseases}</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <h4>{t('hiveRecord.statistics.treatments')}</h4>
                    <div className="stat-row">
                        <span>{t('hiveRecord.diseaseStatus.active')}</span>
                        <strong>{statistics.activeTreatments}</strong>
                    </div>
                    <div className="stat-row">
                        <span>{t('diseases.cost')}</span>
                        <strong>{statistics.totalCost} USD</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <h4>{t('hiveRecord.statistics.inspections')}</h4>
                    <div className="stat-row">
                        <span>{t('common.total')}</span>
                        <strong>{statistics.totalInspections}</strong>
                    </div>
                    <div className="stat-row">
                        <span>{t('common.average')}</span>
                        <strong>{statistics.averageCondition || '-'}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};
