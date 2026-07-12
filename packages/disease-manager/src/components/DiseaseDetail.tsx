/**
 * مكون تفاصيل المرض
 * Disease Detail Component
 */

import React from 'react';
import { Disease } from '../types/disease';
import { useTranslation } from '../i18n';
import './DiseaseDetail.css';

export interface DiseaseDetailProps {
  /** المرض المراد عرضه - Disease to display */
  disease: Disease;
  /** عرض الصور - Show images */
  showImages?: boolean;
  /** عرض الأعراض المفصلة - Show detailed symptoms */
  showDetailedSymptoms?: boolean;
  /** عرض إجراءات الوقاية - Show prevention measures */
  showPrevention?: boolean;
  /** عرض المعلومات الإحصائية - Show statistics */
  showStatistics?: boolean;
  /** دالة عند الإغلاق - On close handler */
  onClose?: () => void;
  /** الفئة CSS - CSS class */
  className?: string;
}

/**
 * مكون لعرض تفاصيل مرض واحد بشكل كامل
 * Component to display detailed information about a single disease
 */
export const DiseaseDetail: React.FC<DiseaseDetailProps> = ({
  disease,
  showImages = true,
  showDetailedSymptoms = true,
  showPrevention = true,
  showStatistics = true,
  onClose,
  className = '',
}) => {
  const { t, locale } = useTranslation();

  return (
    <div className={`disease-detail ${className}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="disease-detail__header">
        <div className="disease-detail__header-content">
          <h1 className="disease-detail__title">{disease.name[locale]}</h1>
          <div className="disease-detail__badges">
            <span className={`disease-detail__severity severity-${disease.severity}`}>
              {t('diseases.severity')}: {disease.severity}/5
            </span>
            <span className="disease-detail__category">
              {t(`diseases.categories.${disease.category}`)}
            </span>
            {disease.contagiousness && (
              <span className="disease-detail__badge disease-detail__badge--contagious">
                {t('diseases.contagious')}
              </span>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="disease-detail__close"
            aria-label={t('common.close')}
          >
            ×
          </button>
        )}
      </div>

      {/* Description */}
      <div className="disease-detail__section">
        <h2 className="disease-detail__section-title">{t('diseases.description')}</h2>
        <p className="disease-detail__description">{disease.description[locale]}</p>
      </div>

      {/* Images */}
      {showImages && disease.images && disease.images.length > 0 && (
        <div className="disease-detail__section">
          <h2 className="disease-detail__section-title">{t('diseases.images')}</h2>
          <div className="disease-detail__images">
            {disease.images.map((image, index) => (
              <div key={index} className="disease-detail__image-wrapper">
                <img
                  src={image.url}
                  alt={image.description?.[locale] || disease.name[locale]}
                  className="disease-detail__image"
                />
                {image.description && (
                  <p className="disease-detail__image-caption">
                    {image.description[locale]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms */}
      {showDetailedSymptoms && disease.symptoms.length > 0 && (
        <div className="disease-detail__section">
          <h2 className="disease-detail__section-title">{t('diseases.symptoms')}</h2>
          <div className="disease-detail__symptoms">
            {disease.symptoms.map((symptom, index) => (
              <div key={index} className="disease-detail__symptom">
                <div className="disease-detail__symptom-header">
                  <h3 className="disease-detail__symptom-name">
                    {symptom.description[locale]}
                  </h3>
                  <span className={`disease-detail__symptom-severity severity-${symptom.severity}`}>
                    {symptom.severity}/5
                  </span>
                </div>
                <p className="disease-detail__symptom-description">
                  {symptom.description[locale]}
                </p>
                {/* Symptom stage is not in the type definition, removing for now */
                /*
                {symptom.stage && (
                  <p className="disease-detail__symptom-stage">
                    <strong>{t('diseases.stage')}:</strong> {symptom.stage[locale]}
                  </p>
                )}
                */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Causes */}
      {disease.causes && disease.causes.length > 0 && (
        <div className="disease-detail__section">
          <h2 className="disease-detail__section-title">{t('diseases.causes')}</h2>
          <ul className="disease-detail__list">
            {disease.causes.map((cause, index) => (
              <li key={index}>{cause[locale]}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prevention */}
      {showPrevention && disease.preventionMeasures && disease.preventionMeasures.length > 0 && (
        <div className="disease-detail__section">
          <h2 className="disease-detail__section-title">{t('diseases.prevention')}</h2>
          <ul className="disease-detail__list disease-detail__list--prevention">
            {disease.preventionMeasures.map((measure, index) => (
              <li key={index}>{measure[locale]}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Seasonality */}
      {disease.seasonality && disease.seasonality.length > 0 && (
        <div className="disease-detail__section">
          <h2 className="disease-detail__section-title">{t('diseases.seasonality')}</h2>
          <div className="disease-detail__seasons">
            {disease.seasonality.map((season, index) => (
              <span key={index} className="disease-detail__season">
                {t(`common.seasons.${season}`)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Geographic Regions */}
      {disease.regions && disease.regions.length > 0 && (
        <div className="disease-detail__section">
          <h2 className="disease-detail__section-title">{t('diseases.regions')}</h2>
          <div className="disease-detail__regions">
            {disease.regions.map((region, index) => (
              <span key={index} className="disease-detail__region">
                {region}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      {showStatistics && (
        <div className="disease-detail__section">
          <h2 className="disease-detail__section-title">{t('diseases.statistics')}</h2>
          <div className="disease-detail__stats">
            {disease.prevalence !== undefined && (
              <div className="disease-detail__stat">
                <span className="disease-detail__stat-label">
                  {t('diseases.prevalenceRate')}:
                </span>
                <span className="disease-detail__stat-value">
                  {(disease.prevalence * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {disease.mortalityRate !== undefined && (
              <div className="disease-detail__stat">
                <span className="disease-detail__stat-label">
                  {t('diseases.mortalityRate')}:
                </span>
                <span className="disease-detail__stat-value">
                  {disease.mortalityRate}%
                </span>
              </div>
            )}
            {disease.incubationPeriod && (
              <div className="disease-detail__stat">
                <span className="disease-detail__stat-label">
                  {t('diseases.incubationPeriod')}:
                </span>
                <span className="disease-detail__stat-value">
                  {disease.incubationPeriod.min}-{disease.incubationPeriod.max} {t('common.days')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetail;
