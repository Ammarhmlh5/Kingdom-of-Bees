/**
 * DiseaseHistoryList Component
 * 
 * القائمة التاريخية للأمراض
 * يعرض سجل الأمراض السابقة والحالية مع إمكانية الفلترة
 */

import React, { useState, useMemo } from 'react';
import { useI18n } from '../i18n';
import { useHiveRecord } from '../hooks/useHiveRecord';
import type { DiseaseRecord, DiseaseStatus } from '../types/hive-record';
import './DiseaseHistoryList.css';

export interface DiseaseHistoryListProps {
    hiveId: string;
    onRecordClick?: (record: DiseaseRecord) => void;
    className?: string;
}

export const DiseaseHistoryList: React.FC<DiseaseHistoryListProps> = ({
    hiveId,
    onRecordClick,
    className = '',
}) => {
    const { t, locale, direction: dir } = useI18n();
    const { diseases, loading, error } = useHiveRecord({ hiveId });

    // فلاتر
    const [statusFilter, setStatusFilter] = useState<DiseaseStatus | 'all'>('all');
    const [minSeverityFilter, setMinSeverityFilter] = useState<number>(0);

    // تصفية السجلات
    const filteredRecords = useMemo(() => {
        return diseases.filter(record => {
            // فلتر الحالة
            if (statusFilter !== 'all' && record.status !== statusFilter) {
                return false;
            }

            // فلتر الخطورة
            if (record.severity < minSeverityFilter) {
                return false;
            }

            return true;
        }).sort((a, b) => b.diagnosedAt.getTime() - a.diagnosedAt.getTime());
    }, [diseases, statusFilter, minSeverityFilter]);

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const getStatusColor = (status: DiseaseStatus): string => {
        const colors: Record<DiseaseStatus, string> = {
            active: '#ef4444',    // أحمر
            treating: '#f59e0b',  // برتقالي
            resolved: '#10b981',  // أخضر
            chronic: '#8b5cf6',   // بنفسجي
        };
        return colors[status] || '#6b7280';
    };

    if (loading) {
        return <div className="disease-history-loading">{t('common.loading')}</div>;
    }

    if (error) {
        return <div className="disease-history-error">{t('common.error')}: {error.message}</div>;
    }

    return (
        <div className={`disease-history-list ${className}`} dir={dir}>
            <div className="disease-history-header">
                <h3>{t('hiveRecord.diseaseHistory')}</h3>
                <div className="disease-history-filters">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as DiseaseStatus | 'all')}
                        className="filter-select"
                    >
                        <option value="all">{t('common.all')}</option>
                        <option value="active">{t('hiveRecord.diseaseStatus.active')}</option>
                        <option value="treating">{t('hiveRecord.diseaseStatus.treating')}</option>
                        <option value="resolved">{t('hiveRecord.diseaseStatus.resolved')}</option>
                        <option value="chronic">{t('hiveRecord.diseaseStatus.chronic')}</option>
                    </select>

                    <select
                        value={minSeverityFilter}
                        onChange={(e) => setMinSeverityFilter(Number(e.target.value))}
                        className="filter-select"
                    >
                        <option value="0">{t('diseases.severity')}: {t('common.all')}</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5</option>
                    </select>
                </div>
            </div>

            <div className="disease-history-content">
                {filteredRecords.length === 0 ? (
                    <div className="no-records">{t('hiveRecord.noRecords')}</div>
                ) : (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>{t('diseases.name')}</th>
                                <th>{t('common.date')}</th>
                                <th>{t('common.status')}</th>
                                <th>{t('diseases.severity')}</th>
                                <th>{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(record => (
                                <tr
                                    key={record.id}
                                    onClick={() => onRecordClick?.(record)}
                                    className={onRecordClick ? 'clickable-row' : ''}
                                >
                                    <td className="disease-name">
                                        {record.disease?.name[locale] || record.diseaseId}
                                    </td>
                                    <td>{formatDate(record.diagnosedAt)}</td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(record.status) }}
                                        >
                                            {t(`hiveRecord.diseaseStatus.${record.status}`)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="severity-indicator">
                                            {[1, 2, 3, 4, 5].map(level => (
                                                <span
                                                    key={level}
                                                    className={`severity-dot ${level <= record.severity ? 'active' : ''}`}
                                                    style={{
                                                        backgroundColor: level <= record.severity
                                                            ? (record.severity >= 4 ? '#ef4444' : '#f59e0b')
                                                            : '#e5e7eb'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        {onRecordClick && (
                                            <button className="view-details-btn">
                                                {t('common.details')}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
