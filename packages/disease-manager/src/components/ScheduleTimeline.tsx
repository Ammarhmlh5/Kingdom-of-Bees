/**
 * Schedule Timeline Component
 * مكون عرض الجدول الزمني للعلاجات
 */

import React from 'react';
import { TreatmentSchedule, ScheduledDose } from '../types/schedule';
import { useI18n } from '../i18n/I18nContext';
import './ScheduleTimeline.css';

export interface ScheduleTimelineProps {
  /** الجداول */
  schedules: TreatmentSchedule[];
  /** دالة عند النقر على جدول */
  onScheduleClick?: (schedule: TreatmentSchedule) => void;
  /** دالة عند النقر على جرعة */
  onDoseClick?: (schedule: TreatmentSchedule, dose: ScheduledDose) => void;
  /** إظهار الجداول الملغاة */
  showCancelled?: boolean;
  /** إظهار الجداول المكتملة */
  showCompleted?: boolean;
}

/**
 * مكون عرض الجدول الزمني للعلاجات
 */
export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  schedules,
  onScheduleClick,
  onDoseClick,
  showCancelled = false,
  showCompleted = true,
}) => {
  const { t, locale, direction } = useI18n();


  // فلترة الجداول
  const filteredSchedules = schedules.filter(schedule => {
    if (!showCancelled && schedule.status === 'cancelled') return false;
    if (!showCompleted && schedule.status === 'completed') return false;
    return true;
  });

  // ترتيب حسب تاريخ البدء
  const sortedSchedules = [...filteredSchedules].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'paused':
        return 'status-paused';
      default:
        return '';
    }
  };

  const getDoseStatusClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'dose-pending';
      case 'completed':
        return 'dose-completed';
      case 'overdue':
        return 'dose-overdue';
      case 'cancelled':
        return 'dose-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale);
  };

  if (sortedSchedules.length === 0) {
    return (
      <div className="schedule-timeline" dir={direction}>
        <div className="empty-state">
          <p>{t('treatments.noSchedules')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-timeline" dir={direction}>
      <h2 className="timeline-title">{t('treatments.scheduleTimeline')}</h2>

      <div className="timeline-container">
        {sortedSchedules.map(schedule => (
          <div
            key={schedule.id}
            className={`timeline-item ${getStatusClass(schedule.status)}`}
            onClick={() => onScheduleClick?.(schedule)}
          >
            {/* رأس الجدول */}
            <div className="schedule-header">
              <div className="schedule-info">
                <h3 className="schedule-name">
                  {schedule.treatment.name[locale]}
                </h3>
                <span className={`schedule-status ${getStatusClass(schedule.status)}`}>
                  {t(`treatments.status.${schedule.status}`)}
                </span>
              </div>
              <div className="schedule-dates">
                <span className="date-label">{t('treatments.startDate')}:</span>
                <span className="date-value">{formatDate(schedule.startDate)}</span>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="schedule-details">
              <div className="detail-item">
                <span className="detail-label">{t('treatments.totalDoses')}:</span>
                <span className="detail-value">{schedule.doses.length}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('treatments.completedDoses')}:</span>
                <span className="detail-value">
                  {schedule.doses.filter(d => d.status === 'completed').length}
                </span>
              </div>
              {schedule.safetyPeriodDays > 0 && (
                <div className="detail-item">
                  <span className="detail-label">{t('treatments.safetyPeriod')}:</span>
                  <span className="detail-value">
                    {schedule.safetyPeriodDays} {t('common.days')}
                  </span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">{t('treatments.totalCost')}:</span>
                <span className="detail-value">
                  {schedule.totalCost} {schedule.treatment.cost?.currency || 'USD'}
                </span>
              </div>
            </div>

            {/* الجرعات */}
            <div className="doses-container">
              <h4 className="doses-title">{t('treatments.doses')}</h4>
              <div className="doses-grid">
                {schedule.doses.map(dose => (
                  <div
                    key={dose.id}
                    className={`dose-item ${getDoseStatusClass(dose.status)}`}
                    onClick={e => {
                      e.stopPropagation();
                      onDoseClick?.(schedule, dose);
                    }}
                  >
                    <div className="dose-number">
                      {t('treatments.dose')} {dose.doseNumber}
                    </div>
                    <div className="dose-date">{formatDate(dose.scheduledDate)}</div>
                    <div className={`dose-status ${getDoseStatusClass(dose.status)}`}>
                      {t(`treatments.doseStatus.${dose.status}`)}
                    </div>
                    {dose.completedDate && (
                      <div className="dose-completed-date">
                        ✓ {formatDate(dose.completedDate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ملاحظات */}
            {schedule.notes && (
              <div className="schedule-notes">
                <span className="notes-label">{t('common.notes')}:</span>
                <span className="notes-value">{schedule.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
