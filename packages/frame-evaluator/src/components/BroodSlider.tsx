/**
 * BroodSlider Component
 * مؤشر الحضنة والبيض - يعرض على الجانب السفلي للإطار
 * 
 * المواصفات:
 * - الموقع: الجانب السفلي
 * - الاتجاه: أفقي (من اليسار لليمين)
 * - النطاق: 0-100%
 * - اللون يعتمد على عمر الحضنة
 * - الأيقونة: 🐝
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { BroodSliderProps } from '../types/components';
import { useDrag } from '../hooks/useDrag';
import { DEFAULT_COLORS } from '../constants/theme';
import { BroodAge } from '../types';

/**
 * BroodSlider Component
 */
export const BroodSlider: React.FC<BroodSliderProps> = React.memo(({
  value,
  onChange,
  disabled = false,
  broodAge = 'MIXED',
  color,
  size = 'medium',
  showLabel = true,
  snapPoints = [0, 25, 50, 75, 100],
  hapticFeedback = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // استخدام hook السحب
  const { handlers, setContainerRef } = useDrag({
    value,
    onChange,
    disabled,
    orientation: 'horizontal',
    snapPoints,
    hapticFeedback,
    minValue: 0,
    maxValue: 100,
    step: 1,
    snapToGrid: true,
  });

  // تحديث مرجع الحاوية
  useEffect(() => {
    if (containerRef.current) {
      setContainerRef(containerRef.current);
    }
  }, [setContainerRef]);

  // حساب الأبعاد حسب الحجم - memoized
  const dimensions = useMemo(() => ({
    small: { height: 40, padding: 8, fontSize: 12 },
    medium: { height: 50, padding: 12, fontSize: 14 },
    large: { height: 60, padding: 16, fontSize: 16 },
  }[size]), [size]);

  // حساب لون الحضنة حسب العمر - memoized
  const broodColor = useMemo(() => color || getBroodColor(broodAge), [color, broodAge]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: dimensions.height,
        padding: dimensions.padding,
        cursor: disabled ? 'not-allowed' : 'ew-resize',
        userSelect: 'none',
        touchAction: 'none',
      }}
      {...handlers}
    >
      {/* الخلفية مع التدرج */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: getBroodGradient(broodAge),
          borderRadius: 8,
          opacity: disabled ? 0.5 : 1,
        }}
      />

      {/* شريط التقدم */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${value}%`,
          background: broodColor,
          borderRadius: 8,
          transition: 'width 0.15s ease-out',
          border: `2px solid ${DEFAULT_COLORS.brood.stroke}`,
        }}
      />

      {/* التسمية والقيمة */}
      {showLabel && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            padding: '0 12px',
            fontSize: dimensions.fontSize,
            fontWeight: 600,
            color: DEFAULT_COLORS.text,
            zIndex: 1,
          }}
        >
          <span>🐝 حضنة</span>
          <span>{value}%</span>
        </div>
      )}

      {/* نقاط الالتصاق (اختياري) */}
      {snapPoints && snapPoints.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          {snapPoints.map((point) => (
            <div
              key={point}
              style={{
                position: 'absolute',
                left: `${point}%`,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'rgba(0, 0, 0, 0.1)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

BroodSlider.displayName = 'BroodSlider';

/**
 * حساب لون الحضنة حسب العمر
 */
function getBroodColor(age: BroodAge): string {
  switch (age) {
    case 'EGGS':
      return DEFAULT_COLORS.brood.eggs;
    case 'YOUNG_LARVAE':
      return DEFAULT_COLORS.brood.youngLarvae;
    case 'OLD_LARVAE':
      return DEFAULT_COLORS.brood.oldLarvae;
    case 'CAPPED':
      return DEFAULT_COLORS.brood.capped;
    case 'MIXED':
    default:
      // للحضنة المختلطة، نستخدم لون متوسط
      return DEFAULT_COLORS.brood.youngLarvae;
  }
}

/**
 * حساب تدرج الخلفية حسب عمر الحضنة
 */
function getBroodGradient(age: BroodAge): string {
  if (age === 'MIXED') {
    // تدرج من جميع الألوان للحضنة المختلطة
    return `linear-gradient(to right, ${DEFAULT_COLORS.brood.eggs}, ${DEFAULT_COLORS.brood.youngLarvae}, ${DEFAULT_COLORS.brood.oldLarvae}, ${DEFAULT_COLORS.brood.capped})`;
  }
  
  // تدرج بسيط للأعمار الأخرى
  const color = getBroodColor(age);
  return `linear-gradient(to right, ${color}, ${color})`;
}

/**
 * التصدير الافتراضي
 */
export default BroodSlider;
