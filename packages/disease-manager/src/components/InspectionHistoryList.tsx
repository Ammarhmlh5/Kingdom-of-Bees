/**
 * InspectionHistoryList Component
 * 
 * القائمة التاريخية للفحوصات
 * يعرض سجل الفحوصات وحالة الخلية عبر الزمن
 */

import React, { useMemo } from 'react';
import { useI18n } from '../i18n';
import { useHiveRecord } from '../hooks/useHiveRecord';
import type { InspectionRecord, HiveCondition } from '../types/hive-record';
import './InspectionHistoryList.css';

export interface InspectionHistoryListProps {
    hiveId: string;
    onRecordClick?: (record: InspectionRecord) => void;
    className?: string;
}

export const InspectionHistoryList: React.FC<InspectionHistoryListProps> = ({
    hiveId,
    onRecordClick,
    className = '',
}) => {
    const { t, locale, direction: dir } = useI18n();
    const { inspections, loading, error } = useHiveRecord({ hiveId });

    // ترتيب السجلات
    const sortedRecords = useMemo(() => {
        return [...inspections].sort((a, b) => b.inspectedAt.getTime() - a.inspectedAt.getTime());
    }, [inspections]);



    const getConditionColor = (condition: HiveCondition): string => {
        const colors: Record<HiveCondition, string> = {
            excellent: '#10b981', // أخضر
            good: '#3b82f6',      // أزرق
            fair: '#f59e0b',      // برتقالي
            poor: '#ef4444',      // أحمر
            critical: '#7f1d1d',  // أحمر داكن
        };
        return colors[condition];
    };

    if (loading) {
        return <div className="inspection-history-loading">{t('common.loading')}</div>;
    }

    if (error) {
        return <div className="inspection-history-error">{t('common.error')}: {error.message}</div>;
    }

    return (
        <div className={`inspection-history-list ${className}`} dir={dir}>
            <div className="inspection-history-header">
                <h3>{t('hiveRecord.inspectionHistory')}</h3>
                <button className="add-inspection-btn">
                    + {t('common.add')}
                </button>
            </div>

            <div className="inspection-timeline-vertical">
                {sortedRecords.length === 0 ? (
                    <div className="no-records">{t('hiveRecord.noRecords')}</div>
                ) : (
                    sortedRecords.map((record, index) => (
                        <div
                            key={record.id}
                            className={`inspection-item ${onRecordClick ? 'clickable' : ''}`}
                            onClick={() => onRecordClick?.(record)}
                        >
                            <div className="inspection-date-column">
                                <span className="date-day">{record.inspectedAt.getDate()}</span>
                                <span className="date-month">
                                    {new Intl.DateTimeFormat(locale, { month: 'short' }).format(record.inspectedAt)}
                                </span>
                                <span className="date-year">{record.inspectedAt.getFullYear()}</span>
                            </div>

                            <div className="inspection-marker-column">
                                <div
                                    className="inspection-marker"
                                    style={{ backgroundColor: getConditionColor(record.condition) }}
                                />
                                {index < sortedRecords.length - 1 && <div className="inspection-line" />}
                            </div>

                            <div className="inspection-content card-shadow">
                                <div className="inspection-header">
                                    <span
                                        className="condition-badge"
                                        style={{
                                            color: getConditionColor(record.condition),
                                            borderColor: getConditionColor(record.condition)
                                        }}
                                    >
                                        {t(`hiveRecord.hiveCondition.${record.condition}`)}
                                    </span>

                                    {record.duration && (
                                        <span className="duration-text">
                                            {record.duration} {t('time.minutes.short')}
                                        </span>
                                    )}
                                </div>

                                <div className="inspection-stats">
                                    <div className="stat-item" title={t('hiveRecord.population.bees')}>
                                        🐝 {record.population ? t(`hiveRecord.population.${record.population.bees}`) : '-'}
                                    </div>
                                    <div className="stat-item" title={t('hiveRecord.population.brood')}>
                                        🐛 {record.population ? t(`hiveRecord.population.${record.population.brood}`) : '-'}
                                    </div>
                                    <div className="stat-item" title={t('hiveRecord.resources.honey')}>
                                        🍯 {record.resources ? t(`hiveRecord.resources.${record.resources.honey}`) : '-'}
                                    </div>
                                </div>

                                {record.notes && (
                                    <p className="inspection-summary">{record.notes}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
