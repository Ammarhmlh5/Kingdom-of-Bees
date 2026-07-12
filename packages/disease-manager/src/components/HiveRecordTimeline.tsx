/**
 * Hive Record Timeline Component
 * 
 * مكون لعرض الخط الزمني لسجل الخلية
 * يعرض الأمراض، العلاجات، والفحوصات في ترتيب زمني
 */

import React, { useMemo } from 'react';
import { useI18n } from '../i18n';
import { useHiveRecord } from '../hooks/useHiveRecord';
import type {
  DiseaseRecord,
  TreatmentRecord,
  InspectionRecord,
  HiveCondition,
} from '../types/hive-record';
import './HiveRecordTimeline.css';

export interface HiveRecordTimelineProps {
  hiveId: string;
  showDiseases?: boolean;
  showTreatments?: boolean;
  showInspections?: boolean;
  maxItems?: number;
  onDiseaseClick?: (disease: DiseaseRecord) => void;
  onTreatmentClick?: (treatment: TreatmentRecord) => void;
  onInspectionClick?: (inspection: InspectionRecord) => void;
}

type TimelineEvent = {
  id: string;
  type: 'disease' | 'treatment' | 'inspection';
  date: Date;
  data: DiseaseRecord | TreatmentRecord | InspectionRecord;
};

export const HiveRecordTimeline: React.FC<HiveRecordTimelineProps> = ({
  hiveId,
  showDiseases = true,
  showTreatments = true,
  showInspections = true,
  maxItems,
  onDiseaseClick,
  onTreatmentClick,
  onInspectionClick,
}) => {
  const { t, locale, direction } = useI18n();
  const {
    diseases,
    treatments,
    inspections,
    loading,
    error,
  } = useHiveRecord({ hiveId });

  // Combine all events into timeline
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    if (showDiseases) {
      diseases.forEach(disease => {
        events.push({
          id: disease.id,
          type: 'disease',
          date: disease.diagnosedAt,
          data: disease,
        });
      });
    }

    if (showTreatments) {
      treatments.forEach(treatment => {
        events.push({
          id: treatment.id,
          type: 'treatment',
          date: treatment.appliedAt,
          data: treatment,
        });
      });
    }

    if (showInspections) {
      inspections.forEach(inspection => {
        events.push({
          id: inspection.id,
          type: 'inspection',
          date: inspection.inspectedAt,
          data: inspection,
        });
      });
    }

    // Sort by date (newest first)
    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Limit items if specified
    if (maxItems && maxItems > 0) {
      return events.slice(0, maxItems);
    }

    return events;
  }, [diseases, treatments, inspections, showDiseases, showTreatments, showInspections, maxItems]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getConditionColor = (condition: HiveCondition): string => {
    const colors: Record<HiveCondition, string> = {
      excellent: '#10b981',
      good: '#3b82f6',
      fair: '#f59e0b',
      poor: '#ef4444',
      critical: '#dc2626',
    };
    return colors[condition];
  };

  const renderEvent = (event: TimelineEvent) => {
    const handleClick = () => {
      if (event.type === 'disease' && onDiseaseClick) {
        onDiseaseClick(event.data as DiseaseRecord);
      } else if (event.type === 'treatment' && onTreatmentClick) {
        onTreatmentClick(event.data as TreatmentRecord);
      } else if (event.type === 'inspection' && onInspectionClick) {
        onInspectionClick(event.data as InspectionRecord);
      }
    };

    const isClickable =
      (event.type === 'disease' && onDiseaseClick) ||
      (event.type === 'treatment' && onTreatmentClick) ||
      (event.type === 'inspection' && onInspectionClick);

    return (
      <div
        key={event.id}
        className={`timeline-event timeline-event--${event.type} ${isClickable ? 'timeline-event--clickable' : ''}`}
        onClick={isClickable ? handleClick : undefined}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <div className="timeline-event__marker">
          <div className={`timeline-event__icon timeline-event__icon--${event.type}`}>
            {event.type === 'disease' && '🦠'}
            {event.type === 'treatment' && '💊'}
            {event.type === 'inspection' && '🔍'}
          </div>
        </div>

        <div className="timeline-event__content">
          <div className="timeline-event__header">
            <span className="timeline-event__type">
              {t(`hiveRecord.${event.type}History`)}
            </span>
            <span className="timeline-event__date">
              {formatDate(event.date)}
            </span>
          </div>

          {event.type === 'disease' && renderDiseaseEvent(event.data as DiseaseRecord)}
          {event.type === 'treatment' && renderTreatmentEvent(event.data as TreatmentRecord)}
          {event.type === 'inspection' && renderInspectionEvent(event.data as InspectionRecord)}
        </div>
      </div>
    );
  };

  const renderDiseaseEvent = (disease: DiseaseRecord) => (
    <div className="timeline-event__details">
      <div className="timeline-event__title">
        {disease.disease?.name[locale] || disease.diseaseId}
      </div>
      <div className="timeline-event__meta">
        <span className={`status-badge status-badge--${disease.status}`}>
          {t(`hiveRecord.diseaseStatus.${disease.status}`)}
        </span>
        <span className="severity-badge">
          {t('diseases.severity')}: {disease.severity}/5
        </span>
      </div>
      {disease.notes && (
        <div className="timeline-event__notes">{disease.notes}</div>
      )}
    </div>
  );

  const renderTreatmentEvent = (treatment: TreatmentRecord) => (
    <div className="timeline-event__details">
      <div className="timeline-event__title">
        {treatment.treatment?.name[locale] || treatment.treatmentId}
      </div>
      <div className="timeline-event__meta">
        <span className="info-badge">
          {t('hiveRecord.dosage')}: {treatment.dosage}
        </span>
        {treatment.cost && (
          <span className="info-badge">
            {treatment.cost.amount} {treatment.cost.currency}
          </span>
        )}
      </div>
      {treatment.notes && (
        <div className="timeline-event__notes">{treatment.notes}</div>
      )}
    </div>
  );

  const renderInspectionEvent = (inspection: InspectionRecord) => (
    <div className="timeline-event__details">
      <div className="timeline-event__title">
        {t('hiveRecord.inspectionHistory')}
      </div>
      <div className="timeline-event__meta">
        <span
          className="condition-badge"
          style={{ backgroundColor: getConditionColor(inspection.condition) }}
        >
          {t(`hiveRecord.hiveCondition.${inspection.condition}`)}
        </span>
        {inspection.duration && (
          <span className="info-badge">
            {inspection.duration} {t('time.minutes.other', { count: inspection.duration })}
          </span>
        )}
      </div>
      {inspection.notes && (
        <div className="timeline-event__notes">{inspection.notes}</div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="hive-record-timeline" dir={direction}>
        <div className="timeline-loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hive-record-timeline" dir={direction}>
        <div className="timeline-error">{t('common.error')}: {error.message}</div>
      </div>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="hive-record-timeline" dir={direction}>
        <div className="timeline-empty">{t('hiveRecord.noRecords')}</div>
      </div>
    );
  }

  return (
    <div className="hive-record-timeline" dir={direction}>
      <div className="timeline-line" />
      <div className="timeline-events">
        {timelineEvents.map(event => renderEvent(event))}
      </div>
    </div>
  );
};
