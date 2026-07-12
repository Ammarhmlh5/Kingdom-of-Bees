/**
 * ReportGenerator Component
 * 
 * مولد التقارير
 * واجهة لتوليد وتصدير تقارير الخلية
 */

import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { useHiveRecord } from '../hooks/useHiveRecord';
import { useDiseaseManager } from '../hooks/useDiseaseManager';
import type { ReportOptions, ReportType } from '../types/hive-record';
import './ReportGenerator.css';

export interface ReportGeneratorProps {
    hiveId: string;
    className?: string;
    onGenerate?: (report: any) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
    hiveId,
    className = '',
    onGenerate,
}) => {
    const { t, direction: dir } = useI18n();
    const { generateReport, loading } = useHiveRecord({ hiveId });
    const { state } = useDiseaseManager();

    const [options, setOptions] = useState<ReportOptions>({
        type: 'monthly',
        format: 'pdf',
        includeDiseases: true,
        includeTreatments: true,
        includeInspections: true,
        includeStatistics: true,
        includeImages: false,
        includeNotes: true,
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const userId = state.userId || 'current-user';
            const report = await generateReport(options, userId);
            if (onGenerate) {
                onGenerate(report);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOptionChange = (key: keyof ReportOptions, value: any) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className={`report-generator ${className}`} dir={dir}>
            <h3>{t('hiveRecord.generateReport')}</h3>

            <div className="report-form">
                <div className="form-group">
                    <label>{t('hiveRecord.reportType.label')}</label>
                    <select
                        value={options.type}
                        onChange={(e) => handleOptionChange('type', e.target.value as ReportType)}
                        className="form-select"
                    >
                        <option value="daily">{t('hiveRecord.reportType.daily')}</option>
                        <option value="weekly">{t('hiveRecord.reportType.weekly')}</option>
                        <option value="monthly">{t('hiveRecord.reportType.monthly')}</option>
                        <option value="quarterly">{t('hiveRecord.reportType.quarterly')}</option>
                        <option value="yearly">{t('hiveRecord.reportType.yearly')}</option>
                        <option value="custom">{t('hiveRecord.reportType.custom')}</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>{t('hiveRecord.reportFormat.label')}</label>
                    <div className="format-options">
                        <label className="radio-label">
                            <input
                                type="radio"
                                checked={options.format === 'pdf'}
                                onChange={() => handleOptionChange('format', 'pdf')}
                            />
                            PDF
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                checked={options.format === 'csv'}
                                onChange={() => handleOptionChange('format', 'csv')}
                            />
                            CSV
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                checked={options.format === 'json'}
                                onChange={() => handleOptionChange('format', 'json')}
                            />
                            JSON
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label>{t('hiveRecord.sections')}</label>
                    <div className="checkbox-grid">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={options.includeDiseases}
                                onChange={(e) => handleOptionChange('includeDiseases', e.target.checked)}
                            />
                            {t('hiveRecord.diseaseHistory')}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={options.includeTreatments}
                                onChange={(e) => handleOptionChange('includeTreatments', e.target.checked)}
                            />
                            {t('hiveRecord.treatmentHistory')}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={options.includeInspections}
                                onChange={(e) => handleOptionChange('includeInspections', e.target.checked)}
                            />
                            {t('hiveRecord.inspectionHistory')}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={options.includeStatistics}
                                onChange={(e) => handleOptionChange('includeStatistics', e.target.checked)}
                            />
                            {t('hiveRecord.statistics.title')}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={options.includeImages}
                                onChange={(e) => handleOptionChange('includeImages', e.target.checked)}
                            />
                            {t('hiveRecord.images')}
                        </label>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={options.includeNotes}
                                onChange={(e) => handleOptionChange('includeNotes', e.target.checked)}
                            />
                            {t('hiveRecord.notes')}
                        </label>
                    </div>
                </div>

                {error && <div className="report-error">{error}</div>}

                <button
                    className="generate-btn"
                    onClick={handleGenerate}
                    disabled={isGenerating || loading}
                >
                    {isGenerating ? t('common.loading') : t('hiveRecord.generate')}
                </button>
            </div>
        </div>
    );
};
