/**
 * BroodAgeSelector Component
 * محدد عمر الحضنة - يعرض على الجانب الأيمن للإطار
 * 
 * المواصفات:
 * - الموقع: الجانب الأيمن
 * - الاتجاه: عمودي (5 مراحل منفصلة)
 * - المراحل من الأسفل للأعلى:
 *   1. 🥚 بيض (EGGS)
 *   2. 🐛 يرقات صغيرة (YOUNG_LARVAE)
 *   3. 🐛 يرقات كبيرة (OLD_LARVAE)
 *   4. 🔒 مغلقة (CAPPED)
 *   5. 🔄 متنوعة (MIXED) - في المنتصف
 * - يظهر فقط عندما نسبة الحضنة > 0%
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { BroodAgeSelectorProps } from '../types/components';
import { BroodAge } from '../types';
import { DEFAULT_COLORS } from '../constants/theme';
import { useDrag } from '../hooks/useDrag';

/**
 * ترتيب المراحل من الأسفل للأعلى
 */
const BROOD_STAGES: BroodAge[] = [
  'EGGS',
  'YOUNG_LARVAE',
  'MIXED',
  'OLD_LARVAE',
  'CAPPED',
];

/**
 * معلومات كل مرحلة
 */
const STAGE_INFO: Record<BroodAge, { icon: string; label: string; color: string }> = {
  EGGS: {
    icon: '🥚',
    label: 'بيض',
    color: DEFAULT_COLORS.brood.eggs,
  },
  YOUNG_LARVAE: {
    icon: '🐛',
    label: 'يرقات صغيرة',
    color: DEFAULT_COLORS.brood.youngLarvae,
  },
  OLD_LARVAE: {
    icon: '🐛',
    label: 'يرقات كبيرة',
    color: DEFAULT_COLORS.brood.oldLarvae,
  },
  CAPPED: {
    icon: '🔒',
    label: 'مغلقة',
    color: DEFAULT_COLORS.brood.capped,
  },
  MIXED: {
    icon: '🔄',
    label: 'متنوعة',
    color: DEFAULT_COLORS.brood.youngLarvae,
  },
};

/**
 * BroodAgeSelector Component
 */
export const BroodAgeSelector: React.FC<BroodAgeSelectorProps> = React.memo(({
  value,
  onChange,
  disabled = false,
  visible = true,
  size = 'medium',
  showLabel = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // تحويل المرحلة إلى قيمة رقمية (0-4) - memoized
  const currentIndex = useMemo(() => BROOD_STAGES.indexOf(value), [value]);
  const numericValue = useMemo(() => (currentIndex / (BROOD_STAGES.length - 1)) * 100, [currentIndex]);

  // معالج التغيير - تحويل القيمة الرقمية إلى مرحلة - memoized
  const handleChange = useCallback((newValue: number) => {
    const index = Math.round((newValue / 100) * (BROOD_STAGES.length - 1));
    const clampedIndex = Math.max(0, Math.min(BROOD_STAGES.length - 1, index));
    const newStage = BROOD_STAGES[clampedIndex];
    
    if (newStage !== value) {
      onChange(newStage);
    }
  }, [value, onChange]);

  // استخدام hook السحب مع الاتجاه العمودي
  const { handlers, setContainerRef } = useDrag({
    value: numericValue,
    onChange: handleChange,
    disabled: disabled || !visible,
    orientation: 'vertical',
    snapPoints: BROOD_STAGES.map((_, i) => (i / (BROOD_STAGES.length - 1)) * 100),
    hapticFeedback: true,
    minValue: 0,
    maxValue: 100,
    step: 25, // كل مرحلة تمثل 25%
    snapToGrid: true,
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
  });

  // تحديث مرجع الحاوية
  useEffect(() => {
    if (containerRef.current) {
      setContainerRef(containerRef.current);
    }
  }, [setContainerRef]);

  // حساب الأبعاد حسب الحجم - memoized
  const dimensions = useMemo(() => ({
    small: { width: 60, padding: 8, fontSize: 11, iconSize: 16 },
    medium: { width: 80, padding: 12, fontSize: 13, iconSize: 20 },
    large: { width: 100, padding: 16, fontSize: 15, iconSize: 24 },
  }[size]), [size]);

  // إخفاء المكون إذا كان غير مرئي
  if (!visible) {
    return null;
  }

  const currentStage = STAGE_INFO[value];
  const stageHeight = 100 / BROOD_STAGES.length;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: dimensions.width,
        height: '100%',
        padding: dimensions.padding,
        cursor: disabled ? 'not-allowed' : 'ns-resize',
        userSelect: 'none',
        touchAction: 'none',
        opacity: disabled ? 0.6 : 1,
      }}
      {...handlers}
    >
      {/* الخلفية */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#F3F4F6',
          borderRadius: 8,
          border: '2px solid #E5E7EB',
        }}
      />

      {/* المراحل */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column-reverse', // من الأسفل للأعلى
          padding: '8px 4px',
        }}
      >
        {BROOD_STAGES.map((stage) => {
          const isSelected = stage === value;
          const info = STAGE_INFO[stage];
          
          return (
            <div
              key={stage}
              onClick={() => !disabled && onChange(stage)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '2px 0',
                borderRadius: 6,
                background: isSelected ? info.color : 'transparent',
                border: isSelected ? `2px solid ${DEFAULT_COLORS.brood.stroke}` : '2px solid transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                transform: isSelected && isDragging ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span style={{ fontSize: dimensions.iconSize }}>
                {info.icon}
              </span>
              {showLabel && (
                <span
                  style={{
                    fontSize: dimensions.fontSize,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? DEFAULT_COLORS.text : '#6B7280',
                    marginTop: 2,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {info.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* مؤشر المرحلة الحالية */}
      <div
        style={{
          position: 'absolute',
          left: -8,
          bottom: `${currentIndex * stageHeight}%`,
          width: 0,
          height: 0,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: `8px solid ${currentStage.color}`,
          transition: 'bottom 0.2s ease',
          pointerEvents: 'none',
        }}
      />

      {/* التسمية الجانبية */}
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: -40,
            transform: 'translateY(-50%)',
            fontSize: dimensions.fontSize,
            fontWeight: 600,
            color: DEFAULT_COLORS.text,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            whiteSpace: 'nowrap',
          }}
        >
          📅 عمر الحضنة
        </div>
      )}
    </div>
  );
});

BroodAgeSelector.displayName = 'BroodAgeSelector';

/**
 * التصدير الافتراضي
 */
export default BroodAgeSelector;
