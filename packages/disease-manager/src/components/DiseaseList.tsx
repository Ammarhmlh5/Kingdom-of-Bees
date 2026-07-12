/**
 * مكون قائمة الأمراض
 * Disease List Component
 */

import React, { useState, useMemo } from 'react';
import { diseaseService } from '../services/DiseaseService';
import { Disease, DiseaseCategory, SeverityLevel, Symptom } from '../types/disease';
import { useTranslation } from '../i18n';

export interface DiseaseListProps {
  /** فلترة حسب الفئة - Filter by category */
  category?: DiseaseCategory;
  /** فلترة حسب مستوى الخطورة - Filter by severity */
  minSeverity?: SeverityLevel;
  /** نص البحث - Search text */
  searchQuery?: string;
  /** دالة عند النقر على مرض - On disease click handler */
  onDiseaseClick?: (disease: Disease) => void;
  /** عرض الصور - Show images */
  showImages?: boolean;
  /** عرض الأعراض - Show symptoms */
  showSymptoms?: boolean;
  /** الفئة CSS - CSS class */
  className?: string;
}

/**
 * مكون لعرض قائمة الأمراض مع إمكانية البحث والفلترة
 * Component to display a list of diseases with search and filter capabilities
 */

export const DiseaseList: React.FC<DiseaseListProps> = ({
  category,
  minSeverity,
  searchQuery = '',
  onDiseaseClick,
  showImages = false,
  showSymptoms = false,
  className = '',
}) => {
  const { t, locale } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<DiseaseCategory | undefined>(category);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | undefined>(minSeverity);
  const [search, setSearch] = useState(searchQuery);

  // الحصول على الأمراض المفلترة
  const diseases = useMemo(() => {
    let result = diseaseService.getDiseases({
      category: selectedCategory,
      severity: selectedSeverity, // DiseaseFilter expects severity, checking if it supports minSeverity
      search: search, // Changed from searchText to search as per DiseaseFilter type
    });

    return result;
  }, [selectedCategory, selectedSeverity, search]);

  // الحصول على إحصائيات
  const stats = useMemo(() => {
    return diseaseService.getStatistics();
  }, []);

  return (
    <div className={`disease-list ${className}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* الفلاتر */}
      <div className="disease-list__filters">
        <div className="disease-list__filter-group">
          <label htmlFor="search">{t('common.search')}</label>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('diseases.searchPlaceholder')}
            className="disease-list__search"
          />
        </div>

        <div className="disease-list__filter-group">
          <label htmlFor="category">{t('diseases.category')}</label>
          <select
            id="category"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value as DiseaseCategory || undefined)}
            className="disease-list__select"
          >
            <option value="">{t('common.all')}</option>
            <option value="brood">{t('diseases.categories.brood')}</option>
            <option value="adult">{t('diseases.categories.adult')}</option>
            <option value="parasite">{t('diseases.categories.parasite')}</option>
            <option value="virus">{t('diseases.categories.virus')}</option>
            <option value="queen">{t('diseases.categories.queen')}</option>
          </select>
        </div>

        <div className="disease-list__filter-group">
          <label htmlFor="severity">{t('diseases.severity')}</label>
          <select
            id="severity"
            value={selectedSeverity || ''}
            onChange={(e) => setSelectedSeverity(e.target.value ? Number(e.target.value) as unknown as SeverityLevel : undefined)}
            className="disease-list__select"
          >
            <option value="">{t('common.all')}</option>
            <option value="1">1 - {t('diseases.severityLevels.low')}</option>
            <option value="2">2 - {t('diseases.severityLevels.moderate')}</option>
            <option value="3">3 - {t('diseases.severityLevels.high')}</option>
            <option value="4">4 - {t('diseases.severityLevels.veryHigh')}</option>
            <option value="5">5 - {t('diseases.severityLevels.critical')}</option>
          </select>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="disease-list__stats">
        <span>{t('diseases.total')}: {stats.total}</span>
        <span>{t('diseases.showing')}: {diseases.length}</span>
      </div>

      {/* قائمة الأمراض */}
      <div className="disease-list__items">
        {diseases.length === 0 ? (
          <div className="disease-list__empty">
            {t('diseases.noResults')}
          </div>
        ) : (
          diseases.map((disease) => (
            <div
              key={disease.id}
              className="disease-list__item"
              onClick={() => onDiseaseClick?.(disease)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onDiseaseClick?.(disease);
                }
              }}
            >
              <div className="disease-list__item-header">
                <h3 className="disease-list__item-title">
                  {disease.name[locale]}
                </h3>
                <span className={`disease-list__item-severity severity-${(disease as any).severity}`}>
                  {(disease as any).severity}/5
                </span>
              </div>

              <p className="disease-list__item-description">
                {disease.description[locale]}
              </p>

              <div className="disease-list__item-meta">
                <span className="disease-list__item-category">
                  {t(`diseases.categories.${disease.category}`)}
                </span>
                {/* disease.contagious might be missing, checking type definition first */
                  (disease as any).contagious && (
                    <span className="disease-list__item-badge disease-list__item-badge--contagious">
                      {t('diseases.contagious')}
                    </span>
                  )}
              </div>

              {showSymptoms && disease.symptoms.length > 0 && (
                <div className="disease-list__item-symptoms">
                  <strong>{t('diseases.symptoms')}:</strong>
                  <ul>
                    {disease.symptoms.slice(0, 3).map((symptom: Symptom, index: number) => (
                      <li key={index}>{symptom.description[locale]}</li>
                    ))}
                    {disease.symptoms.length > 3 && (
                      <li>... {t('common.andMore', { count: disease.symptoms.length - 3 })}</li>
                    )}
                  </ul>
                </div>
              )}

              {showImages && disease.images && disease.images.length > 0 && (
                <div className="disease-list__item-images">
                  {disease.images.slice(0, 3).map((image: any, index: number) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={image.caption?.[locale] || disease.name[locale]}
                      className="disease-list__item-image"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiseaseList;
