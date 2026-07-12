/**
 * المكون الرئيسي لتقييم الإطارات
 * 
 * يجمع جميع المكونات الفرعية ويوفر واجهة شاملة لتقييم إطارات النحل
 */

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { FrameEvaluatorProps, ValidationState } from '../types';
import { useFrameEvaluator, UseFrameEvaluatorReturn } from '../hooks/useFrameEvaluator';
import { HoneySlider } from './HoneySlider';
import { BroodSlider } from './BroodSlider';
import { BeeBreadSlider } from './BeeBreadSlider';
import { BroodAgeSelector } from './BroodAgeSelector';
import { FrameRenderer } from './renderer/FrameRenderer';

/**
 * Context لمشاركة حالة التقييم بين المكونات
 */
interface FrameEvaluatorContextValue extends UseFrameEvaluatorReturn {
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const FrameEvaluatorContext = createContext<FrameEvaluatorContextValue | null>(null);

/**
 * Hook للوصول إلى context التقييم
 */
export function useFrameEvaluatorContext(): FrameEvaluatorContextValue {
  const context = useContext(FrameEvaluatorContext);
  if (!context) {
    throw new Error('useFrameEvaluatorContext must be used within FrameEvaluator');
  }
  return context;
}

/**
 * المكون الرئيسي لتقييم الإطارات
 */
export const FrameEvaluator: React.FC<FrameEvaluatorProps> = React.memo((props) => {
  const {
    initialData,
    onSave,
    onChange,
    onCancel,
    onValidationError,
    autoSave = false,
    autoSaveInterval = 5000,
    validationEngine,
    theme: _theme,
    language = 'ar',
    size = 'medium',
    readonly = false,
    showRenderer = true,
    showValidation = true,
    renderCustomHeader,
    renderCustomFooter,
    className,
    style,
  } = props;

  // استخدام hook إدارة الحالة
  const evaluator = useFrameEvaluator({
    initialData,
    onSave,
    onChange,
    onValidationError: onValidationError ? (state) => onValidationError(state.errors) : undefined,
    autoSave,
    autoSaveInterval,
    validationEngine,
  });

  // Context value - memoized
  const contextValue: FrameEvaluatorContextValue = useMemo(() => ({
    ...evaluator,
    readonly,
    size,
  }), [evaluator, readonly, size]);

  // معالج إلغاء - memoized
  const handleCancel = useCallback(() => {
    evaluator.reset();
    if (onCancel) {
      onCancel();
    }
  }, [evaluator, onCancel]);

  // الأنماط الأساسية - memoized
  const containerStyle: React.CSSProperties = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: size === 'small' ? '8px' : size === 'large' ? '24px' : '16px',
    padding: size === 'small' ? '12px' : size === 'large' ? '32px' : '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    direction: language === 'ar' ? 'rtl' : 'ltr',
    ...style,
  }), [size, language, style]);

  return (
    <FrameEvaluatorContext.Provider value={contextValue}>
      <div className={className} style={containerStyle} data-testid="frame-evaluator">
        {/* Header مخصص */}
        {renderCustomHeader && renderCustomHeader(evaluator.data, evaluator.validationState)}

        {/* عرض الإطار البصري */}
        {showRenderer && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <FrameRenderer
              data={evaluator.data}
              animated={!readonly}
              width={size === 'small' ? 300 : size === 'large' ? 600 : 400}
              height={size === 'small' ? 450 : size === 'large' ? 900 : 600}
            />
          </div>
        )}

        {/* المؤشرات */}
        {!readonly && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: size === 'small' ? '12px' : size === 'large' ? '20px' : '16px',
          }}>
            {/* مؤشر العسل */}
            <HoneySlider
              value={evaluator.data.honeyPercentage}
              onChange={evaluator.updateHoney}
              size={size}
              disabled={readonly}
            />

            {/* مؤشر الحضنة */}
            <BroodSlider
              value={evaluator.data.broodPercentage}
              onChange={evaluator.updateBrood}
              broodAge={evaluator.data.broodAge}
              size={size}
              disabled={readonly}
            />

            {/* مؤشر خبز النحل */}
            <BeeBreadSlider
              value={evaluator.data.beeBreadPercentage}
              onChange={evaluator.updateBeeBread}
              size={size}
              disabled={readonly}
            />

            {/* محدد عمر الحضنة */}
            {evaluator.data.broodPercentage > 0 && evaluator.data.broodAge && (
              <BroodAgeSelector
                value={evaluator.data.broodAge}
                onChange={evaluator.updateBroodAge}
                size={size}
                disabled={readonly}
              />
            )}
          </div>
        )}

        {/* عرض التحقق */}
        {showValidation && !evaluator.validationState.isValid && (
          <ValidationDisplay
            validationState={evaluator.validationState}
            language={language}
            size={size}
          />
        )}

        {/* أزرار التحكم */}
        {!readonly && (
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '8px',
          }}>
            {/* زر التراجع */}
            <button
              onClick={evaluator.undo}
              disabled={!evaluator.canUndo}
              style={{
                padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
                fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                cursor: evaluator.canUndo ? 'pointer' : 'not-allowed',
                opacity: evaluator.canUndo ? 1 : 0.5,
              }}
            >
              {language === 'ar' ? 'تراجع' : 'Undo'}
            </button>

            {/* زر الإعادة */}
            <button
              onClick={evaluator.redo}
              disabled={!evaluator.canRedo}
              style={{
                padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
                fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                cursor: evaluator.canRedo ? 'pointer' : 'not-allowed',
                opacity: evaluator.canRedo ? 1 : 0.5,
              }}
            >
              {language === 'ar' ? 'إعادة' : 'Redo'}
            </button>

            {/* زر إعادة التعيين */}
            <button
              onClick={evaluator.reset}
              disabled={!evaluator.isDirty}
              style={{
                padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
                fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                cursor: evaluator.isDirty ? 'pointer' : 'not-allowed',
                opacity: evaluator.isDirty ? 1 : 0.5,
              }}
            >
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </button>

            {/* زر الإلغاء */}
            {onCancel && (
              <button
                onClick={handleCancel}
                style={{
                  padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
                  fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            )}

            {/* زر الحفظ */}
            {onSave && (
              <button
                onClick={evaluator.save}
                disabled={!evaluator.data.isValid || !evaluator.isDirty || evaluator.isSaving}
                style={{
                  padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
                  fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: evaluator.data.isValid && evaluator.isDirty ? '#10b981' : '#d1d5db',
                  color: '#ffffff',
                  cursor: evaluator.data.isValid && evaluator.isDirty ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                }}
              >
                {evaluator.isSaving 
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                  : (language === 'ar' ? 'حفظ' : 'Save')}
              </button>
            )}
          </div>
        )}

        {/* Footer مخصص */}
        {renderCustomFooter && renderCustomFooter(evaluator.data, evaluator.validationState)}
      </div>
    </FrameEvaluatorContext.Provider>
  );
});

FrameEvaluator.displayName = 'FrameEvaluator';

/**
 * مكون عرض التحقق
 */
interface ValidationDisplayProps {
  validationState: ValidationState;
  language: 'ar' | 'en';
  size?: 'small' | 'medium' | 'large';
}

const ValidationDisplay: React.FC<ValidationDisplayProps> = ({ validationState, language, size = 'medium' }) => {
  if (validationState.isValid) {
    return null;
  }

  return (
    <div style={{
      padding: size === 'small' ? '8px' : size === 'large' ? '16px' : '12px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '4px',
    }}>
      {/* الأخطاء */}
      {validationState.errors.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
            fontWeight: 'bold',
            color: '#dc2626',
            marginBottom: '4px',
          }}>
            {language === 'ar' ? 'أخطاء:' : 'Errors:'}
          </div>
          <ul style={{ margin: 0, paddingInlineStart: '20px' }}>
            {validationState.errors.map((error, index) => (
              <li key={index} style={{
                fontSize: size === 'small' ? '11px' : size === 'large' ? '14px' : '12px',
                color: '#dc2626',
              }}>
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* التحذيرات */}
      {validationState.warnings.length > 0 && (
        <div>
          <div style={{
            fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
            fontWeight: 'bold',
            color: '#f59e0b',
            marginBottom: '4px',
          }}>
            {language === 'ar' ? 'تحذيرات:' : 'Warnings:'}
          </div>
          <ul style={{ margin: 0, paddingInlineStart: '20px' }}>
            {validationState.warnings.map((warning, index) => (
              <li key={index} style={{
                fontSize: size === 'small' ? '11px' : size === 'large' ? '14px' : '12px',
                color: '#f59e0b',
              }}>
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* الاقتراحات */}
      {validationState.suggestions.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{
            fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: '4px',
          }}>
            {language === 'ar' ? 'اقتراحات:' : 'Suggestions:'}
          </div>
          <ul style={{ margin: 0, paddingInlineStart: '20px' }}>
            {validationState.suggestions.map((suggestion, index) => (
              <li key={index} style={{
                fontSize: size === 'small' ? '11px' : size === 'large' ? '14px' : '12px',
                color: '#3b82f6',
              }}>
                {suggestion.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
