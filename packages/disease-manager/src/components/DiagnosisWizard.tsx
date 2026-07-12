/**
 * Diagnosis Wizard Component
 * معالج تفاعلي خطوة بخطوة لتشخيص أمراض النحل
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { InputSymptom, DiagnosisResult, AnalysisOptions } from '../types/diagnosis';
import { Disease, DiseaseCategory, Symptom, SeverityLevel } from '../types/disease';
import { useDiseaseManager } from '../hooks/useDiseaseManager';
import './DiagnosisWizard.css';

export interface DiagnosisWizardProps {
  /** معرف الخلية */
  hiveId?: string;

  /** دالة callback عند اكتمال التشخيص */
  onComplete?: (result: DiagnosisResult) => void;

  /** دالة callback عند الإلغاء */
  onCancel?: () => void;

  /** خيارات التشخيص */
  options?: Partial<AnalysisOptions>;

  /** إظهار زر الإلغاء */
  showCancelButton?: boolean;

  /** فئات الأمراض المسموح بها */
  allowedCategories?: DiseaseCategory[];
}

type WizardStep = 'category' | 'symptoms' | 'images' | 'analysis' | 'results';

interface SymptomInput {
  id: string;
  name: { ar: string; en: string; fr?: string };
  severity: number;
}

export const DiagnosisWizard: React.FC<DiagnosisWizardProps> = ({
  hiveId,
  onComplete,
  onCancel,
  options = {},
  showCancelButton = true,
  allowedCategories,
}) => {
  const { t, locale, direction } = useI18n();
  const { diagnosisService, diseaseService } = useDiseaseManager();

  // الحالة
  const [currentStep, setCurrentStep] = useState<WizardStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<DiseaseCategory | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomInput[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // الحصول على الأمراض المتاحة
  const availableDiseases = useMemo(() => {
    const serviceInstance = new diseaseService();
    const diseases = serviceInstance.getDiseases({});
    if (allowedCategories && allowedCategories.length > 0) {
      return diseases.filter((d: Disease) => allowedCategories.includes(d.category));
    }
    return diseases;
  }, [allowedCategories, diseaseService]);

  // الحصول على الأعراض الشائعة للفئة المختارة
  const commonSymptoms = useMemo(() => {
    if (!selectedCategory) return [];

    const diseasesInCategory = availableDiseases.filter((d: Disease) => d.category === selectedCategory);
    const symptomMap = new Map<string, Symptom>();

    diseasesInCategory.forEach((disease: Disease) => {
      disease.symptoms.forEach((symptom: Symptom) => {
        // Use description as name since Symptom interface doesn't have name
        const key = symptom.description[locale] || symptom.description.ar;
        if (!symptomMap.has(key)) {
          symptomMap.set(key, symptom);
        }
      });
    });

    return Array.from(symptomMap.values());
  }, [selectedCategory, availableDiseases, locale]);

  // إضافة عرض
  const addSymptom = useCallback((symptom: Symptom, severity: number) => {
    const newSymptom: SymptomInput = {
      id: `symptom-${Date.now()}`,
      name: symptom.description, // Map description to name
      severity,
    };
    setSymptoms(prev => [...prev, newSymptom]);
  }, []);

  // إزالة عرض
  const removeSymptom = useCallback((id: string) => {
    setSymptoms(prev => prev.filter(s => s.id !== id));
  }, []);

  // تحديث شدة العرض
  const updateSymptomSeverity = useCallback((id: string, severity: number) => {
    setSymptoms(prev => prev.map(s => s.id === id ? { ...s, severity } : s));
  }, []);

  // إضافة صورة
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImages(prev => [...prev, ...Array.from(files)]);
    }
  }, []);

  // إزالة صورة
  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Helper to convert number to SeverityLevel
  const numberToSeverity = (num: number): SeverityLevel => {
    if (num <= 2) return 'low';
    if (num === 3) return 'medium';
    if (num === 4) return 'high';
    return 'critical';
  };

  // تحليل الأعراض
  const analyzeSymptoms = useCallback(async () => {
    if (symptoms.length === 0) {
      setError(t('diagnosis.errors.noSymptoms'));
      return;
    }

    if (!diagnosisService) {
      setError(t('common.error'));
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // 1. Start a session
      const session = await diagnosisService.startSession({
        hiveId: hiveId
      });

      // 2. Add symptoms to the session
      // We manually populate the inputSymptoms since they are part of the session object
      const inputSymptoms: InputSymptom[] = symptoms.map(s => ({
        id: s.id,
        name: s.name,
        severity: numberToSeverity(s.severity),
      }));

      // Update session object locally (mocking adding logic before service update)
      session.inputSymptoms = inputSymptoms;

      // 3. Analyze
      const result = await diagnosisService.analyzeAndSave(session.id, {
        minProbability: 0.1,
        ...options
      });

      if (!result) {
        throw new Error('Analysis yielded no result');
      }

      setResult(result);
      setCurrentStep('results');

      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error(err);
      setError(t('diagnosis.errors.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  }, [symptoms, images, hiveId, t, onComplete, diagnosisService, options]);

  // الانتقال للخطوة التالية
  const nextStep = useCallback(() => {
    switch (currentStep) {
      case 'category':
        if (selectedCategory) {
          setCurrentStep('symptoms');
        }
        break;
      case 'symptoms':
        if (symptoms.length > 0) {
          setCurrentStep('images');
        }
        break;
      case 'images':
        setCurrentStep('analysis');
        break;
      case 'analysis':
        analyzeSymptoms();
        break;
    }
  }, [currentStep, selectedCategory, symptoms, analyzeSymptoms]);

  // الرجوع للخطوة السابقة
  const previousStep = useCallback(() => {
    switch (currentStep) {
      case 'symptoms':
        setCurrentStep('category');
        break;
      case 'images':
        setCurrentStep('symptoms');
        break;
      case 'analysis':
        setCurrentStep('images');
        break;
      case 'results':
        setCurrentStep('analysis');
        break;
    }
  }, [currentStep]);

  // التحقق من إمكانية الانتقال للخطوة التالية
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'category':
        return selectedCategory !== null;
      case 'symptoms':
        return symptoms.length > 0;
      case 'images':
        return true; // الصور اختيارية
      case 'analysis':
        return true;
      default:
        return false;
    }
  }, [currentStep, selectedCategory, symptoms]);

  // عرض خطوة اختيار الفئة
  const renderCategoryStep = () => (
    <div className="wizard-step">
      <h3>{t('diagnosis.wizard.selectCategory')}</h3>
      <p className="step-description">{t('diagnosis.wizard.categoryDescription')}</p>

      <div className="category-grid">
        {(['brood', 'adult', 'parasite', 'virus', 'queen'] as DiseaseCategory[]).map(category => {
          if (allowedCategories && !allowedCategories.includes(category)) {
            return null;
          }

          return (
            <button
              key={category}
              className={`category-card ${selectedCategory === category ? 'selected' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <div className="category-icon">{getCategoryIcon(category)}</div>
              <div className="category-name">{t(`diseases.categories.${category}`)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // عرض خطوة إدخال الأعراض
  const renderSymptomsStep = () => (
    <div className="wizard-step">
      <h3>{t('diagnosis.wizard.selectSymptoms')}</h3>
      <p className="step-description">{t('diagnosis.wizard.symptomsDescription')}</p>

      {/* الأعراض المضافة */}
      {symptoms.length > 0 && (
        <div className="selected-symptoms">
          <h4>{t('diagnosis.wizard.selectedSymptoms')} ({symptoms.length})</h4>
          <div className="symptoms-list">
            {symptoms.map(symptom => (
              <div key={symptom.id} className="symptom-item">
                <div className="symptom-info">
                  <span className="symptom-name">{symptom.name[locale] || symptom.name.ar}</span>
                  <div className="severity-slider">
                    <label>{t('diagnosis.severity')}: {symptom.severity}/5</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={symptom.severity}
                      onChange={(e) => updateSymptomSeverity(symptom.id, parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <button
                  className="remove-button"
                  onClick={() => removeSymptom(symptom.id)}
                  aria-label={t('common.remove')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الأعراض الشائعة */}
      <div className="common-symptoms">
        <h4>{t('diagnosis.wizard.commonSymptoms')}</h4>
        <div className="symptoms-grid">
          {commonSymptoms.map((symptom, index) => {
            const isAdded = symptoms.some(s =>
              s.name[locale] === symptom.description[locale] || s.name.ar === symptom.description.ar
            );

            return (
              <button
                key={index}
                className={`symptom-card ${isAdded ? 'added' : ''}`}
                onClick={() => !isAdded && addSymptom(symptom, 3)}
                disabled={isAdded}
              >
                <div className="symptom-text">{symptom.description[locale] || symptom.description.ar}</div>
                {isAdded && <span className="added-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // عرض خطوة رفع الصور
  const renderImagesStep = () => (
    <div className="wizard-step">
      <h3>{t('diagnosis.wizard.uploadImages')}</h3>
      <p className="step-description">{t('diagnosis.wizard.imagesDescription')}</p>

      {/* الصور المرفوعة */}
      {images.length > 0 && (
        <div className="uploaded-images">
          <h4>{t('diagnosis.wizard.uploadedImages')} ({images.length})</h4>
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={index} className="image-preview">
                <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                <button
                  className="remove-image-button"
                  onClick={() => removeImage(index)}
                  aria-label={t('common.remove')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* زر رفع الصور */}
      <div className="upload-area">
        <label htmlFor="image-upload" className="upload-button">
          <span className="upload-icon">📷</span>
          <span>{t('diagnosis.wizard.addImages')}</span>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <p className="upload-hint">{t('diagnosis.wizard.imagesOptional')}</p>
      </div>
    </div>
  );

  // عرض خطوة التحليل
  const renderAnalysisStep = () => (
    <div className="wizard-step">
      <h3>{t('diagnosis.wizard.reviewAndAnalyze')}</h3>
      <p className="step-description">{t('diagnosis.wizard.analysisDescription')}</p>

      {/* ملخص */}
      <div className="analysis-summary">
        <div className="summary-item">
          <span className="summary-label">{t('diagnosis.wizard.category')}:</span>
          <span className="summary-value">{selectedCategory && t(`diseases.categories.${selectedCategory}`)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">{t('diagnosis.wizard.symptomsCount')}:</span>
          <span className="summary-value">{symptoms.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">{t('diagnosis.wizard.imagesCount')}:</span>
          <span className="summary-value">{images.length}</span>
        </div>
      </div>

      {isAnalyzing && (
        <div className="analyzing-indicator">
          <div className="spinner"></div>
          <p>{t('diagnosis.wizard.analyzing')}</p>
        </div>
      )}
    </div>
  );

  // عرض خطوة النتائج
  const renderResultsStep = () => {
    if (!result) return null;

    return (
      <div className="wizard-step">
        <h3>{t('diagnosis.wizard.results')}</h3>

        <div className="results-container">
          {/* مستوى الخطورة */}
          <div className="severity-indicator">
            <span className="severity-label">{t('diagnosis.overallSeverity')}:</span>
            <div className="severity-bar">
              <div
                className="severity-fill"
                style={{
                  width: getSeverityWidth(result.overallSeverity),
                  backgroundColor: getSeverityColor(result.overallSeverity)
                }}
              />
            </div>
            <span className="severity-value">{t(`diseases.severity.${result.overallSeverity}`)}</span>
          </div>

          {/* مستوى الثقة */}
          <div className="confidence-indicator">
            <span className="confidence-label">{t('diagnosis.confidence')}:</span>
            <span className="confidence-value">{Math.round(result.confidence * 100)}%</span>
          </div>

          {/* التوصيات */}
          {result.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>{t('diagnosis.recommendations')}</h4>
              <ul>
                {result.recommendations.map((rec, index) => (
                  <li key={index} className={`recommendation-${rec.priority}`}>
                    {rec.reasoning[locale] || rec.reasoning.ar}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* الخطوات التالية */}
          {result.nextSteps.length > 0 && (
            <div className="next-steps">
              <h4>{t('diagnosis.nextSteps')}</h4>
              <ol>
                {result.nextSteps.map((step, index) => (
                  <li key={index}>{step[locale] || step.ar}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  };

  // عرض الخطوة الحالية
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'category':
        return renderCategoryStep();
      case 'symptoms':
        return renderSymptomsStep();
      case 'images':
        return renderImagesStep();
      case 'analysis':
        return renderAnalysisStep();
      case 'results':
        return renderResultsStep();
      default:
        return null;
    }
  };

  return (
    <div className="diagnosis-wizard" dir={direction}>
      {/* مؤشر التقدم */}
      <div className="wizard-progress">
        <div className={`progress-step ${currentStep === 'category' ? 'active' : ''} ${['symptoms', 'images', 'analysis', 'results'].includes(currentStep) ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">{t('diagnosis.wizard.category')}</div>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${currentStep === 'symptoms' ? 'active' : ''} ${['images', 'analysis', 'results'].includes(currentStep) ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">{t('diagnosis.wizard.symptoms')}</div>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${currentStep === 'images' ? 'active' : ''} ${['analysis', 'results'].includes(currentStep) ? 'completed' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">{t('diagnosis.wizard.images')}</div>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${currentStep === 'analysis' ? 'active' : ''} ${currentStep === 'results' ? 'completed' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">{t('diagnosis.wizard.analysis')}</div>
        </div>
      </div>

      {/* محتوى الخطوة */}
      <div className="wizard-content">
        {error && (
          <div className="wizard-error">
            {error}
          </div>
        )}

        {renderCurrentStep()}
      </div>

      {/* أزرار التنقل */}
      <div className="wizard-actions">
        {showCancelButton && currentStep !== 'results' && (
          <button
            className="wizard-button cancel-button"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </button>
        )}

        {currentStep !== 'category' && currentStep !== 'results' && (
          <button
            className="wizard-button back-button"
            onClick={previousStep}
          >
            {t('common.back')}
          </button>
        )}

        {currentStep !== 'results' && (
          <button
            className="wizard-button next-button"
            onClick={nextStep}
            disabled={!canProceed || isAnalyzing}
          >
            {currentStep === 'analysis' ? t('diagnosis.wizard.analyze') : t('common.next')}
          </button>
        )}

        {currentStep === 'results' && (
          <button
            className="wizard-button done-button"
            onClick={onCancel}
          >
            {t('common.done')}
          </button>
        )}
      </div>
    </div>
  );
};

// دوال مساعدة
function getCategoryIcon(category: DiseaseCategory): string {
  const icons: Record<DiseaseCategory, string> = {
    brood: '🐛',
    adult: '🐝',
    parasite: '🦠',
    virus: '🔬',
    queen: '👑',
  };
  return icons[category] || '❓';
}

function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    low: '#4caf50',
    medium: '#ffc107',
    high: '#ff9800',
    critical: '#f44336'
  };
  return colors[severity];
}

function getSeverityWidth(severity: SeverityLevel): string {
  const widths: Record<SeverityLevel, string> = {
    low: '25%',
    medium: '50%',
    high: '75%',
    critical: '100%'
  };
  return widths[severity];
}
