/**
 * TreatmentHistoryList Component
 * 
 * القائمة التاريخية للعلاجات
 * يعرض سجل العلاجات المطبقة مع التفاصيل والتكلفة
 */

import React, { useState, useMemo } from 'react';
import { useI18n } from '../i18n';
import { useHiveRecord } from '../hooks/useHiveRecord';
import type { TreatmentRecord } from '../types/hive-record';
import './TreatmentHistoryList.css';

export interface TreatmentHistoryListProps {
    hiveId: string;
    onRecordClick?: (record: TreatmentRecord) => void;
    className?: string;
}

export const TreatmentHistoryList: React.FC<TreatmentHistoryListProps> = ({
    hiveId,
    onRecordClick,
    className = '',
}) => {
    const { t, locale, direction: dir } = useI18n();
    const { treatments, loading, error } = useHiveRecord({ hiveId });

    // فلاتر
    const [searchTerm, setSearchTerm] = useState('');

    // تصفية السجلات
    const filteredRecords = useMemo(() => {
        return treatments.filter(record => {
            if (searchTerm) {
                const name = record.treatment?.name[locale] || record.treatmentId;
                return name.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        }).sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
    }, [treatments, searchTerm, locale]);

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    if (loading) {
        return <div className="treatment-history-loading">{t('common.loading')}</div>;
    }

    if (error) {
        return <div className="treatment-history-error">{t('common.error')}: {error.message}</div>;
    }

    return (
        <div className={`treatment-history-list ${className}`} dir={dir}>
            <div className="treatment-history-header">
                <h3>{t('hiveRecord.treatmentHistory')}</h3>
                <div className="treatment-search">
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="treatment-history-content">
                {filteredRecords.length === 0 ? (
                    <div className="no-records">{t('hiveRecord.noRecords')}</div>
                ) : (
                    <div className="treatment-cards">
                        {filteredRecords.map(record => (
                            <div
                                key={record.id}
                                className={`treatment-card ${onRecordClick ? 'clickable' : ''}`}
                                onClick={() => onRecordClick?.(record)}
                            >
                                <div className="treatment-card-header">
                                    <span className="treatment-name">
                                        {record.treatment?.name[locale] || record.treatmentId}
                                    </span>
                                    <span className="treatment-date">
                                        {formatDate(record.appliedAt)}
                                    </span>
                                </div>

                                <div className="treatment-card-body">
                                    <div className="info-row">
                                        <span className="info-label">{t('hiveRecord.dosage')}:</span>
                                        <span className="info-value">{record.dosage}</span>
                                    </div>

                                    <div className="info-row">
                                        <span className="info-label">{t('hiveRecord.method')}:</span>
                                        <span className="info-value">{record.method}</span>
                                    </div>

                                    {record.cost && (
                                        <div className="info-row">
                                            <span className="info-label">{t('diseases.cost')}:</span>
                                            <span className="info-value cost-value">
                                                {record.cost.amount} {record.cost.currency}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {record.notes && (
                                    <div className="treatment-notes">
                                        {record.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
