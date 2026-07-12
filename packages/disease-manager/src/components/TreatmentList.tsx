/**
 * مكون قائمة العلاجات
 * Treatment List Component
 */

import React, { useState, useMemo } from 'react';
import { TreatmentService } from '../services/TreatmentService';
import { Treatment, TreatmentType, ApplicationMethod } from '../types/treatment';
import { useTranslation } from '../i18n';
import './TreatmentList.css';

export interface TreatmentListProps {
  /** فلترة حسب النوع - Filter by type */
  type?: TreatmentType;
  /** فلترة حسب طريقة التطبيق - Filter by application method */
  applicationMethod?: ApplicationMethod;
  /** نص البحث - Search text */
  searchQuery?: string;
  /** دالة عند النقر على علاج - On treatment click handler */
  onTreatmentClick?: (treatment: Treatment) => void;
  /** عرض الجرعات - Show dosages */
  showDosage?: boolean;
  /** عرض التكلفة - Show cost */
  showCost?: boolean;
  /** الفئة CSS - CSS class */
  className?: string;
}

/**
 * مكون لعرض قائمة العلاجات مع إمكانية البحث والفلترة
 * Component to display a list of treatments with search and filter capabilities
 */
export const TreatmentList: React.FC<TreatmentListProps> = ({
  type,
  applicationMethod,
  searchQuery = '',
  onTreatmentClick,
  showDosage = false,
  showCost = false,
  className = '',
}) => {
  const { t, locale } = useTranslation();
  const [selectedType, setSelectedType] = useState<TreatmentType | undefined>(type);
  const [selectedMethod, setSelectedMethod] = useState<ApplicationMethod | undefined>(applicationMethod);
  const [search, setSearch] = useState(searchQuery);

  // الحصول على العلاجات المفلترة
  const treatments = useMemo(() => {
    let result = TreatmentService.getTreatments({
      type: selectedType,
      applicationMethod: selectedMethod,
      searchText: search,
    });

    return result;
  }, [selectedType, selectedMethod, search]);

  // الحصول على إحصائيات
  const stats = useMemo(() => {
    return TreatmentService.getStatistics();
  }, []);

  return (
    <div className={`treatment-list ${className}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* الفلاتر */}
      <div className="treatment-list__filters">
        <div className="treatment-list__filter-group">
          <label htmlFor="search">{t('common.search')}</label>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('treatments.searchPlaceholder')}
            className="treatment-list__search"
          />
        </div>

        <div className="treatment-list__filter-group">
          <label htmlFor="type">{t('treatments.type')}</label>
          <select
            id="type"
            value={selectedType || ''}
            onChange={(e) => setSelectedType(e.target.value as TreatmentType || undefined)}
            className="treatment-list__select"
          >
            <option value="">{t('common.all')}</option>
            <option value="chemical">{t('treatments.types.chemical')}</option>
            <option value="organic">{t('treatments.types.organic')}</option>
            <option value="biological">{t('treatments.types.biological')}</option>
            <option value="mechanical">{t('treatments.types.mechanical')}</option>
          </select>
        </div>

        <div className="treatment-list__filter-group">
          <label htmlFor="method">{t('treatments.applicationMethod')}</label>
          <select
            id="method"
            value={selectedMethod || ''}
            onChange={(e) => setSelectedMethod(e.target.value as ApplicationMethod || undefined)}
            className="treatment-list__select"
          >
            <option value="">{t('common.all')}</option>
            <option value="strip">{t('treatments.methods.strip')}</option>
            <option value="spray">{t('treatments.methods.spray')}</option>
            <option value="fumigation">{t('treatments.methods.fumigation')}</option>
            <option value="feed">{t('treatments.methods.feed')}</option>
            <option value="dusting">{t('treatments.methods.dusting')}</option>
            <option value="manual">{t('treatments.methods.manual')}</option>
          </select>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="treatment-list__stats">
        <span>{t('treatments.total')}: {stats.total}</span>
        <span>{t('treatments.showing')}: {treatments.length}</span>
      </div>

      {/* قائمة العلاجات */}
      <div className="treatment-list__items">
        {treatments.length === 0 ? (
          <div className="treatment-list__empty">
            {t('treatments.noResults')}
          </div>
        ) : (
          treatments.map((treatment) => (
            <div
              key={treatment.id}
              className="treatment-list__item"
              onClick={() => onTreatmentClick?.(treatment)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onTreatmentClick?.(treatment);
                }
              }}
            >
              <div className="treatment-list__item-header">
                <h3 className="treatment-list__item-title">
                  {treatment.name[locale]}
                </h3>
                <span className={`treatment-list__item-effectiveness effectiveness-${Math.round(treatment.effectiveness / 20)}`}>
                  {treatment.effectiveness}%
                </span>
              </div>

              <p className="treatment-list__item-description">
                {treatment.description[locale]}
              </p>

              <div className="treatment-list__item-meta">
                <span className="treatment-list__item-type">
                  {t(`treatments.types.${treatment.type}`)}
                </span>
                <span className="treatment-list__item-method">
                  {t(`treatments.methods.${treatment.applicationMethod}`)}
                </span>
                {treatment.safeForHoney && (
                  <span className="treatment-list__item-badge treatment-list__item-badge--safe">
                    {t('treatments.safeForHoney')}
                  </span>
                )}
              </div>

              {showDosage && treatment.dosage && (
                <div className="treatment-list__item-dosage">
                  <strong>{t('treatments.dosage')}:</strong>
                  <span> {treatment.dosage.amount} {treatment.dosage.unit}</span>
                  {treatment.dosage.frequency && (
                    <span> - {treatment.dosage.frequency} / {t('common.day')}</span>
                  )}
                </div>
              )}

              {showCost && treatment.cost && (
                <div className="treatment-list__item-cost">
                  <strong>{t('treatments.cost')}:</strong>
                  <span> {treatment.cost.price} {treatment.cost.currency}</span>
                  {treatment.cost.perUnit && (
                    <span> / {treatment.cost.perUnit}</span>
                  )}
                </div>
              )}

              {treatment.safetyPeriod && (
                <div className="treatment-list__item-safety">
                  <strong>{t('treatments.safetyPeriod')}:</strong>
                  <span> {treatment.safetyPeriod.days} {t('common.days')}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TreatmentList;
