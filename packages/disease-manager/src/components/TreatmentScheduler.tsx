/**
 * Treatment Scheduler Component
 * مكون جدولة العلاجات
 */

import React, { useState } from 'react';
import { Treatment } from '../types/treatment';
import { CreateScheduleOptions } from '../types/schedule';
import { useI18n } from '../i18n/I18nContext';
import './TreatmentScheduler.css';

export interface TreatmentSchedulerProps {
  /** معرف الخلية */
  hiveId: string;
  /** العلاجات المتاحة */
  treatments: Treatment[];
  /** دالة عند إنشاء الجدول */
  onSchedule: (options: CreateScheduleOptions) => void;
  /** دالة عند الإلغاء */
  onCancel?: () => void;
  /** معرف المستخدم */
  userId: string;
  /** إظهار زر الإلغاء */
  showCancelButton?: boolean;
}

/**
 * مكون جدولة علاج جديد
 */
export const TreatmentScheduler: React.FC<TreatmentSchedulerProps> = ({
  hiveId,
  treatments,
  onSchedule,
  onCancel,
  userId,
  showCancelButton = true,
}) => {
  const { t, locale, direction } = useI18n();


  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [numberOfDoses, setNumberOfDoses] = useState<number>(1);
  const [intervalDays, setIntervalDays] = useState<number>(7);
  const [notes, setNotes] = useState<string>('');

  const selectedTreatment = treatments.find(t => t.id === selectedTreatmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTreatmentId) {
      alert(t('treatments.selectTreatment'));
      return;
    }

    const options: CreateScheduleOptions = {
      hiveId,
      treatmentId: selectedTreatmentId,
      startDate: new Date(startDate),
      numberOfDoses,
      intervalDays,
      notes: notes.trim() || undefined,
      userId,
    };

    onSchedule(options);
  };

  return (
    <div className="treatment-scheduler" dir={direction}>
      <h2 className="scheduler-title">{t('treatments.scheduleNew')}</h2>

      <form onSubmit={handleSubmit} className="scheduler-form">
        {/* اختيار العلاج */}
        <div className="form-group">
          <label htmlFor="treatment-select" className="form-label">
            {t('treatments.treatment')} *
          </label>
          <select
            id="treatment-select"
            value={selectedTreatmentId}
            onChange={e => setSelectedTreatmentId(e.target.value)}
            className="form-select"
            required
          >
            <option value="">{t('treatments.selectTreatment')}</option>
            {treatments.map(treatment => (
              <option key={treatment.id} value={treatment.id}>
                {treatment.name[locale]}
              </option>
            ))}
          </select>
        </div>

        {/* معلومات العلاج المختار */}
        {selectedTreatment && (
          <div className="treatment-info">
            <h3>{t('treatments.treatmentInfo')}</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t('treatments.type')}:</span>
                <span className="info-value">
                  {t(`treatments.types.${selectedTreatment.type}`)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('treatments.dosage')}:</span>
                <span className="info-value">
                  {selectedTreatment.dosage.amount}{' '}
                  {selectedTreatment.dosage.unit}
                </span>
              </div>
              {selectedTreatment.safetyPeriod && (
                <div className="info-item">
                  <span className="info-label">
                    {t('treatments.safetyPeriod')}:
                  </span>
                  <span className="info-value">
                    {selectedTreatment.safetyPeriod.days}{' '}
                    {t('common.days')}
                  </span>
                </div>
              )}
              {selectedTreatment.cost && (
                <div className="info-item">
                  <span className="info-label">{t('treatments.cost')}:</span>
                  <span className="info-value">
                    {selectedTreatment.cost.price}{' '}
                    {selectedTreatment.cost.currency}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* تاريخ البدء */}
        <div className="form-group">
          <label htmlFor="start-date" className="form-label">
            {t('treatments.startDate')} *
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* عدد الجرعات */}
        <div className="form-group">
          <label htmlFor="number-of-doses" className="form-label">
            {t('treatments.numberOfDoses')} *
          </label>
          <input
            type="number"
            id="number-of-doses"
            value={numberOfDoses}
            onChange={e => setNumberOfDoses(parseInt(e.target.value) || 1)}
            min="1"
            max="100"
            className="form-input"
            required
          />
        </div>

        {/* الفترة بين الجرعات */}
        <div className="form-group">
          <label htmlFor="interval-days" className="form-label">
            {t('treatments.intervalDays')} *
          </label>
          <input
            type="number"
            id="interval-days"
            value={intervalDays}
            onChange={e => setIntervalDays(parseInt(e.target.value) || 1)}
            min="1"
            max="365"
            className="form-input"
            required
          />
        </div>

        {/* ملاحظات */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            {t('common.notes')}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder={t('treatments.notesPlaceholder')}
          />
        </div>

        {/* الأزرار */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {t('treatments.schedule')}
          </button>
          {showCancelButton && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
